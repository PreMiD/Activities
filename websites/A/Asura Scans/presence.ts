import { ActivityType } from 'premid'

const presence = new Presence({ clientId: '864304063804997702' })
const browsingTimestamp = Math.floor(Date.now() / 1000)
const ASURA_SCANS_LOGO = 'https://cdn.rcd.gg/PreMiD/websites/A/Asura%20Scans/assets/logo.png'
const CHAPTER_CONTAINER_SELECTORS = [
  'div.py-4.mx-5.md\\:mx-0.flex.flex-col.items-center.justify-center',
  'div.py-8.-mx-5.md\\:mx-0.flex.flex-col.items-center.justify-center',
]
const COMIC_PATH_PATTERN = /^\/(?:comics|series)\/[^/]+\/?$/i
const CHAPTER_PATH_PATTERN = /^\/(?:comics|series)\/[^/]+\/chapter\/([^/]+)\/?$/i
const USER_PATH_PATTERN = /^\/user\/([^/]+)\/?$/i

interface Comic {
  title: string
  url: string
  image: string
}

const comic: Comic = {
  title: '',
  url: '',
  image: '',
}

presence.on('UpdateData', async () => {
  const { pathname, href } = window.location

  const presenceData: PresenceData = {
    startTimestamp: browsingTimestamp,
    largeImageKey: ASURA_SCANS_LOGO,
    type: ActivityType.Watching,
  }

  const [
    displayPercentage,
    privacyMode,
    displayChapter,
    displayCover,
    displayButtons,
  ] = await Promise.all([
    presence.getSetting<boolean>('readingPercentage'),
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('chapterNumber'),
    presence.getSetting<boolean>('showCover'),
    presence.getSetting<boolean>('showButtons'),
  ])

  if (privacyMode) {
    presenceData.details = 'Browsing Asura Scans'
    presence.setActivity(presenceData)
    return
  }

  if (onComicOrChapterPage(pathname)) {
    const newComic = isNewComic(href, comic)
    comic.url = getComicURL(href)
    comic.title = getComicTitle() || comic.title

    if (displayCover) {
      const pageImage = getMetaContent('og:image')
      if (pageImage) {
        comic.image = pageImage
      }
      else if (newComic || comic.image === ASURA_SCANS_LOGO) {
        comic.image = (await getComicImage(comic.url)) ?? ASURA_SCANS_LOGO
      }
    }
    else {
      comic.image = ASURA_SCANS_LOGO
    }
  }

  if (onChapterPage(pathname)) {
    presenceData.details = comic.title || getComicTitle()
    presenceData.largeImageKey = comic.image || ASURA_SCANS_LOGO

    if (displayButtons) {
      presenceData.buttons = [
        {
          label: 'Visit Comic Page',
          url: comic.url || getComicURL(href),
        },
        {
          label: 'Visit Chapter',
          url: href,
        },
      ]
    }

    if (displayChapter) {
      const progress = displayPercentage ? getChapterProgress() : null
      const chapterNumber = getChapterNumber(pathname)
      const chapterTitle = getChapterTitle(chapterNumber)

      presenceData.state = [
        `Chapter ${chapterNumber}${chapterTitle ? `: ${chapterTitle}` : ''}`,
        progress !== null ? `${progress}%` : '',
      ].filter(Boolean).join(' • ')
    }
  }
  else if (onComicHomePage(pathname)) {
    presenceData.details = comic.title || getComicTitle()
    presenceData.largeImageKey = comic.image || ASURA_SCANS_LOGO
    presenceData.state = 'Viewing Comic Home Page'

    if (displayButtons) {
      presenceData.buttons = [
        {
          label: 'Visit Comic Page',
          url: comic.url || href,
        },
      ]
    }
  }
  else if (onUserPage(pathname)) {
    const userName = getUserName(pathname)
    presenceData.details = 'Viewing User Profile'
    presenceData.state = userName

    if (displayCover) {
      presenceData.largeImageKey = getUserImage()
      presenceData.largeImageText = userName
    }

    if (displayButtons) {
      presenceData.buttons = [
        {
          label: 'Visit Profile',
          url: href,
        },
      ]
    }
  }
  else if (pathname.startsWith('/bookmark')) {
    presenceData.details = 'Viewing Bookmarks'
  }
  else if (
    pathname.startsWith('/browse')
    || pathname === '/comics'
    || pathname.startsWith('/series')
  ) {
    presenceData.details = 'Viewing Comic List'
  }
  else if (pathname === '/') {
    presenceData.details = 'Viewing Home Page'
  }
  else {
    presenceData.details = 'Browsing Asura Scans'
    presenceData.state = document.title
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else
    presence.clearActivity()
})

function onComicOrChapterPage(path: string) {
  return onComicHomePage(path) || onChapterPage(path)
}

function onComicHomePage(path: string) {
  return COMIC_PATH_PATTERN.test(path)
}

function onChapterPage(path: string) {
  return CHAPTER_PATH_PATTERN.test(path)
}

function onUserPage(path: string) {
  return USER_PATH_PATTERN.test(path)
}

function isNewComic(path: string, comic: Comic) {
  return comic.url !== getComicURL(path)
}

function getComicURL(path: string) {
  const url = new URL(path)
  url.pathname = url.pathname.replace(/\/chapter\/[^/]+\/?$/i, '')
  url.search = ''
  url.hash = ''
  return url.href.replace(/\/$/, '')
}

function getMetaContent(property: string) {
  return document
    .querySelector<HTMLMetaElement>(`meta[property="${property}"]`)
    ?.content
    .trim() ?? ''
}

function getComicTitle() {
  const pageTitle = getMetaContent('og:title') || document.title
  const siteSeparator = pageTitle.toLowerCase().lastIndexOf('| asura scans')
  const titleWithoutSite = siteSeparator === -1
    ? pageTitle
    : pageTitle.slice(0, siteSeparator)
  const chapterSeparator = titleWithoutSite.toLowerCase().lastIndexOf(' chapter ')

  return (chapterSeparator === -1
    ? titleWithoutSite
    : titleWithoutSite.slice(0, chapterSeparator)).trim()
}

function getChapterNumber(path: string) {
  const pathChapter = CHAPTER_PATH_PATTERN.exec(path)?.[1]
  if (pathChapter) {
    try {
      return decodeURIComponent(pathChapter)
    }
    catch {
      return pathChapter
    }
  }

  const chapterSeparator = document.title.toLowerCase().lastIndexOf(' chapter ')
  if (chapterSeparator === -1)
    return 'Unknown'

  return document.title
    .slice(chapterSeparator + ' chapter '.length)
    .split(' - ')[0]
    ?.split(' | ')[0]
    ?.trim() || 'Unknown'
}

function getChapterTitle(chapterNumber: string) {
  const separator = ` Chapter ${chapterNumber} - `

  for (const script of document.querySelectorAll<HTMLScriptElement>(
    'script[type="application/ld+json"]',
  )) {
    try {
      const data = JSON.parse(script.textContent ?? '{}') as {
        '@type'?: unknown
        'headline'?: unknown
      }
      if (data['@type'] !== 'Article' || typeof data.headline !== 'string')
        continue

      return data.headline.split(separator)[1]?.trim() ?? ''
    }
    catch {}
  }

  return ''
}

function getUserName(path: string) {
  const pageTitle = getMetaContent('og:title') || document.title
  const profileSuffix = pageTitle.toLowerCase().lastIndexOf('\'s profile')
  if (profileSuffix !== -1)
    return pageTitle.slice(0, profileSuffix).trim()

  const pathName = USER_PATH_PATTERN.exec(path)?.[1]
  if (!pathName)
    return 'Unknown User'

  try {
    return decodeURIComponent(pathName)
  }
  catch {
    return pathName
  }
}

function getUserImage() {
  const profileImage = document.querySelector<HTMLImageElement>(
    '.profile-page img[onerror*="default-pp"]',
  )

  return profileImage?.src || ASURA_SCANS_LOGO
}

function getChapterContainer(): HTMLElement | null {
  const currentReader = document.querySelector<HTMLElement>('[data-page]')?.parentElement
  if (currentReader) {
    return currentReader
  }

  for (const selector of CHAPTER_CONTAINER_SELECTORS) {
    const el = document.querySelector<HTMLElement>(selector)
    if (el) {
      return el
    }
  }
  return null
}

function getChapterProgress(): number | null {
  try {
    const container = getChapterContainer()
    if (!container) {
      return null
    }

    const rect = container.getBoundingClientRect()
    const totalHeight = rect.height

    if (!totalHeight || !Number.isFinite(totalHeight)) {
      return null
    }

    const scrollY = window.scrollY || window.pageYOffset
    const containerTop = rect.top + scrollY
    const containerBottom = containerTop + totalHeight
    const viewportBottom = scrollY + window.innerHeight

    const visibleBottom = Math.min(viewportBottom, containerBottom)
    const progress = ((visibleBottom - containerTop) / totalHeight) * 100

    const clamped = Math.max(0, Math.min(100, progress))
    return Number.isFinite(clamped) ? Number(clamped.toFixed(1)) : null
  }
  catch {
    return null
  }
}

async function getComicImage(comicHomePageURL: string): Promise<string | undefined> {
  try {
    const res = await (await fetch(comicHomePageURL)).text()
    return new DOMParser()
      .parseFromString(res, 'text/html')
      ?.querySelector<HTMLMetaElement>('head > meta[property="og:image"]')
      ?.content
  }
  catch {
    return undefined
  }
}
