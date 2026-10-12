const presence = new Presence({
  clientId: '1546241117907845120',
})

interface SiteConfig {
  name: string
  hosts: string[]
}

interface PageInfo {
  kind: 'browse' | 'series' | 'chapter'
  chapter?: string
  seriesSlug?: string
  seriesUrl?: string
}

const sites: SiteConfig[] = [
  { name: 'OlympusStaff', hosts: ['olympustaff.com', 'www.olympustaff.com'] },
  { name: 'Azora Manga', hosts: ['azorafly.com', 'www.azorafly.com'] },
  { name: 'MangaLek', hosts: ['mangalik.net', 'www.mangalik.net'] },
  { name: 'MangaTime', hosts: ['mangatime.org', 'www.mangatime.org'] },
  { name: 'MangaSwan', hosts: ['mangaswan.com', 'www.mangaswan.com'] },
  { name: 'MangaClub', hosts: ['mangaclub.net', 'www.mangaclub.net'] },
  { name: 'Abmics', hosts: ['abmics.com', 'www.abmics.com'] },
  { name: 'ToonArab', hosts: ['toonarab.com', 'www.toonarab.com'] },
]

const sensitiveTerms = [
  'ecchi',
  'hentai',
  'smut',
  'adult-content',
  'adult content',
  'erotica',
  'erotic',
  'suggestive',
  'nsfw',
  '18+',
  'ايتشي',
  'إيتشي',
  'اباحي',
  'إباحي',
  'اباحية',
  'إباحية',
  'للكبار',
  'للبالغين',
  'محتوى للبالغين',
  'مثير',
  'جنسي',
  'فان سيرفس',
]

const timerStorageKey = 'premid:arabic-manga:timer:v1'
const classificationCache = new Map<string, boolean>()
let activeTimerSession = ''
let activeTimerTimestamp = Math.floor(Date.now() / 1000)

interface TimerState {
  session: string
  startedAt: number
}

function currentSite(): SiteConfig | undefined {
  const host = location.hostname.toLowerCase()
  return sites.find(site => site.hosts.includes(host))
}

function timerSeriesId(site: SiteConfig, info: PageInfo): string {
  const parts = location.pathname.split('/').filter(Boolean)
  const lower = parts.map(part => part.toLowerCase())

  if ((site.name === 'MangaSwan' || site.name === 'MangaClub') && lower[0] === 'ar') {
    if (lower[1] === 'manga' && parts[2])
      return parts[2].replace(/\.html?$/i, '').toLowerCase()
    if (parts[1])
      return parts[1].toLowerCase()
  }

  if (info.seriesUrl) {
    try {
      const url = new URL(info.seriesUrl, location.href)
      return `${url.hostname.toLowerCase()}${url.pathname.replace(/\/+$/, '').toLowerCase()}`
    }
    catch {}
  }

  if (info.seriesSlug)
    return info.seriesSlug.toLowerCase()

  return location.pathname.replace(/\/+$/, '').toLowerCase() || '/'
}

function timerSessionFor(site: SiteConfig, info: PageInfo): string {
  if (info.kind === 'browse')
    return `${location.hostname.toLowerCase()}:browse`

  return `${location.hostname.toLowerCase()}:${info.kind}:${timerSeriesId(site, info)}`
}

function readStoredTimer(): TimerState | undefined {
  try {
    const raw = sessionStorage.getItem(timerStorageKey)
    if (!raw)
      return undefined

    const parsed = JSON.parse(raw) as Partial<TimerState>
    if (typeof parsed.session !== 'string' || typeof parsed.startedAt !== 'number')
      return undefined
    if (!Number.isFinite(parsed.startedAt) || parsed.startedAt <= 0)
      return undefined

    return { session: parsed.session, startedAt: parsed.startedAt }
  }
  catch {
    return undefined
  }
}

function storeTimer(state: TimerState): void {
  try {
    sessionStorage.setItem(timerStorageKey, JSON.stringify(state))
  }
  catch {}
}

function timerTimestampFor(site: SiteConfig, info: PageInfo): number {
  const session = timerSessionFor(site, info)
  if (session === activeTimerSession)
    return activeTimerTimestamp

  const now = Math.floor(Date.now() / 1000)
  const stored = readStoredTimer()
  let cameFromAnotherSite = false

  if (document.referrer) {
    try {
      cameFromAnotherSite = new URL(document.referrer).origin !== location.origin
    }
    catch {}
  }

  activeTimerSession = session
  activeTimerTimestamp = stored?.session === session && !cameFromAnotherSite
    ? stored.startedAt
    : now

  storeTimer({ session, startedAt: activeTimerTimestamp })
  return activeTimerTimestamp
}

function absoluteUrl(value: string | null | undefined, base = location.href): string | undefined {
  if (!value)
    return undefined

  try {
    return new URL(value, base).href
  }
  catch {
    return undefined
  }
}

function normalizeSpaces(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function slugToTitle(slug: string): string {
  const decoded = decodeURIComponent(slug)
    .replace(/\.(?:html?|php)$/i, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return decoded.replace(/\b[a-z]/g, letter => letter.toUpperCase())
}

function chapterFromText(value: string | null | undefined): string | undefined {
  if (!value)
    return undefined

  const normalized = normalizeSpaces(value)
  const explicit = normalized.match(/(?:الفصل|فصل|chapter)(?:\s+رقم)?[\s#]*(\d+(?:\.\d+)?)/i)
  return explicit?.[1]
}

function cleanSeriesTitle(value: string, site: SiteConfig, chapter?: string): string {
  let title = normalizeSpaces(value)
    .replace(/^Read\s+/i, '')
    .replace(/\s+(?:Manga|Manhwa)\s+Online.*$/i, '')
    .replace(/\s*\|\s*(?:Team-X|Azora.*|MangaLek.*|مانجا ليك.*|MangaTime.*|مانجا تايم.*|MangaSwan.*|MangaClub.*|Abmics.*|ToonArab.*)$/i, '')
    .replace(/\s*[-–—|]\s*(?:مانجا|مانهوا)\s+مترجمة.*$/, '')
    .replace(/[\s,،-]*(?:الفصل|فصل|chapter)(?:\s+رقم)?[\s#]*\d.*$/i, '')
    .trim()

  if (chapter) {
    const escaped = chapter.replace('.', '\\.')
    title = title.replace(new RegExp(`\\s*[-–—]\\s*${escaped}\\s*$`), '').trim()
  }

  title = title.replace(/\s+AR$/i, '').trim()

  if (!title || title.toLowerCase() === site.name.toLowerCase())
    return ''

  return title
}

function seriesLinkFromPage(): HTMLAnchorElement | undefined {
  const candidates = [...document.querySelectorAll<HTMLAnchorElement>('a[href]')]
    .filter((link) => {
      const href = absoluteUrl(link.getAttribute('href'))
      if (!href || href === location.href)
        return false
      if (link.closest('header, nav, footer, aside, [role="navigation"]'))
        return false

      try {
        const path = new URL(href).pathname.toLowerCase()
        return /\/(?:series|manga|manhwa|manhua|webtoon|comic|abmic)\//.test(path)
      }
      catch {
        return false
      }
    })

  return candidates.find(link => normalizeSpaces(link.textContent ?? '').length > 2) ?? candidates[0]
}

function detectPageInfo(site: SiteConfig): PageInfo {
  const parts = location.pathname.split('/').filter(Boolean)
  const lower = parts.map(part => part.toLowerCase())
  const origin = location.origin
  let chapter = chapterFromText(document.querySelector('h1')?.textContent)
    ?? chapterFromText(document.title)

  if (site.name === 'OlympusStaff' && lower[0] === 'series' && parts[1]) {
    chapter ??= parts[2]?.match(/^(\d+(?:\.\d+)?)$/)?.[1]
    return {
      kind: chapter ? 'chapter' : 'series',
      chapter,
      seriesSlug: parts[1],
      seriesUrl: `${origin}/series/${parts[1]}`,
    }
  }

  if (site.name === 'Azora Manga' && lower[0] === 'series' && parts[1]) {
    chapter ??= parts[2]?.match(/^chapter-(\d+(?:\.\d+)?)$/i)?.[1]
    return {
      kind: chapter ? 'chapter' : 'series',
      chapter,
      seriesSlug: parts[1],
      seriesUrl: `${origin}/series/${parts[1]}`,
    }
  }

  if (site.name === 'MangaLek' && lower[0] === 'manga' && parts[1]) {
    chapter ??= parts[2]?.match(/^(\d+(?:\.\d+)?)$/)?.[1]
    return {
      kind: chapter ? 'chapter' : 'series',
      chapter,
      seriesSlug: parts[1],
      seriesUrl: `${origin}/manga/${parts[1]}/`,
    }
  }

  if (site.name === 'MangaTime' && ['manga', 'manhwa'].includes(lower[0] ?? '') && parts[1]) {
    const chapterIndex = lower.indexOf('chapter')
    chapter ??= chapterIndex >= 0
      ? parts[chapterIndex + 1]?.match(/^(\d+(?:\.\d+)?)$/)?.[1]
      : undefined

    return {
      kind: chapter ? 'chapter' : 'series',
      chapter,
      seriesSlug: parts[1],
      seriesUrl: `${origin}/${parts[0]}/${parts[1]}`,
    }
  }

  if (site.name === 'Abmics') {
    const episodeIndex = lower.indexOf('episode')
    if (episodeIndex >= 0 && parts[episodeIndex + 1]) {
      const episodeSlug = parts[episodeIndex + 1]!
      const match = episodeSlug.match(/^(.*?)-(\d+(?:\.\d+)?)$/)
      chapter ??= match?.[2]
      const seriesSlug = match?.[1] ?? episodeSlug
      return {
        kind: 'chapter',
        chapter,
        seriesSlug,
        seriesUrl: `${origin}/abmic/${seriesSlug}/`,
      }
    }

    const seriesIndex = lower.indexOf('abmic')
    if (seriesIndex >= 0 && parts[seriesIndex + 1]) {
      return {
        kind: 'series',
        seriesSlug: parts[seriesIndex + 1],
        seriesUrl: location.href,
      }
    }
  }

  const mangaIndex = lower.findIndex(part => ['manga', 'manhwa', 'manhua', 'webtoon', 'comic', 'series'].includes(part))
  const chapterIndex = lower.findIndex(part => /^(?:chapter|ch)(?:-|$)/i.test(part))
  if (chapterIndex >= 0) {
    chapter ??= parts[chapterIndex]!.match(/(?:chapter|ch)-?(\d+(?:\.\d+)?)/i)?.[1]
      ?? parts[chapterIndex + 1]?.match(/^(\d+(?:\.\d+)?)$/)?.[1]
  }

  if (mangaIndex >= 0 && parts[mangaIndex + 1]) {
    const seriesSlug = parts[mangaIndex + 1]!.replace(/\.html?$/i, '')
    let seriesUrl = `${origin}/${parts.slice(0, mangaIndex + 1).join('/')}/${seriesSlug}`
    if (/\.html?$/i.test(parts[mangaIndex + 1]!))
      seriesUrl += '.html'

    return {
      kind: chapter ? 'chapter' : 'series',
      chapter,
      seriesSlug,
      seriesUrl,
    }
  }

  if (chapter) {
    const link = seriesLinkFromPage()
    return {
      kind: 'chapter',
      chapter,
      seriesUrl: absoluteUrl(link?.getAttribute('href')),
    }
  }

  return { kind: 'browse' }
}

function getSiteIcon(): string {
  const logoSelectors = [
    'header img[alt*="logo" i]',
    'img[alt*="logo" i]',
  ]

  for (const selector of logoSelectors) {
    const logo = imageFromElement(document.querySelector<HTMLImageElement>(selector), location.href)
    if (logo)
      return logo
  }

  const icon = document.querySelector<HTMLLinkElement>(
    'link[rel="apple-touch-icon"], link[rel="icon"], link[rel="shortcut icon"]',
  )
  return absoluteUrl(icon?.href) ?? `${location.origin}/favicon.ico`
}

function imageFromElement(element: HTMLImageElement | null, base: string): string | undefined {
  if (!element)
    return undefined

  const value = element.currentSrc
    || element.src
    || element.dataset.src
    || element.dataset.lazySrc
    || element.getAttribute('data-original')

  return absoluteUrl(value, base)
}

function getCover(doc: Document, base: string): string | undefined {
  const selectors = [
    'img[alt*="Cover" i]',
    'img[alt*="غلاف"]',
    'img[alt="Manga Image"]',
    '[class*="cover" i] img',
    '[class*="poster" i] img',
    '[class*="summary_image" i] img',
    'img[itemprop="image"]',
  ]

  for (const selector of selectors) {
    const image = imageFromElement(doc.querySelector<HTMLImageElement>(selector), base)
    if (image)
      return image
  }

  const metaImage = doc.querySelector<HTMLMetaElement>(
    'meta[property="og:image"], meta[name="twitter:image"]',
  )?.content
  return absoluteUrl(metaImage, base)
}

function isNavigationElement(element: Element): boolean {
  return Boolean(element.closest(
    'header, nav, footer, aside, [role="navigation"], .menu, .menus, .navbar, .sidebar, .side-bar',
  ))
}

function classifierText(doc: Document): string {
  const pieces: string[] = []

  for (const meta of doc.querySelectorAll<HTMLMetaElement>(
    'meta[name="keywords"], meta[property="article:tag"]',
  )) {
    pieces.push(meta.content)
  }

  const tagSelectors = [
    'a[href*="/genre/" i]',
    'a[href*="/genres/" i]',
    'a[href*="/tag/" i]',
    'a[href*="/tags/" i]',
    'a[href*="/category/" i]',
    '[class~="genre" i]',
    '[class~="genres" i]',
    '[class~="tag" i]',
    '[class~="tags" i]',
    '[class*="manga-genres" i]',
    '[class*="post-tags" i]',
    '[class*="series-tags" i]',
  ]

  for (const element of doc.querySelectorAll<HTMLElement>(tagSelectors.join(','))) {
    if (isNavigationElement(element))
      continue

    pieces.push(element.textContent ?? '', element.getAttribute('href') ?? '')
  }

  for (const script of doc.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]')) {
    if (script.textContent && script.textContent.length < 100_000)
      pieces.push(script.textContent)
  }

  return pieces.join(' ').toLowerCase()
}

function hasSensitiveTags(doc: Document): boolean {
  const text = classifierText(doc)
  return sensitiveTerms.some(term => text.includes(term.toLowerCase()))
}

async function fetchSeriesDocument(seriesUrl: string | undefined): Promise<Document | undefined> {
  if (!seriesUrl || seriesUrl === location.href)
    return undefined

  try {
    const response = await fetch(seriesUrl, { credentials: 'same-origin' })
    if (!response.ok)
      return undefined

    const html = await response.text()
    return new DOMParser().parseFromString(html, 'text/html')
  }
  catch {
    return undefined
  }
}

async function isSensitive(info: PageInfo, seriesDoc?: Document): Promise<boolean> {
  const cacheKey = info.seriesUrl ?? location.href
  if (classificationCache.has(cacheKey))
    return classificationCache.get(cacheKey) ?? false

  const result = hasSensitiveTags(document) || (seriesDoc ? hasSensitiveTags(seriesDoc) : false)
  classificationCache.set(cacheKey, result)
  return result
}

function getSeriesTitle(site: SiteConfig, info: PageInfo, seriesDoc?: Document): string {
  if (site.name === 'Azora Manga') {
    const doc = seriesDoc ?? document
    const azoraTitle = cleanSeriesTitle(
      doc.querySelector('h1.break-words')?.textContent ?? '',
      site,
      info.chapter,
    )
    if (azoraTitle)
      return azoraTitle
  }

  if (site.name === 'OlympusStaff' && info.kind === 'chapter' && info.seriesSlug)
    return slugToTitle(info.seriesSlug)

  if (site.name === 'Abmics' && info.kind === 'chapter') {
    const seriesLink = document.querySelector<HTMLAnchorElement>('a[href*="/abmic/"]')
    const linkedTitle = cleanSeriesTitle(seriesLink?.textContent ?? '', site, info.chapter)
    if (linkedTitle)
      return linkedTitle
  }

  const linkedTitle = cleanSeriesTitle(seriesLinkFromPage()?.textContent ?? '', site, info.chapter)
  const docs = [seriesDoc, document].filter(Boolean) as Document[]
  const selectors = [
    '[class*="series-title" i]',
    '[class*="manga-title" i]',
    '[class*="post-title" i] h1',
    'h1',
  ]

  for (const doc of docs) {
    for (const selector of selectors) {
      const candidate = cleanSeriesTitle(doc.querySelector(selector)?.textContent ?? '', site, info.chapter)
      if (candidate)
        return candidate
    }

    const ogTitle = cleanSeriesTitle(
      doc.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.content ?? '',
      site,
      info.chapter,
    )
    if (ogTitle)
      return ogTitle

    const pageTitle = cleanSeriesTitle(doc.title, site, info.chapter)
    if (pageTitle)
      return pageTitle
  }

  if (linkedTitle)
    return linkedTitle

  return info.seriesSlug ? slugToTitle(info.seriesSlug.replace(/-s$/i, '')) : 'مانجا / مانهوا'
}

presence.on('UpdateData', async () => {
  const site = currentSite()
  if (!site) {
    presence.clearActivity()
    return
  }

  const info = detectPageInfo(site)
  const sessionTimestamp = timerTimestampFor(site, info)

  const [showCover, showTimestamp, showButtons, showSiteIcon] = await Promise.all([
    presence.getSetting<boolean>('cover').catch(() => true),
    presence.getSetting<boolean>('time').catch(() => true),
    presence.getSetting<boolean>('buttons').catch(() => true),
    presence.getSetting<boolean>('siteIcon').catch(() => true),
  ])

  const seriesDoc = info.kind === 'chapter' || info.kind === 'series'
    ? await fetchSeriesDocument(info.seriesUrl)
    : undefined

  if ((info.kind === 'chapter' || info.kind === 'series') && await isSensitive(info, seriesDoc)) {
    presence.clearActivity()
    return
  }

  const siteIcon = getSiteIcon()
  const seriesTitle = getSeriesTitle(site, info, seriesDoc)
  const cover = showCover
    ? getCover(seriesDoc ?? document, info.seriesUrl ?? location.href) ?? getCover(document, location.href)
    : undefined

  const presenceData: PresenceData = {
    largeImageKey: cover ?? siteIcon,
  }

  if (showSiteIcon && cover) {
    presenceData.smallImageKey = siteIcon
    presenceData.smallImageText = site.name
  }

  if (info.kind === 'chapter') {
    presenceData.details = `يقرا ${seriesTitle}`
    presenceData.state = info.chapter
      ? `الفصل ${info.chapter} • ${site.name}`
      : `يقرا فصلا • ${site.name}`

    if (showTimestamp)
      presenceData.startTimestamp = sessionTimestamp
    if (showButtons)
      presenceData.buttons = [{ label: 'فتح الفصل', url: location.href }]
  }
  else if (info.kind === 'series') {
    presenceData.details = `يتصفح ${seriesTitle}`
    presenceData.state = site.name

    if (showTimestamp)
      presenceData.startTimestamp = sessionTimestamp
    if (showButtons)
      presenceData.buttons = [{ label: 'فتح العمل', url: location.href }]
  }
  else {
    presenceData.details = `يتصفح ${site.name}`
    presenceData.state = 'مانجا ومانهوا عربية'
    presenceData.largeImageKey = siteIcon

    if (showTimestamp)
      presenceData.startTimestamp = sessionTimestamp
  }

  presence.setActivity(presenceData)
})
