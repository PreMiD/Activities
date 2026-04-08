import 'premid'

const presence = new Presence({
  clientId: '1488531690115567737',
})

let activePageKey = ''
let pageStartTimestamp = Math.floor(Date.now() / 1000)

function truncate(value: string, maxLength: number): string {
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}…` : value
}

function getMeta(name: string): string {
  return document.querySelector(`meta[name="${name}"]`)?.getAttribute('content')?.trim() ?? ''
}

function getMetaProperty(property: string): string {
  return document.querySelector(`meta[property="${property}"]`)?.getAttribute('content')?.trim() ?? ''
}

function normalizeWorkType(value: string): 'Manga' | 'Manhwa' | 'Manhua' | 'Webtoon' {
  const source = value.trim().toLowerCase()

  if (source === 'manga')
    return 'Manga'
  if (source === 'manhwa')
    return 'Manhwa'
  if (source === 'manhua')
    return 'Manhua'
  if (source === 'webtoon')
    return 'Webtoon'

  return 'Manga'
}

function inferWorkTypeFromGenres(value: string): 'Manga' | 'Manhwa' | 'Manhua' | 'Webtoon' | '' {
  const source = value.trim().toLowerCase()

  if (!source)
    return ''

  if (/\bmanhwa\b/.test(source))
    return 'Manhwa'
  if (/\bmanhua\b/.test(source))
    return 'Manhua'
  if (/\bwebtoon\b/.test(source))
    return 'Webtoon'
  if (/\bmanga\b/.test(source))
    return 'Manga'

  return ''
}

function getWorkType(): 'Manga' | 'Manhwa' | 'Manhua' | 'Webtoon' {
  const explicitType = getMeta('comikuro:manga-type')
  if (explicitType)
    return normalizeWorkType(explicitType)

  const inferredType = inferWorkTypeFromGenres(getMeta('comikuro:manga-genres'))
  if (inferredType)
    return inferredType

  return 'Manga'
}

const sensitiveContentMatchers = [
  /\b18\+\b/,
  /\badult\b/,
  /\bmature\b/,
  /\bsmut\b/,
  /\berotica?\b/,
  /\bhentai\b/,
  /\bpornographic?\b/,
  /\bnsfw\b/,
  /\becchi\b/,
]

function hasSensitiveKeyword(value: string): boolean {
  const source = value.trim().toLowerCase()

  if (!source)
    return false

  return sensitiveContentMatchers.some(matcher => matcher.test(source))
}

function isSensitiveManga(): boolean {
  const explicitFlag = getMeta('comikuro:is-sensitive').toLowerCase()
  if (explicitFlag === '1' || explicitFlag === 'true' || explicitFlag === 'yes')
    return true

  const contentRating = getMeta('comikuro:content-rating')
  if (hasSensitiveKeyword(contentRating))
    return true

  const genres = getMeta('comikuro:manga-genres')
  if (hasSensitiveKeyword(genres))
    return true

  return false
}

function normalizeImageUrl(value: string): string {
  if (!value)
    return ''

  try {
    const url = new URL(value, document.location.origin)

    if (url.protocol !== 'https:')
      return ''

    const hostname = url.hostname.toLowerCase()
    const isAllowedHost = hostname.endsWith('comikuro.to') || hostname.endsWith('comick.pictures')
    if (!isAllowedHost)
      return ''

    const normalized = url.href
    return normalized.length <= 256 ? normalized : ''
  }
  catch {
    return ''
  }
}

function getCoverFromDom(): string {
  const selectors = [
    'img[alt="Manga cover"]',
    'img[data-cover="true"]',
    'main img[src*="meo.comick.pictures"]',
  ]

  for (const selector of selectors) {
    const candidate = document.querySelector(selector)?.getAttribute('src')?.trim() ?? ''
    const normalized = normalizeImageUrl(candidate)
    if (normalized)
      return normalized
  }

  return ''
}

function getMangaCoverUrl(): string {
  const candidates = [
    getMeta('comikuro:manga-cover'),
    getMetaProperty('og:image'),
    getMeta('twitter:image'),
    getCoverFromDom(),
  ]

  for (const candidate of candidates) {
    const normalized = normalizeImageUrl(candidate)
    if (normalized)
      return normalized
  }

  return ''
}

function getPageType(): string {
  return getMeta('comikuro:page-type') || document.documentElement.dataset.pageType || 'unknown'
}

function getPageKey(): string {
  const { pathname, search } = document.location
  return `${pathname}${search}`
}

function normalizeChapterLabel(value: string): string {
  const cleaned = value.trim().replace(/\s+/g, ' ')
  if (!cleaned)
    return ''

  const chapterMatch = cleaned.match(/\bch(?:apter)?\.?\s*(\d+(?:\.\d+)?(?:[-–]\d+(?:\.\d+)?)?)|\b(\d+(?:\.\d+)?(?:[-–]\d+(?:\.\d+)?)?)/i)
  const extractedChapter = chapterMatch?.[1] ?? chapterMatch?.[2]

  if (extractedChapter)
    return `Ch. ${extractedChapter}`

  return cleaned.replace(/^chapter\s+/i, 'Ch. ')
}

function getChapterLabel(): string {
  const metaLabel = normalizeChapterLabel(getMeta('comikuro:chapter-label'))
  if (metaLabel)
    return metaLabel

  const metaNumber = normalizeChapterLabel(getMeta('comikuro:chapter-number'))
  if (metaNumber)
    return metaNumber

  const dataChapterNumber = normalizeChapterLabel(document.documentElement.getAttribute('data-chapter-number') ?? '')
  if (dataChapterNumber)
    return dataChapterNumber

  const params = new URLSearchParams(document.location.search)
  const queryChapter = normalizeChapterLabel(
    params.get('chapter') ?? params.get('ch') ?? params.get('number') ?? '',
  )
  if (queryChapter)
    return queryChapter

  const pathMatch = document.location.pathname.match(/(?:chapter|ch)[-/]?(\d+(?:\.\d+)?(?:[-–]\d+(?:\.\d+)?)?)/i)
  const pathChapter = normalizeChapterLabel(pathMatch?.[1] ?? '')
  if (pathChapter)
    return pathChapter

  const titleMatch = document.title.match(/ch(?:apter)?\.?\s*\d+(?:\.\d+)?(?:[-–]\d+(?:\.\d+)?)?/i)
  const titleChapter = normalizeChapterLabel(titleMatch?.[0] ?? '')
  if (titleChapter)
    return titleChapter

  return ''
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function normalizeMangaTitle(value: string, chapterLabel: string): string {
  const cleaned = value.trim().replace(/\s+/g, ' ')
  if (!cleaned)
    return 'ComiKuro'

  if (chapterLabel) {
    const chapterPattern = new RegExp(`\\s*[-–:|]\\s*${escapeRegExp(chapterLabel)}\\s*$`, 'i')
    const withoutKnownLabel = cleaned.replace(chapterPattern, '').trim()
    if (withoutKnownLabel)
      return withoutKnownLabel
  }

  const withoutGenericChapter = cleaned
    .replace(/\s*[-–:|]\s*ch(?:apter)?\.?\s*\d+(?:\.\d+)?(?:[-–]\d+(?:\.\d+)?)?\s*$/i, '')
    .trim()

  return withoutGenericChapter || cleaned
}

presence.on('UpdateData', () => {
  const pageKey = getPageKey()
  if (pageKey !== activePageKey) {
    activePageKey = pageKey
    pageStartTimestamp = Math.floor(Date.now() / 1000)
  }

  if (!document.location.hostname.endsWith('comikuro.to')) {
    presence.clearActivity()
    return
  }

  const { pathname, search } = document.location
  const pageType = getPageType()
  const workType = getWorkType()
  const workTypeLower = workType.toLowerCase()
  const chapterLabel = getChapterLabel()
  const mangaTitleRaw = getMeta('comikuro:manga-title') || document.title || 'ComiKuro'
  const mangaTitle = normalizeMangaTitle(mangaTitleRaw, chapterLabel)
  const mangaId = getMeta('comikuro:manga-id')
  const isMangaPage = pageType === 'manga' || pathname.startsWith('/manga/')
  const isReaderPage = pageType === 'reader' || pathname.startsWith('/read/')
  const shouldUseMangaCover = isMangaPage || isReaderPage
  const shouldHideMangaCover = shouldUseMangaCover && isSensitiveManga()
  const mangaCoverUrl = shouldUseMangaCover && !shouldHideMangaCover ? getMangaCoverUrl() : ''

  const presenceData: PresenceData = {
    startTimestamp: pageStartTimestamp,
  }

  const logoUrl = 'https://i.imgur.com/AfDB5nr.png'
  ;(presenceData as Record<string, unknown>).largeImageKey = shouldUseMangaCover && mangaCoverUrl ? mangaCoverUrl : logoUrl

  if (shouldHideMangaCover) {
    ;(presenceData as Record<string, unknown>).largeImageText = 'Cover hidden for sensitive content'
  }
  else if (shouldUseMangaCover && mangaCoverUrl) {
    ;(presenceData as Record<string, unknown>).largeImageText = truncate(mangaTitle, 128)
  }

  if (document.location.hostname.includes('comikuro.to')) {
    presenceData.details = 'ComiKuro'
    presenceData.state = pathname === '/' ? 'Home' : pathname
  }

  if (pageType === 'manga') {
    presenceData.details = `Viewing ${workTypeLower}`
    presenceData.state = mangaTitle
  }
  else if (pageType === 'reader') {
    presenceData.details = chapterLabel ? `Reading ${workTypeLower} - ${chapterLabel}` : `Reading ${workTypeLower}`
    presenceData.state = mangaTitle
  }
  else if (pathname.startsWith('/read/')) {
    presenceData.details = chapterLabel ? `Reading ${workTypeLower} - ${chapterLabel}` : `Reading ${workTypeLower}`
    presenceData.state = mangaTitle
  }
  else if (pathname.startsWith('/manga/')) {
    presenceData.details = `Viewing ${workTypeLower}`
    presenceData.state = mangaTitle
  }
  else if (pathname === '/') {
    presenceData.details = 'Browsing manga'
    presenceData.state = 'Home'
  }
  else if (pathname.startsWith('/search')) {
    const query = new URLSearchParams(search).get('q')?.trim()
    presenceData.details = 'Searching manga'
    presenceData.state = query || 'Search'
  }
  else if (pathname.startsWith('/popular')) {
    presenceData.details = 'Browsing manga'
    presenceData.state = 'Popular'
  }
  else if (pathname.startsWith('/recent')) {
    presenceData.details = 'Browsing manga'
    presenceData.state = 'Recent updates'
  }
  else if (pathname.startsWith('/collections/create')) {
    presenceData.details = 'Managing collections'
    presenceData.state = 'Create collection'
  }
  else if (pathname.startsWith('/collections/')) {
    presenceData.details = 'Browsing collections'
    presenceData.state = document.title || 'Collection'
  }
  else if (pathname.startsWith('/profile/')) {
    presenceData.details = 'Viewing profile'
    presenceData.state = document.title || 'Profile'
  }
  else {
    presenceData.details = 'Browsing ComiKuro'
    presenceData.state = document.title || 'Website'
  }

  if (pageType === 'reader')
    presenceData.smallImageText = chapterLabel || (mangaId ? `Manga ${mangaId}` : '')

  if (typeof presenceData.details === 'string')
    presenceData.details = truncate(presenceData.details, 128)

  if (typeof presenceData.state === 'string')
    presenceData.state = truncate(presenceData.state, 128)

  if (typeof presenceData.smallImageText === 'string')
    presenceData.smallImageText = truncate(presenceData.smallImageText, 128)

  if (presenceData.details)
    presence.setActivity(presenceData)
  else
    presence.clearActivity()
})
