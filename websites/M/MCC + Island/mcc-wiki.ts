import { Eyes, Logo, TransparentLogo } from './wiki-assets.js'

const preferenceSections: Record<string, string> = {
  personal: 'Changing user settings',
  rendering: 'Changing appearance settings',
  editing: 'Changing editing preferences',
  rc: 'Changing recent changes preferences',
  watchlist: 'Changing watchlist preferences',
  search: 'Changing search preferences',
  searchoptions: 'Changing search preferences',
  misc: 'Changing miscellaneous preferences',
  gadgets: 'Changing gadget preferences',
}

const specialPages: Record<string, string> = {
  recentchanges: 'Looking at recent changes',
  recentchangeslinked: 'Looking at related changes',
  allpages: 'Looking at all pages',
  prefixindex: 'Looking at pages by prefix',
  categories: 'Looking at categories',
  listfiles: 'Looking at files',
  newimages: 'Looking at recent uploads',
  newpages: 'Looking at new pages',
  specialpages: 'Looking at special pages',
  statistics: 'Looking at wiki statistics',
  version: 'Looking at wiki software information',
  whatlinkshere: 'Looking at links to a page',
  contributions: 'Looking at contributions',
  log: 'Looking at wiki logs',
  upload: 'Uploading a file',
  uploadwizard: 'Uploading files',
  userlogin: 'Logging in',
  createaccount: 'Creating an account',
  userlogout: 'Logging out',
  watchlist: 'Looking at own watchlist',
  editwatchlist: 'Changing own watchlist',
  notifications: 'Looking at notifications',
  emailuser: 'Writing a message',
  changepassword: 'Changing password',
  passwordreset: 'Resetting password',
  changeemail: 'Changing email settings',
  contact: 'Contacting the wiki',
}

// Only these public index pages can have a button. Account tools never share URLs.
const publicSpecialPages = new Set([
  'recentchanges',
  'recentchangeslinked',
  'allpages',
  'prefixindex',
  'categories',
  'listfiles',
  'newimages',
  'newpages',
  'specialpages',
  'statistics',
  'version',
])

interface WikiIcon {
  image: string
  page: string
}

const iconIndexes = new Map<string, Promise<Map<string, WikiIcon>>>()

function text(value?: string | null): string | undefined {
  return value?.replace(/\s+/g, ' ').trim().slice(0, 128) || undefined
}

function pageName(url: URL): string {
  let title = url.searchParams.get('title')
  if (!title) {
    try {
      title = decodeURIComponent(url.pathname.replace(/^\/(?:wiki\/)?/, ''))
    }
    catch {
      title = ''
    }
  }
  return title.replace(/_/g, ' ').replace(/\/+$/, '') || 'Home'
}

function preferenceSection(): string {
  const panel = document.querySelector('.oo-ui-tabPanelLayout-active .mw-prefs-section-fieldset[id]')
  const hash = document.location.hash.replace(/^#/, '')
  return panel?.id.replace(/^mw-prefsection-/, '')
    || (/^mw-prefsection-[a-z]+$/.test(hash) ? hash.replace(/^mw-prefsection-/, '') : '')
}

export function wikiSelection(): string {
  return JSON.stringify([
    document.location.href,
    document.documentElement.classList.contains('ve-active-visual'),
    document.documentElement.classList.contains('ve-active-wikitext'),
    preferenceSection(),
  ])
}

export function wikiCanPublish(): boolean {
  // Other wiki tabs must not replace the visible tab's activity or clear it.
  return document.visibilityState !== 'hidden'
    && !(document as Document & { prerendering?: boolean }).prerendering
}

function ownImage(source?: string | null): string | undefined {
  if (!source)
    return undefined
  try {
    const url = new URL(source, document.location.href)
    if (url.protocol === 'https:' && url.hostname === document.location.hostname
      && url.pathname.startsWith('/images/')) {
      return url.href
    }
  }
  catch {}
}

function imageSource(image?: HTMLImageElement | null): string | undefined {
  const candidates = [
    image?.currentSrc,
    image?.getAttribute('src'),
    image?.getAttribute('srcset')?.split(',')[0]?.trim().split(/\s+/)[0],
    image?.getAttribute('data-src'),
  ]
  for (const candidate of candidates) {
    const owned = ownImage(candidate)
    if (owned)
      return owned
  }
}

function readPageIcons(source: Document, base: string): Map<string, WikiIcon> {
  const icons = new Map<string, WikiIcon>()
  for (const anchor of source.querySelectorAll<HTMLAnchorElement>('#mw-content-text .mw-parser-output a[href]')) {
    const image = anchor.querySelector<HTMLImageElement>('img')
    const width = Number(image?.getAttribute('width'))
    const src = imageSource(image)
    if (!src || width < 16 || width > 160)
      continue
    try {
      const url = new URL(anchor.getAttribute('href')!, base)
      if (url.origin === document.location.origin && !url.search && !url.hash)
        icons.set(pageName(url).toLowerCase(), { image: src, page: url.href })
    }
    catch {}
  }
  return icons
}

function indexIcons(url: string): Promise<Map<string, WikiIcon>> {
  const cached = iconIndexes.get(url)
  if (cached)
    return cached
  const pending = fetch(url, { signal: AbortSignal.timeout(4000) })
    .then(async (response) => {
      if (!response.ok)
        throw new Error('Wiki index unavailable')
      return readPageIcons(new DOMParser().parseFromString(await response.text(), 'text/html'), url)
    })
    .catch(() => {
      iconIndexes.delete(url)
      return new Map<string, WikiIcon>()
    })
  if (iconIndexes.size >= 8)
    iconIndexes.delete(iconIndexes.keys().next().value!)
  iconIndexes.set(url, pending)
  return pending
}

async function pageIcon(title: string): Promise<string | undefined> {
  // Portable infoboxes put the actual icon in the title, above a larger banner.
  const titleImage = document.querySelector<HTMLImageElement>(
    '#mw-content-text .portable-infobox .pi-title img, #mw-content-text .infobox .infobox-title img',
  )
  const titleIcon = imageSource(titleImage)
  if (titleIcon)
    return titleIcon
  const image = document.querySelector<HTMLImageElement>(
    '#mw-content-text .infobox-image img, #mw-content-text .infobox img, #mw-content-text .pi-image img',
  )
  const icon = imageSource(image)
  if (icon && !/[/_-]banner[._-]/i.test(new URL(icon).pathname))
    return icon
  const key = title.toLowerCase()
  const current = readPageIcons(document, document.location.href).get(key)
  if (current)
    return current.image
  let index = await indexIcons(new URL('/', document.location.href).href)
  const visited = new Set<string>()
  // Follow only real, title-related hub links, with a strict depth bound. No wiki crawl.
  for (let depth = 0; depth < 4; depth++) {
    const exact = index.get(key)
    if (exact)
      return exact.image
    const parent = [...index.entries()]
      .filter(([name, entry]) => (key.startsWith(`${name} `) || key.startsWith(`${name}/`))
        && !visited.has(entry.page) && !/^[^/]+:/.test(name))
      .sort(([left], [right]) => right.length - left.length)[0]?.[1]
    if (!parent)
      break
    visited.add(parent.page)
    index = await indexIcons(parent.page)
  }
}

export function applyWikiImageFallback(data: PresenceData): void {
  data.smallImageKey = Eyes
  data.smallImageText = 'Watching the MCCI Wiki'
  delete data.smallImageUrl
}

export async function getWikiData(privacy: boolean, showButtons: boolean, logo: number): Promise<Partial<PresenceData>> {
  const url = new URL(document.location.href)
  const title = pageName(url)
  const isHome = title.toLowerCase() === 'home' || title === 'index.php'
  const special = /^Special:/i.test(title) ? title.slice(8).split('/')[0]!.toLowerCase() : undefined
  const action = url.searchParams.get('action')?.toLowerCase() || 'view'
  const heading = () => {
    const current = text(document.querySelector('#firstHeadingTitle, #firstHeading .mw-page-title-main, #firstHeading')?.textContent)
    const normalize = (value: string) => value.replace(/^[^:]+:/, '').replace(/_/g, ' ').toLowerCase()
    // During navigation the old heading can outlive its URL. Never publish that title.
    return current && normalize(current) === normalize(title) ? current : text(title)
  }
  const data: Partial<PresenceData> = {
    name: 'MCC Island Wiki',
    largeImageKey: logo === 1 ? TransparentLogo : Logo,
    largeImageText: 'MCC Island Wiki',
    smallImageKey: Eyes,
    smallImageText: 'Watching the MCCI Wiki',
    details: 'Browsing the wiki',
  }
  let publicPage = false
  let showIcon = false

  if (special === 'preferences' || document.querySelector('#preferences')) {
    data.details = preferenceSections[preferenceSection()] ?? 'Changing wiki preferences'
  }
  else if (special === 'search' || url.searchParams.has('search')) {
    data.details = 'Searching the wiki'
    if (!privacy)
      data.state = text(url.searchParams.get('search'))
  }
  else if (special) {
    data.details = specialPages[special] ?? 'Looking at a special page'
    publicPage = publicSpecialPages.has(special)
  }
  else if (document.documentElement.classList.contains('ve-active-visual')) {
    data.details = 'Editing a wiki page'
    if (!privacy)
      data.state = text(title)
  }
  else if (action === 'edit' || action === 'submit' || url.searchParams.has('veaction')
    || document.querySelector('#wpTextbox1')) {
    data.details = url.searchParams.get('veaction') === 'edit'
      ? 'Editing a wiki page'
      : 'Editing wiki source'
    if (!privacy)
      data.state = text(title)
  }
  else if (url.searchParams.has('diff') || action === 'history') {
    data.details = url.searchParams.has('diff') ? 'Comparing revisions' : 'Looking at page history'
    if (!privacy)
      data.state = heading() ?? text(title)
    publicPage = true
  }
  else if (action !== 'view' && action !== 'render') {
    const actions: Record<string, string> = {
      info: 'Looking at page information',
      protect: 'Changing page protection',
      unprotect: 'Changing page protection',
      delete: 'Deleting a wiki page',
      move: 'Moving a wiki page',
      watch: 'Changing own watchlist',
      unwatch: 'Changing own watchlist',
    }
    data.details = actions[action] ?? 'Using wiki tools'
  }
  else if (isHome) {
    data.details = 'Exploring'
    data.state = 'MCC Island Wiki'
  }
  else {
    const namespace = title.includes(':') ? title.split(':')[0]!.toLowerCase() : ''
    data.details = namespace.endsWith('talk')
      ? 'Looking at a discussion'
      : namespace === 'category'
        ? 'Looking at a category'
        : namespace === 'file' || namespace === 'image'
          ? 'Looking at a file'
          : namespace === 'user'
            ? 'Looking at a wiki profile'
            : namespace === 'template'
              ? 'Looking at a template'
              : namespace === 'module'
                ? 'Looking at a module'
                : namespace === 'help' ? 'Looking at wiki help' : 'Looking at a wiki page'
    if (!privacy) {
      data.state = heading() ?? text(title)
      showIcon = !namespace || namespace === 'category'
    }
    publicPage = true
  }

  if (showIcon) {
    const icon = await pageIcon(title)
    if (icon) {
      data.smallImageKey = icon
      data.smallImageText = data.state ?? 'MCC Island Wiki'
    }
  }
  if (showButtons && !privacy && publicPage && !isHome) {
    const target = new URL(url.href)
    // No editing parameters, user inputs, revision tokens, or personal fragments are shared.
    target.search = ''
    target.hash = ''
    if (url.pathname === '/index.php')
      target.searchParams.set('title', title)
    data.buttons = [{ label: 'Open Wiki Page', url: target.href }]
    if (showIcon && data.smallImageKey !== Eyes)
      data.smallImageUrl = target.href
  }
  return data
}
