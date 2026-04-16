import { Assets } from 'premid'

const LOGO = 'https://cdn.rcd.gg/PreMiD/websites/M/MoeTruyen/assets/logo.png'

const presence = new Presence({
  clientId: '578560798205673482',
})

async function getStrings() {
  return presence.getStrings({
    account: 'moetruyen.account',
    browsing: 'general.browsing',
    browsingForum: 'moetruyen.browsingForum',
    browsingGroups: 'moetruyen.browsingGroups',
    browsingManga: 'moetruyen.browsingManga',
    browsingNews: 'moetruyen.browsingNews',
    browsingSite: 'moetruyen.browsingSite',
    buttonViewArticle: 'general.buttonViewArticle',
    buttonReadChapter: 'moetruyen.buttonReadChapter',
    buttonReadThisChapter: 'moetruyen.buttonReadThisChapter',
    buttonViewManga: 'moetruyen.buttonViewManga',
    catalog: 'moetruyen.catalog',
    history: 'moetruyen.history',
    messaging: 'moetruyen.messaging',
    reading: 'general.reading',
    readingChapter: 'moetruyen.readingChapter',
    readingForum: 'moetruyen.readingForum',
    readingNews: 'general.readingAnArticle',
    savedManga: 'moetruyen.savedManga',
    siteName: 'moetruyen.siteName',
    viewingAccountSettings: 'moetruyen.viewingAccountSettings',
    viewingDetails: 'moetruyen.viewingDetails',
    viewingForumPost: 'general.readingAThread',
    viewingGroup: 'moetruyen.viewingGroup',
    viewingManga: 'moetruyen.viewingManga',
    viewingMessages: 'moetruyen.viewingMessages',
    viewingNewsPost: 'moetruyen.viewingNewsPost',
    viewingProfile: 'general.viewAProfile',
    viewingReadingHistory: 'moetruyen.viewingReadingHistory',
    viewingSavedManga: 'moetruyen.viewingSavedManga',
    viewingTranslationGroup: 'moetruyen.viewingTranslationGroup',
    viewHome: 'general.viewHome',
    viewUser: 'general.viewProfile',
    website: 'moetruyen.website',
  })
}

const browsingTimestamp = Math.floor(Date.now() / 1000)
let oldLang: string | null = null
let localeStrings: Awaited<ReturnType<typeof getStrings>> | null = null

presence.on('UpdateData', async () => {
  const [showButtons, currentLang] = await Promise.all([
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<string>('lang').catch(() => 'en'),
  ])
  const { pathname, href } = document.location

  if (!localeStrings || oldLang !== currentLang) {
    oldLang = currentLang
    localeStrings = await getStrings()
  }

  const presenceData: PresenceData = {
    largeImageKey: LOGO,
    startTimestamp: browsingTimestamp,
  }

  if (isReaderPage(pathname) && document.body.classList.contains('reader-page--reader-mode')) {
    const seriesTitle = getText('.reader-dock__series')
    const chapterTitle = getText('.reader-dock__chapter') ?? getText('.reader-dropdown-trigger')

    if (!seriesTitle) {
      presence.clearActivity()
      return
    }

    presenceData.details = seriesTitle
    presenceData.state = chapterTitle ?? localeStrings.readingChapter
    presenceData.largeImageKey = getReaderLargeImage() ?? LOGO
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = localeStrings.reading

    if (showButtons) {
      presenceData.buttons = buildButtons([
        { label: localeStrings.buttonReadThisChapter, url: href },
        { label: localeStrings.buttonViewManga, url: getReaderSeriesUrl(pathname) },
      ])
    }
  }
  else if (isMangaDetailPage(pathname)) {
    const mangaTitle = getText('h1.manga-detail-title')
    const latestChapterUrl = document.querySelector<HTMLAnchorElement>('.manga-detail-primary-button--start')?.href ?? href
    const firstChapterUrl = getFirstChapterUrl(pathname) ?? latestChapterUrl

    if (!mangaTitle) {
      presence.clearActivity()
      return
    }

    presenceData.details = localeStrings.viewingManga
    presenceData.state = mangaTitle
    presenceData.largeImageKey = getDetailLargeImage() ?? LOGO
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = localeStrings.viewingDetails

    if (showButtons) {
      presenceData.buttons = buildButtons([
        { label: localeStrings.buttonViewManga, url: href },
        { label: localeStrings.buttonReadChapter, url: firstChapterUrl },
      ])
    }
  }
  else if (pathname === '/') {
    presenceData.details = localeStrings.viewHome
    presenceData.state = localeStrings.siteName
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = localeStrings.browsing
  }
  else if (pathname === '/manga') {
    presenceData.details = localeStrings.browsingManga
    presenceData.state = localeStrings.catalog
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = localeStrings.browsing
  }
  else if (pathname.startsWith('/tin-tuc')) {
    presenceData.details = pathname === '/tin-tuc' ? localeStrings.browsingNews : localeStrings.viewingNewsPost
    presenceData.state = getDocumentTitle()
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = pathname === '/tin-tuc' ? localeStrings.browsing : localeStrings.readingNews
  }
  else if (pathname.startsWith('/forum/post/')) {
    presenceData.details = localeStrings.viewingForumPost
    presenceData.state = getDocumentTitle()
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = localeStrings.readingForum

    if (showButtons) {
      presenceData.buttons = buildButtons([
        { label: localeStrings.buttonViewArticle, url: href },
      ])
    }
  }
  else if (pathname.startsWith('/forum')) {
    presenceData.details = localeStrings.browsingForum
    presenceData.state = getDocumentTitle()
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = localeStrings.browsingForum
  }
  else if (pathname.startsWith('/publish')) {
    presenceData.details = localeStrings.browsingGroups
    presenceData.state = getDocumentTitle()
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = localeStrings.browsingGroups
  }
  else if (pathname.startsWith('/messages')) {
    presenceData.details = localeStrings.viewingMessages
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = localeStrings.messaging
  }
  else if (pathname.startsWith('/account/history')) {
    presenceData.details = localeStrings.viewingReadingHistory
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = localeStrings.history
  }
  else if (pathname.startsWith('/account/saved')) {
    presenceData.details = localeStrings.viewingSavedManga
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = localeStrings.savedManga
  }
  else if (pathname.startsWith('/account')) {
    presenceData.details = localeStrings.viewingAccountSettings
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = localeStrings.account
  }
  else if (pathname.startsWith('/team/')) {
    presenceData.details = localeStrings.viewingTranslationGroup
    presenceData.state = getDocumentTitle()
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = localeStrings.viewingGroup
  }
  else if (pathname.startsWith('/user/')) {
    presenceData.details = localeStrings.viewUser
    presenceData.state = getDocumentTitle()
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = localeStrings.viewingProfile
  }
  else {
    presenceData.details = localeStrings.browsingSite
    presenceData.state = getDocumentTitle() ?? localeStrings.website
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = localeStrings.browsing
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else
    presence.clearActivity()
})

function buildButtons(buttons: Array<{ label: string, url: string | null }>): [ButtonData, ButtonData?] | undefined {
  const validButtons = buttons.filter(
    (button): button is { label: string, url: string } => Boolean(button.label && normalizeButtonUrl(button.url)),
  )
    .map(button => ({
      ...button,
      url: normalizeButtonUrl(button.url) as string,
    }))
  const [firstButton, secondButton] = validButtons

  if (!firstButton)
    return undefined

  return secondButton ? [firstButton, secondButton] : [firstButton]
}

function cleanText(text: string | null | undefined): string | null {
  if (!text)
    return null

  const cleanedText = text.replace(/\s+/g, ' ').trim()
  return cleanedText || null
}

function getDocumentTitle(): string | null {
  return cleanText(
    document.title
      .replace(/^\(\d+\)\s*/u, '')
      .replace(/\s+[—-]\s+(?:Mòe Truyện|MoeTruyen)$/iu, '')
      .replace(/\s+\|\s+(?:Mòe Truyện|MoeTruyen)$/iu, ''),
  )
}

function getDetailLargeImage(): string | null {
  return normalizePresenceImageUrl(
    document.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.content,
  )
  ?? getImageUrl(document.querySelector<HTMLImageElement>('.cover.cover--detail img'))
}

function getFirstChapterUrl(pathname: string): string | null {
  const mangaPath = pathname.match(/^\/manga\/[^/]+/u)?.[0]

  if (!mangaPath)
    return null

  const chapterLinks = Array.from(
    document.querySelectorAll<HTMLAnchorElement>('.chapter-table a[href*="/chapters/"]'),
  )
    .map(link => link.href)
    .filter(href => href.includes(`${mangaPath}/chapters/`))

  return chapterLinks.length > 0 ? (chapterLinks[chapterLinks.length - 1] ?? null) : null
}

function getImageUrl(image: HTMLImageElement | null | undefined): string | null {
  return normalizePresenceImageUrl(image?.currentSrc ?? image?.src)
}

function getReaderLargeImage(): string | null {
  const coverImage = normalizePresenceImageUrl(
    document.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.content,
  )

  if (coverImage)
    return coverImage

  const loadedImages = Array.from(
    document.querySelectorAll<HTMLImageElement>('img.page-media'),
  )

  const firstPageImage = loadedImages.find(image => /^Trang\s*1$/iu.test(image.alt.trim()))
  const firstLoadedPageImage = loadedImages.find(image => Boolean(getImageUrl(image)))

  return getImageUrl(firstPageImage) ?? getImageUrl(firstLoadedPageImage)
}

function getReaderSeriesUrl(pathname: string): string | null {
  const fallbackSeriesUrl = pathname.match(/^\/manga\/[^/]+/u)?.[0]

  return document.querySelector<HTMLAnchorElement>('.reader-dock__series-link')?.href
    ?? document.querySelector<HTMLAnchorElement>('.reader-chapter-bridge__actions a[href*="/manga/"]')?.href
    ?? (fallbackSeriesUrl ? `${document.location.origin}${fallbackSeriesUrl}` : null)
}

function getText(selector: string): string | null {
  return cleanText(document.querySelector(selector)?.textContent)
}

function normalizePresenceImageUrl(raw: string | null | undefined): string | null {
  const imageUrl = raw?.trim()

  if (!imageUrl || imageUrl.startsWith('data:'))
    return null

  try {
    return new URL(imageUrl, document.location.href).href
  }
  catch {
    return null
  }
}

function normalizeButtonUrl(raw: string | null | undefined): string | null {
  const url = normalizePresenceImageUrl(raw)

  if (!url)
    return null

  try {
    const normalizedUrl = new URL(url)
    normalizedUrl.hash = ''

    return normalizedUrl.href
  }
  catch {
    return null
  }
}

function isMangaDetailPage(pathname: string): boolean {
  return /^\/manga\/[^/]+\/?$/iu.test(pathname)
}

function isReaderPage(pathname: string): boolean {
  return /^\/manga\/[^/]+\/chapters\/[^/]+\/?$/iu.test(pathname)
}
