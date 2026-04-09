import { Assets } from 'premid'

const LOGO = 'https://i.imgur.com/AcBElBO.png'

type SupportedLocale = 'en' | 'vi'

const customStrings = {
  en: {
    account: 'Account',
    browsingForum: 'Browsing forum',
    browsingGroups: 'Browsing groups',
    browsingManga: 'Browsing manga',
    browsingNews: 'Browsing news',
    browsingSite: 'Browsing MoeTruyen',
    buttonViewArticle: 'View article',
    buttonReadFirstChapter: 'Read first chapter',
    buttonReadThisChapter: 'Read this chapter',
    buttonViewHomePage: 'View home page',
    buttonViewManga: 'View manga',
    catalog: 'Catalog',
    history: 'History',
    messaging: 'Messaging',
    readingChapter: 'Reading a chapter',
    readingForum: 'Reading forum',
    readingNews: 'Reading news',
    savedManga: 'Saved manga',
    siteName: 'MoeTruyen',
    viewingAccountSettings: 'Viewing account settings',
    viewingDetails: 'Viewing details',
    viewingForumPost: 'Viewing forum post',
    viewingGroup: 'Viewing group',
    viewingManga: 'Viewing manga:',
    viewingMessages: 'Viewing messages',
    viewingNewsPost: 'Viewing news post',
    viewingProfile: 'Viewing profile',
    viewingReadingHistory: 'Viewing reading history',
    viewingSavedManga: 'Viewing saved manga',
    viewingTranslationGroup: 'Viewing translation group',
    website: 'Website',
  },
  vi: {
    account: 'Tài khoản',
    browsingForum: 'Đang duyệt diễn đàn',
    browsingGroups: 'Đang duyệt nhóm',
    browsingManga: 'Đang duyệt truyện',
    browsingNews: 'Đang duyệt tin tức',
    browsingSite: 'Đang duyệt MoeTruyen',
    buttonViewArticle: 'Xem bài viết',
    buttonReadFirstChapter: 'Đọc chương đầu',
    buttonReadThisChapter: 'Đọc chương này',
    buttonViewHomePage: 'Trang chủ',
    buttonViewManga: 'Xem truyện',
    catalog: 'Danh mục',
    history: 'Lịch sử',
    messaging: 'Đang nhắn tin',
    readingChapter: 'Đang đọc chương',
    readingForum: 'Đang đọc diễn đàn',
    readingNews: 'Đang đọc tin tức',
    savedManga: 'Truyện đã lưu',
    siteName: 'MoeTruyen',
    viewingAccountSettings: 'Đang xem cài đặt tài khoản',
    viewingDetails: 'Đang xem chi tiết',
    viewingForumPost: 'Đang xem bài viết diễn đàn',
    viewingGroup: 'Đang xem nhóm',
    viewingManga: 'Đang xem truyện:',
    viewingMessages: 'Đang xem tin nhắn',
    viewingNewsPost: 'Đang xem bài tin tức',
    viewingProfile: 'Đang xem hồ sơ',
    viewingReadingHistory: 'Đang xem lịch sử đọc',
    viewingSavedManga: 'Đang xem truyện đã lưu',
    viewingTranslationGroup: 'Đang xem nhóm dịch',
    website: 'Trang web',
  },
} satisfies Record<SupportedLocale, Record<string, string>>

const presence = new Presence({
  clientId: '578560798205673482',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

async function getStrings() {
  return presence.getStrings({
    browsing: 'general.browsing',
    chapter: 'general.chapter',
    reading: 'general.reading',
    viewHome: 'general.viewHome',
    viewUser: 'general.viewUser',
  })
}

let strings: Awaited<ReturnType<typeof getStrings>>
let localeStrings = customStrings.en
let oldLang: string | null = null

presence.on('UpdateData', async () => {
  const [showButtons, langSetting] = await Promise.all([
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<string>('lang').catch(() => 'en'),
  ])
  const { pathname, href } = document.location
  if (!strings || langSetting !== oldLang) {
    oldLang = langSetting
    strings = await getStrings()
    localeStrings = customStrings[resolveLocale(langSetting, strings)]
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
    presenceData.smallImageText = strings.reading

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
        { label: localeStrings.buttonReadFirstChapter, url: firstChapterUrl },
      ])
    }
  }
  else if (pathname === '/') {
    presenceData.details = strings.viewHome
    presenceData.state = localeStrings.siteName
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = strings.browsing

    if (showButtons) {
      presenceData.buttons = buildButtons([
        { label: localeStrings.buttonViewHomePage, url: href },
      ])
    }
  }
  else if (pathname === '/manga') {
    presenceData.details = localeStrings.browsingManga
    presenceData.state = localeStrings.catalog
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = strings.browsing
  }
  else if (pathname.startsWith('/tin-tuc')) {
    presenceData.details = pathname === '/tin-tuc' ? localeStrings.browsingNews : localeStrings.viewingNewsPost
    presenceData.state = getDocumentTitle()
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = pathname === '/tin-tuc' ? strings.browsing : localeStrings.readingNews
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
    presenceData.details = strings.viewUser
    presenceData.state = getDocumentTitle()
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = localeStrings.viewingProfile
  }
  else {
    presenceData.details = localeStrings.browsingSite
    presenceData.state = getDocumentTitle() ?? localeStrings.website
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = strings.browsing
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else
    presence.clearActivity()
})

function buildButtons(buttons: Array<{ label: string, url: string | null }>): [ButtonData, ButtonData?] | undefined {
  const validButtons = buttons.filter(
    (button): button is { label: string, url: string } => Boolean(button.label && button.url),
  )
  const [firstButton, secondButton] = validButtons

  if (!firstButton)
    return undefined

  return secondButton ? [firstButton, secondButton] : [firstButton]
}

function resolveLocale(
  lang: string | null | undefined,
  strings?: Awaited<ReturnType<typeof getStrings>>,
): SupportedLocale {
  const normalizedLang = normalizeLocaleValue(lang)

  if (isVietnameseLocale(normalizedLang))
    return 'vi'

  if (isEnglishLocale(normalizedLang))
    return 'en'

  const pageLocale = normalizeLocaleValue(document.documentElement.lang)

  if (isVietnameseLocale(pageLocale))
    return 'vi'

  if (isEnglishLocale(pageLocale))
    return 'en'

  const sharedStringsSnapshot = [
    strings?.chapter,
    strings?.reading,
    strings?.viewHome,
    strings?.viewUser,
  ]
    .filter(Boolean)
    .map(value => String(value))
    .join(' ')
    .toLowerCase()

  if (/chương|đọc|duyệt|trang chủ|hồ sơ|người dùng|tiếng việt|tieng viet|[ăâđêôơư]/.test(sharedStringsSnapshot))
    return 'vi'

  if (/chapter|reading|browsing|viewing home page|viewing user/.test(sharedStringsSnapshot))
    return 'en'

  return 'vi'
}

function normalizeLocaleValue(value: string | null | undefined): string {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/_/g, '-')
}

function isVietnameseLocale(locale: string): boolean {
  const baseLocale = locale.split('-')[0]

  return baseLocale === 'vi'
    || baseLocale === 'vn'
    || locale.includes('vietnamese')
    || locale.includes('tiếng việt')
    || locale.includes('tieng viet')
}

function isEnglishLocale(locale: string): boolean {
  const baseLocale = locale.split('-')[0]

  return baseLocale === 'en' || locale.includes('english')
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
      .replace(/\s+[—-]\s+Mòe Truyện$/u, '')
      .replace(/\s+\|\s+Mòe Truyện$/u, ''),
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

function isMangaDetailPage(pathname: string): boolean {
  return /^\/manga\/[^/]+\/?$/iu.test(pathname)
}

function isReaderPage(pathname: string): boolean {
  return /^\/manga\/[^/]+\/chapters\/[^/]+\/?$/iu.test(pathname)
}
