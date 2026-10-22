import { ActivityType } from 'premid'
import { AccountIcons } from './account-icons.js'
import { ActivityAssets, StaticImageUrls } from './image-assets.js'
import { getMccLiveData, mccLiveSelection } from './mcc-live.js'
import { applyWikiImageFallback, getWikiData, wikiCanPublish, wikiSelection } from './mcc-wiki.js'

const presence = new Presence({
  clientId: '1515363968359731331',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)
const imageCache = new Map<string, Promise<Blob | undefined>>()
let forumListDocument: Promise<Document | undefined> | undefined
let updateSequence = 0
let publishingActivity = false
const letterAvatars = new Map<string, Blob>()

function findForumInfo(source: Document, node?: string, category?: string): { icon?: string, name?: string } {
  let image: HTMLImageElement | null = null
  let name: string | undefined
  if (node) {
    image = source.querySelector<HTMLImageElement>(`.node--id${node} .node-icon img`)
    name = cleanText(source.querySelector(`.node--id${node} .node-title a`)?.textContent)
    if (!image) {
      const link = Array.from(source.querySelectorAll<HTMLAnchorElement>('.subNodeLink[href]'))
        .find(anchor => new URL(anchor.href, document.location.href).pathname.match(/\.(\d+)\/?$/)?.[1] === node)
      image = link?.querySelector<HTMLImageElement>('img') ?? null
      name ??= cleanText(link?.textContent)
    }
  }
  else if (category) {
    const link = Array.from(source.querySelectorAll<HTMLAnchorElement>('.uix_categoryTitle[href]'))
      .find((anchor) => {
        const hash = new URL(anchor.href, document.location.href).hash
        return category.endsWith('.') ? hash.startsWith(category) : hash === category
      })
    image = link?.closest('.block--category')?.querySelector<HTMLImageElement>('.uix_categoryStrip__icon img') ?? null
    name = cleanText(link?.textContent)
  }
  const src = image?.getAttribute('src')
  if (!src)
    return { name }
  const url = new URL(src, new URL('/feeds/', document.location.href))
  return { name, icon: url.protocol === 'https:' ? url.href : undefined }
}

async function getForumInfo(path: string): Promise<{ icon?: string, name?: string } | undefined> {
  const node = path.match(/^\/forums\/(?:[^/]*\.)?(\d+)(?:\/|$)/)?.[1]
  const category = document.location.hash && /^#[\w-]+\.\d+$/.test(document.location.hash)
    ? document.location.hash
    : /^\/feeds\/mcc-island\.10(?:\/|$)/.test(path)
      ? '#mcc-island.'
      : /^\/feeds\/mcc-event\.11(?:\/|$)/.test(path) ? '#mcc-event.' : undefined
  if (!node && !category)
    return undefined
  const current = findForumInfo(document, node, category)
  if (current.icon || current.name)
    return current
  if (!forumListDocument) {
    forumListDocument = fetch(new URL('/feeds/', document.location.href).href, { signal: AbortSignal.timeout(10000) })
      .then(async (response) => {
        if (!response.ok)
          throw new Error('Forum list unavailable')
        return new DOMParser().parseFromString(await response.text(), 'text/html')
      })
      .catch(() => {
        forumListDocument = undefined
        return undefined
      })
  }
  const source = await forumListDocument
  return source ? findForumInfo(source, node, category) : undefined
}

function resolveImage(image: string | Blob): Promise<string | Blob | undefined> {
  if (typeof image === 'string' && StaticImageUrls.has(image))
    return Promise.resolve(image)
  if (image instanceof Blob)
    return Promise.resolve(image)
  if (!image)
    return Promise.resolve(undefined)
  const cached = imageCache.get(image)
  if (cached)
    return cached
  // Let PreMiD handle image bytes instead of sending the image-host URL to Discord.
  const pending = fetch(image, { signal: AbortSignal.timeout(10000) })
    .then(async (response) => {
      if (!response.ok)
        throw new Error(`Image request failed: ${response.status}`)
      const blob = await response.blob()
      if (!blob.type.startsWith('image/') || !blob.size)
        throw new Error('Invalid image response')
      return blob
    })
    .catch(() => {
      imageCache.delete(image)
      return undefined
    })
  imageCache.set(image, pending)
  return pending
}

const islandNodes = new Set([65, 73, 76, 77, 78, 79, 80, 81, 82, 94, 99, 128, 133, 137, 141])
const eventNodes = new Set([72, 83, 84, 85, 86])
const accountPages: Record<string, { details: string, changing?: boolean, icon?: string | Blob, tooltip?: string }> = {
  '/account': { details: 'Changing account settings', changing: true, icon: AccountIcons.Account, tooltip: 'Account settings' },
  '/account/account-details': { details: 'Changing account settings', changing: true, icon: AccountIcons.Account, tooltip: 'Account settings' },
  '/account/reactions': { details: 'Looking at reactions', icon: AccountIcons.Reactions, tooltip: 'Reactions' },
  '/account/alerts': { details: 'Looking at alerts', icon: AccountIcons.Alerts, tooltip: 'Alerts' },
  '/account/privacy': { details: 'Changing privacy settings', changing: true, icon: AccountIcons.Privacy, tooltip: 'Privacy settings' },
  '/account/preferences': { details: 'Changing preferences', changing: true },
  '/account/following': { details: 'Looking at followed users' },
  '/account/ignored': { details: 'Looking at ignored users' },
  '/account/bookmarks': { details: 'Looking at own bookmarks', icon: AccountIcons.Bookmarks, tooltip: 'Bookmarks' },
}

const strings = {
  bugReport: 'Reporting a bug...',
  ownBugReports: 'Looking at own bug reports',
  viewingBugReport: 'Looking at a bug report',
  bugReportsCategory: 'Bug Reports',
  creatingForumPost: 'Creating a forum post',
  eventHome: 'Looking at event page',
  feedback: 'Looking at feedback',
  feedbackPost: 'Looking at feedback',
  forums: 'Looking at forums',
  category: 'Looking at category',
  patchNote: 'Looking at Patch Note',
  changes: 'Looking at changes',
  patchNotesAndChanges: 'Looking at Patch Notes and changes',
  forumList: 'Forum list',
  forumOverview: 'Choosing forum category',
  homepage: 'Choosing',
  homepageChoice: 'Event or Island?',
  islandHome: 'Exploring',
  privacyForumPost: 'Looking at a forum post',
  privacyProfile: 'Looking at a profile',
  watchingProfile: 'Looking at profile',
  rules: 'Looking at',
  rulesPage: 'Rules',
  watchingForumPost: 'Looking at forum post',
} as const

function cleanText(text?: string | null): string | undefined {
  return text?.replace(/\s+/g, ' ').trim() || undefined
}

function getPageTitle(): string | undefined {
  const heading = document.querySelector<HTMLHeadingElement>(
    'h1.p-title-value, .p-title h1',
  )

  return cleanText(heading?.textContent)
}

function normalizedPath(): string {
  return document.location.pathname.toLowerCase().replace(/\/{2,}/g, '/').replace(/\/+$/, '') || '/'
}

function isBugReportPage(path: string): boolean {
  return /^\/forums\/(?:bug-report\.99|99)(?:\/|$)/.test(path)
    || /^\/form\/4(?:\/|$)/.test(path)
    || document.documentElement.getAttribute('data-container-key') === 'node-99'
    || Array.from(document.querySelectorAll<HTMLAnchorElement>('.p-breadcrumbs a[href]')).some((anchor) => {
      const url = new URL(anchor.href, document.location.href)
      return url.hostname === document.location.hostname
        && /^\/forums\/(?:bug-report\.99|99)(?:\/|$)/.test(url.pathname)
    })
}

function isFeedbackPage(path: string): boolean {
  return /^\/forums\/(?:[^/]*\.)?98(?:\/|$)/.test(path)
}

function isForumLanding(path: string): boolean {
  return path === '/feeds' || path === '/forums'
}

function isForumOverview(path: string): boolean {
  return (isForumLanding(path) || path === '/forums/-/list')
    && !/^#[\w-]+\.\d+$/.test(document.location.hash)
}

function isForumPage(path: string): boolean {
  return /^\/(?:forums|feeds|whats-new)(?:\/|$)/.test(path)
}

function isProfilePage(path: string): boolean {
  return /^\/members\/(?:[^/]+\.)?\d+(?:\/|$)/.test(path)
}

function getProfile(): { name?: string, avatar?: string } {
  const name = cleanText(document.querySelector(
    '.memberHeader-name .username, .memberHeader h1 .username, .memberHeader-name, .memberHeader h1',
  )?.textContent)
  const image = document.querySelector<HTMLImageElement>('.memberHeader-avatar img')
  const source = image?.currentSrc || image?.getAttribute('src')
  if (!source)
    return { name }
  const url = new URL(source, document.location.href)
  return { name, avatar: url.protocol === 'https:' ? url.href : undefined }
}

async function getThreadAuthor(): Promise<{ name?: string, avatar?: HTMLImageElement | Blob }> {
  // Never substitute a reply author when the original post is not on this page.
  const post = document.querySelector<HTMLElement>('.message-threadStarterPost, article.message--article')
  if (!post)
    return {}
  const name = cleanText(post.getAttribute('data-author'))
    ?? cleanText(post.querySelector('.message-userDetails .username, .message-attribution-user .username, .message-articleUserName .username')?.textContent)
  const image = post.querySelector<HTMLImageElement>('.message-avatar img, .message-attribution-user .avatar img, .message-articleUserInfo .avatar img')
  const source = image?.currentSrc
    || image?.getAttribute('srcset')?.trim().split(/\s+/)[0]
    || image?.getAttribute('src')
  if (!source) {
    const placeholder = post.querySelector<HTMLElement>('.message-avatar .avatar--default, .message-attribution-user .avatar--default, .message-articleUserInfo .avatar--default')
    const letter = cleanText(placeholder?.querySelector('[role=\'img\']')?.textContent)?.slice(0, 4)
    if (!placeholder || !letter)
      return { name }
    const background = placeholder.style.backgroundColor || '#666666'
    const foreground = placeholder.style.color || '#ffffff'
    const key = JSON.stringify([letter, background, foreground])
    const cached = letterAvatars.get(key)
    if (cached)
      return { name, avatar: cached }
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 512
    const context = canvas.getContext('2d')
    if (!context)
      return { name }
    context.fillStyle = background
    context.fillRect(0, 0, 512, 512)
    context.fillStyle = foreground
    context.font = '320px sans-serif'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText(letter, 256, 272, 448)
    const avatar = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'))
    if (avatar)
      letterAvatars.set(key, avatar)
    return { name, avatar: avatar ?? undefined }
  }
  const url = new URL(source, document.location.href)
  // Pass the original page image through PreMiD's native image handling.
  return { name, avatar: url.protocol === 'https:' ? image ?? undefined : undefined }
}

function nodeBrand(node: number): 'island' | 'event' | undefined {
  if (islandNodes.has(node))
    return 'island'
  if (eventNodes.has(node))
    return 'event'
}

function urlBrand(url: URL): 'island' | 'event' | undefined {
  if (/^\/(?:island|feeds\/mcc-island\.10)(?:\/|$)/.test(url.pathname))
    return 'island'
  if (/^\/(?:event|feeds\/mcc-event\.11)(?:\/|$)/.test(url.pathname))
    return 'event'
  if (/^\/(?:feeds|forums)(?:\/|$)/.test(url.pathname)) {
    if (/^#mcc-island\.\d+$/.test(url.hash))
      return 'island'
    if (/^#mcc-event\.\d+$/.test(url.hash))
      return 'event'
  }
  const node = url.pathname.match(/^\/forums\/(?:[^/]*\.)?(\d+)(?:\/|$)/)?.[1]
  return node ? nodeBrand(Number(node)) : undefined
}

function getBrand(): 'island' | 'event' {
  const direct = urlBrand(new URL(document.location.href))
  if (direct)
    return direct
  const node = document.documentElement.getAttribute('data-container-key')?.match(/^node-(\d+)$/)?.[1]
  const containerBrand = node ? nodeBrand(Number(node)) : undefined
  if (containerBrand)
    return containerBrand
  // Only ancestors identify a thread's category; sidebar links are unrelated.
  const breadcrumbs = Array.from(document.querySelectorAll<HTMLAnchorElement>('.p-breadcrumbs a[href]')).reverse()
  for (const anchor of breadcrumbs) {
    const url = new URL(anchor.href, document.location.href)
    if (url.hostname !== document.location.hostname)
      continue
    const brand = urlBrand(url)
    if (brand)
      return brand
  }
  return 'event'
}

function isThreadPage(path: string): boolean {
  return path.startsWith('/threads/')
}

function getThreadContainer(): string | undefined {
  const container = document.documentElement.getAttribute('data-container-key')
  if (/^node-\d+$/.test(container ?? ''))
    return container ?? undefined
  // The nearest forum breadcrumb is a fallback when the root metadata is absent.
  for (const anchor of Array.from(document.querySelectorAll<HTMLAnchorElement>('.p-breadcrumbs a[href]')).reverse()) {
    const url = new URL(anchor.href, document.location.href)
    const node = url.pathname.match(/^\/forums\/(?:[^/]*\.)?(\d+)(?:\/|$)/)?.[1]
    if (url.hostname === document.location.hostname && node)
      return `node-${node}`
  }
}

function isCreatingThread(path: string): boolean {
  return path.includes('/post-thread')
    || path.includes('/create-thread')
    || path.includes('/threads/add')
    || !!document.querySelector(
      'form[action*=\'post-thread\'], form[action*=\'create-thread\'], input[name=\'title\']',
    )
}

function getMccLogo(setting: number): string | Blob {
  return [
    ActivityAssets.MccRed,
    ActivityAssets.MccIconColor,
    ActivityAssets.MccInitialsIconColor,
    ActivityAssets.MccInitialsColor,
  ][setting] ?? ActivityAssets.MccRed
}

function getMcciLogo(setting: number): string | Blob {
  return [
    ActivityAssets.McciBlue,
    ActivityAssets.McciIsland,
    ActivityAssets.MccIconColor,
  ][setting] ?? ActivityAssets.McciIsland
}

function setButton(presenceData: PresenceData, label: string): void {
  const url = new URL(document.location.href)
  url.search = ''
  url.hash = ''
  presenceData.buttons = [
    {
      label,
      url: url.href,
    },
  ]
}

presence.on('UpdateData', async () => {
  // Embedded pages must not overwrite the top-level page's activity.
  if (window.self !== window.top)
    return

  const wiki = /^(?:www\.)?mccisland\.wiki$/i.test(document.location.hostname)
  if (wiki && !wikiCanPublish())
    return

  // PreMiD mutates its internal activity while asynchronously uploading images.
  // Never start another publication until that operation has completed.
  if (publishingActivity)
    return

  const sequence = ++updateSequence

  const pageUrl = document.location.href
  const [
    privacySetting,
    showTimestamp,
    showButtons,
    mccLogo,
    mcciLogo,
    wikiLogo,
  ] = await Promise.all([
    presence.getSetting<boolean>('privacy').catch(() => true),
    presence.getSetting<boolean>('showTimestamp').catch(() => true),
    presence.getSetting<boolean>('showButtons').catch(() => true),
    presence.getSetting<number>('mccLogo').catch(() => 0),
    presence.getSetting<number>('mcciLogo').catch(() => 1),
    presence.getSetting<number>('wikiLogo').catch(() => 0),
  ])

  if (document.location.href !== pageUrl)
    return

  const privacy = privacySetting !== false
  const mccLive = /^(?:www\.)?mcc\.live$/i.test(document.location.hostname)
  const selectedWikiPage = wiki ? wikiSelection() : undefined
  const liveSelection = mccLive ? mccLiveSelection() : undefined
  const path = normalizedPath()
  const island = getBrand() === 'island'
  const forum = isForumPage(path) || isThreadPage(path)
  const brandName = island ? 'MCC Island' : 'Minecraft Championship'
  const feedback = isFeedbackPage(path) || (isThreadPage(path) && getThreadContainer() === 'node-98')
  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    name: feedback ? 'Minecraft Championship + Island Forum' : forum ? `${brandName} Forum` : brandName,
    largeImageKey: island ? getMcciLogo(mcciLogo) : getMccLogo(mccLogo),
    largeImageText: island ? 'MCC Island' : 'Minecraft Championship',
  }

  if (showTimestamp)
    presenceData.startTimestamp = browsingTimestamp

  switch (true) {
    case wiki: {
      Object.assign(presenceData, await getWikiData(privacy, showButtons, wikiLogo))
      break
    }
    case mccLive: {
      Object.assign(presenceData, getMccLiveData(privacy))
      presenceData.largeImageKey = ActivityAssets.MccRed
      presenceData.largeImageText = 'Minecraft Championship'
      break
    }
    case isBugReportPage(path): {
      presenceData.name = forum ? 'MCC Island Forum' : 'MCC Island'
      presenceData.details = /^\/form\/4(?:\/|$)/.test(path) || /\/(?:post-thread|create-thread)(?:\/|$)/.test(path)
        ? strings.bugReport
        : isThreadPage(path) ? strings.viewingBugReport : strings.ownBugReports
      presenceData.largeImageKey = getMcciLogo(mcciLogo)
      presenceData.largeImageText = 'MCC Island'
      // Only the public forum index is consulted, never a report's content.
      const info = await getForumInfo('/forums/bug-report.99')
      presenceData.smallImageKey = info?.icon ?? ActivityAssets.MccInitialsColor
      presenceData.smallImageText = strings.bugReportsCategory
      break
    }
    case /^\/conversations(?:\/|$)/.test(path):
    case Boolean(accountPages[path]): {
      const page = accountPages[path]
      presenceData.name = 'Minecraft Championship'
      presenceData.details = page?.details ?? 'Looking at Conversations'
      presenceData.largeImageKey = ActivityAssets.MccRed
      presenceData.largeImageText = 'Minecraft Championship'
      presenceData.smallImageKey = page?.icon ?? (page ? ActivityAssets.MccInitialsColor : AccountIcons.Conversations)
      presenceData.smallImageText = page?.tooltip ?? (page ? 'MCC + Island' : 'Conversations')
      if (page?.changing && !page.icon) {
        const info = await getForumInfo('/forums/bug-report.99')
        presenceData.smallImageKey = info?.icon ?? ActivityAssets.MccInitialsColor
        presenceData.smallImageText = 'Account settings'
      }
      // Account pages and conversations only expose a generic action, never content or buttons.
      break
    }
    case isProfilePage(path): {
      presenceData.name = 'Minecraft Championship + Island Forum Profile'
      presenceData.details = strings.privacyProfile
      presenceData.smallImageKey = ActivityAssets.MccIconColor
      presenceData.smallImageText = 'MCC + Island Forum'
      if (!privacy) {
        const profile = getProfile()
        if (profile.name) {
          presenceData.details = strings.watchingProfile
          presenceData.state = profile.name.slice(0, 128)
          presenceData.largeImageText = profile.name
          if (profile.avatar)
            presenceData.largeImageKey = profile.avatar
          if (showButtons)
            setButton(presenceData, 'View Profile')
        }
      }
      break
    }
    case path === '/':
    case path === '/index.php':
    case path === '/index.html': {
      presenceData.details = strings.homepage
      presenceData.state = strings.homepageChoice
      break
    }
    case path === '/island': {
      presenceData.name = 'MCC Island'
      presenceData.details = strings.islandHome
      presenceData.state = 'MCC Island'
      presenceData.largeImageKey = getMcciLogo(mcciLogo)
      presenceData.largeImageText = 'MCC Island'
      if (showButtons && !privacy)
        setButton(presenceData, 'View MCC Island')
      break
    }
    case path === '/event': {
      presenceData.name = 'Minecraft Championship'
      presenceData.details = strings.eventHome
      presenceData.state = 'Minecraft Championship'
      if (showButtons && !privacy)
        setButton(presenceData, 'View MCC')
      break
    }
    case path === '/help/rules': {
      presenceData.details = strings.rules
      presenceData.state = strings.rulesPage
      if (showButtons && !privacy)
        setButton(presenceData, 'View Rules')
      break
    }
    case isForumOverview(path): {
      presenceData.details = strings.forums
      presenceData.state = strings.forumOverview
      presenceData.smallImageKey = ActivityAssets.MccInitialsColor
      presenceData.smallImageText = 'MCC + Island Forum'
      if (showButtons && !privacy)
        setButton(presenceData, 'View Forums')
      break
    }
    case forum && isCreatingThread(path): {
      presenceData.details = privacy
        ? strings.privacyForumPost
        : strings.creatingForumPost
      break
    }
    case isThreadPage(path): {
      // Wait for the forum identity before publishing any thread title or URL.
      const container = getThreadContainer()
      if (!/^node-\d+$/.test(container ?? '')) {
        presence.clearActivity()
        return
      }
      const title = getPageTitle()
      presenceData.details = privacy || !title
        ? strings.privacyForumPost
        : strings.watchingForumPost
      if (!privacy && title) {
        if (container === 'node-73') {
          presenceData.details = /\bpatch\s+notes?\b/i.test(title)
            ? strings.patchNote
            : strings.changes
        }
        else if (container === 'node-98') {
          presenceData.details = strings.feedbackPost
        }
        presenceData.state = title.slice(0, 128)
        const author = await getThreadAuthor()
        if (author.avatar && author.name) {
          presenceData.smallImageKey = author.avatar
          presenceData.smallImageText = author.name.slice(0, 128)
        }
      }
      if (showButtons && !privacy)
        setButton(presenceData, 'View Forum Post')
      break
    }
    case isFeedbackPage(path): {
      const info = privacy ? undefined : await getForumInfo(path)
      presenceData.details = privacy ? strings.forums : strings.category
      if (!privacy)
        presenceData.state = (info?.name ?? strings.feedback).slice(0, 128)
      presenceData.smallImageKey = info?.icon ?? ActivityAssets.MccInitialsColor
      presenceData.smallImageText = typeof presenceData.state === 'string' ? presenceData.state : `${brandName} Forum`
      if (showButtons && !privacy)
        setButton(presenceData, 'View Feedback')
      break
    }
    case isForumLanding(path):
    case isForumPage(path): {
      const info = privacy ? undefined : await getForumInfo(path)
      presenceData.details = privacy
        ? strings.forums
        : /^\/forums\/(?:[^/]*\.)?73(?:\/|$)/.test(path)
          ? strings.patchNotesAndChanges
          : info?.name || /^\/forums\/(?:[^/]*\.)?\d+(?:\/|$)/.test(path)
            ? strings.category
            : strings.forums
      if (!privacy) {
        const heading = cleanText(document.querySelector('.p-title-value, h1')?.textContent)
        presenceData.state = (info?.name ?? heading ?? strings.forumList).slice(0, 128)
      }
      presenceData.smallImageKey = info?.icon ?? ActivityAssets.MccInitialsColor
      presenceData.smallImageText = typeof presenceData.state === 'string' ? presenceData.state : `${brandName} Forum`
      if (showButtons && !privacy)
        setButton(presenceData, 'View Forums')
      break
    }
    default: {
      presenceData.name = 'Minecraft Championship'
      presenceData.details = 'Browsing the website'
      presenceData.largeImageKey = ActivityAssets.MccRed
      presenceData.largeImageText = 'Minecraft Championship'
      presenceData.smallImageKey = ActivityAssets.MccInitialsColor
      presenceData.smallImageText = 'MCC + Island'
      break
    }
  }

  if (!presenceData.smallImageKey && (privacy || !isBugReportPage(path))) {
    presenceData.smallImageKey = ActivityAssets.MccInitialsColor
    presenceData.smallImageText = 'MCC + Island'
  }

  if (document.location.href !== pageUrl)
    return

  const image = presenceData.largeImageKey
  const resolvedImage = image instanceof Blob || typeof image === 'string'
    ? await resolveImage(image)
    : undefined

  if (document.location.href !== pageUrl)
    return

  if (resolvedImage) {
    presenceData.largeImageKey = resolvedImage
  }
  else {
    delete presenceData.largeImageKey
    delete presenceData.largeImageText
  }

  const smallImage = presenceData.smallImageKey
  if (smallImage instanceof Blob || typeof smallImage === 'string') {
    const resolvedSmallImage = await resolveImage(smallImage)
    if (resolvedSmallImage) {
      presenceData.smallImageKey = resolvedSmallImage
    }
    else {
      if (wiki) {
        applyWikiImageFallback(presenceData)
      }
      else if (!isForumOverview(path) && smallImage !== ActivityAssets.MccInitialsColor) {
        delete presenceData.smallImageKey
        delete presenceData.smallImageText
      }
    }
  }

  if (document.location.href !== pageUrl)
    return

  if (mccLive && mccLiveSelection() !== liveSelection)
    return

  if (wiki && (!wikiCanPublish() || wikiSelection() !== selectedWikiPage))
    return

  if (sequence !== updateSequence)
    return

  publishingActivity = true
  try {
    await presence.setActivity(presenceData)
  }
  finally {
    publishingActivity = false
  }
})
