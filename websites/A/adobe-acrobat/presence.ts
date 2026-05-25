import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1501871470559756398',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://imgur.com/ImZQntp.png',
}

interface BookData {
  title?: string
  author_name?: string[]
  cover_i?: number
}

const BOOK_CACHE_DURATION_MS = 10 * 60 * 1000
const BOOK_FETCH_INTERVAL_MS = 5 * 60 * 1000
const INITIAL_BOOK_FETCH_DELAY_MS = 6000
const TITLE_SIMILARITY_THRESHOLD = 0.4

function isDocumentPage(pathname: string): boolean {
  return pathname.includes('/id/') || pathname.includes('/document/')
}

function parseBookString(raw: string): { title: string | null, author: string | null } {
  const openIdx = raw.indexOf('(')
  let title: string | null, author: string | null

  if (openIdx !== -1) {
    const closeIdx = raw.indexOf(')', openIdx)
    if (closeIdx !== -1) {
      author = raw.slice(openIdx + 1, closeIdx).trim() || null
      title = raw.slice(0, openIdx).trim()
    }
    else {
      author = null
      title = raw.trim()
    }

    if (title.toLowerCase().endsWith('.pdf'))
      title = title.slice(0, -4).trim() || null
  }
  else {
    author = null
    const pdfIdx = raw.toLowerCase().indexOf('.pdf')
    title = (pdfIdx !== -1 ? raw.slice(0, pdfIdx) : raw).trim() || null
  }

  return { title, author }
}

function normalizeDocumentTitle(rawTitle: string): string {
  return rawTitle
    .replace(/\s*[-|•]\s*Adobe Acrobat(?:\s+Online)?\s*$/i, '')
    .replace(/\s*::\s*Adobe Acrobat\s*$/i, '')
    .trim()
}

function parseDocumentTitle() {
  return parseBookString(normalizeDocumentTitle(document.title?.trim() ?? ''))
}

function titleSimilarity(a: string, b: string): number {
  const words = (s: string) =>
    new Set(s.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean))
  const wa = words(a)
  const wb = words(b)
  let common = 0
  for (const w of wa) {
    if (wb.has(w))
      common++
  }
  const union = new Set([...wa, ...wb]).size
  return union === 0 ? 0 : common / union
}

let cachedBook: { key: string, data: BookData, timestamp: number } | null = null
let currentBookData: BookData | null = null
let currentCoverUrl: string = ActivityAssets.Logo
let lastKnownCacheKey: string | null = null

async function fetchBookData(): Promise<void> {
  const { pathname } = document.location
  if (!isDocumentPage(pathname))
    return

  const { title: pdfTitle, author } = parseDocumentTitle()
  if (!pdfTitle)
    return

  const cacheKey = `${pdfTitle}::${author ?? ''}`

  if (lastKnownCacheKey !== null && lastKnownCacheKey !== cacheKey) {
    currentBookData = null
    currentCoverUrl = ActivityAssets.Logo
    cachedBook = null
  }
  lastKnownCacheKey = cacheKey

  if (
    cachedBook
    && cachedBook.key === cacheKey
    && Date.now() - cachedBook.timestamp < BOOK_CACHE_DURATION_MS
  ) {
    currentBookData = cachedBook.data
    return
  }

  const queryTitle = encodeURIComponent(pdfTitle)
  const queryAuthor = author ? encodeURIComponent(author) : null
  const query = queryAuthor
    ? `https://openlibrary.org/search.json?author=${queryAuthor}&q=${queryTitle}`
    : `https://openlibrary.org/search.json?q=${queryTitle}`

  try {
    const response = await fetch(query)
    if (!response.ok)
      return

    const result = (await response.json()) as { docs?: BookData[] }
    const candidates = result?.docs?.slice(0, 10) ?? []
    if (candidates.length === 0)
      return

    // pick the best match across first 10 results instead of blindly taking [0]
    let bestBook: BookData | null = null
    let bestScore = -1

    for (const candidate of candidates) {
      const score = titleSimilarity(pdfTitle, candidate.title ?? '')
      if (score > bestScore) {
        bestScore = score
        bestBook = candidate
      }
    }

    if (!bestBook)
      return

    if (bestBook.cover_i && bestScore >= TITLE_SIMILARITY_THRESHOLD) {
      currentCoverUrl = `https://covers.openlibrary.org/b/id/${bestBook.cover_i}-L.jpg`
    }
    else {
      currentCoverUrl = ActivityAssets.Logo
    }

    cachedBook = { key: cacheKey, data: bestBook, timestamp: Date.now() }
    currentBookData = bestBook
  }
  catch {
    // presence updates continue even when metadata fetch fails
  }
}

let lastUpdateCacheKey: string | null = null
function checkForBookChange(): void {
  const { pathname } = document.location
  if (!isDocumentPage(pathname))
    return
  const { title: pdfTitle, author } = parseDocumentTitle()
  if (!pdfTitle)
    return
  const cacheKey = `${pdfTitle}::${author ?? ''}`
  if (cacheKey !== lastUpdateCacheKey) {
    lastUpdateCacheKey = cacheKey
    void fetchBookData()
  }
}

setTimeout(() => void fetchBookData(), INITIAL_BOOK_FETCH_DELAY_MS)
setInterval(() => void fetchBookData(), BOOK_FETCH_INTERVAL_MS)

function applyPlaceholders(
  template: string,
  vars: Record<string, string | number | undefined>,
): string {
  let result = template
  for (const [key, val] of Object.entries(vars)) {
    if (val !== undefined) {
      result = result.split(`%${key}%`).join(String(val))
      result = result.split(`%${key}`).join(String(val))
    }
  }
  return result.trim()
}

function cleanupUnresolvedPlaceholders(text: string): string {
  return text
    .replace(/%[a-z0-9_]+%?/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function getCurrentPage(): string | undefined {
  const selectors = [
    '.PageNumberUI__pageNumberInputModern___jDxM-',
    'input[aria-label*="Page"]',
    'input[name="pageNumber"]',
  ]

  for (const selector of selectors) {
    const value = (document.querySelector(selector) as HTMLInputElement | null)?.value?.trim()
    if (value && /^\d+$/.test(value))
      return value
  }
}

function getTotalPages(): string | undefined {
  const selectors = [
    '.PageNumberUI__totalPagesModern___wcFXK',
    '[class*="totalPages"]',
    '[aria-label*="Total pages"]',
  ]

  for (const selector of selectors) {
    const raw = document.querySelector(selector)?.textContent?.trim()
    if (!raw)
      continue
    const match = raw.match(/\d+/)
    if (match?.[0])
      return match[0]
  }
}

async function updatePresence() {
  checkForBookChange()

  const presenceData: PresenceData = {
    name: 'Adobe Acrobat',
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  const { pathname } = document.location

  if (
    pathname === '/' || pathname === ''
    || pathname === '/link/home/' || pathname === '/link/home'
  ) {
    presenceData.details = 'Browsing Homepage'
    presenceData.state = ''
  }

  else if (isDocumentPage(pathname)) {
    const { title: pdfTitle, author: parsedAuthor } = parseDocumentTitle()
    const resolvedAuthor = currentBookData?.author_name?.[0] ?? parsedAuthor ?? undefined

    presenceData.largeImageKey = currentCoverUrl

    const currentPage = getCurrentPage()
    const totalPages = getTotalPages()

    const detailsSetting = await presence.getSetting<unknown>('details')
    const stateSetting = await presence.getSetting<unknown>('state')

    const detailsTemplate = typeof detailsSetting === 'string' && detailsSetting.trim()
      ? detailsSetting
      : '%title%'
    const stateTemplate = typeof stateSetting === 'string' && stateSetting.trim()
      ? stateSetting
      : 'Page %page% of %total%'

    const placeholders = {
      title: pdfTitle ?? undefined,
      author: resolvedAuthor,
      page: currentPage ?? undefined,
      total: totalPages ?? undefined,
    }

    const detailsText = cleanupUnresolvedPlaceholders(applyPlaceholders(detailsTemplate, placeholders))
    const stateText = cleanupUnresolvedPlaceholders(applyPlaceholders(stateTemplate, placeholders))

    presenceData.details = detailsText || pdfTitle || 'Reading a PDF'
    presenceData.state = stateText || (currentPage && totalPages ? `Page ${currentPage} of ${totalPages}` : '')
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = 'Reading'
  }

  else if (pathname.includes('/files')) {
    presenceData.details = 'Browsing files'
    presenceData.state = 'Viewing uploaded files'
  }
  else if (pathname.includes('/spaces')) {
    presenceData.details = 'Browsing Spaces'
    presenceData.state = 'Viewing cloud documents'
  }
  else if (pathname.includes('/scans')) {
    presenceData.details = 'Browsing Scans'
    presenceData.state = 'Viewing scanned documents'
  }
  else if (pathname.includes('/online')) {
    presenceData.details = 'Browsing Adobe Acrobat'
    presenceData.state = 'Online Tools'
  }
  else if (pathname.includes('/signin') || pathname.includes('/login')) {
    presenceData.details = 'Signing in to Adobe Acrobat'
    presenceData.state = 'Login page'
  }
  else {
    presenceData.details = 'Browsing Adobe Acrobat'
    presenceData.state = ''
  }

  presence.setActivity(presenceData)
}

presence.on('UpdateData', () => void updatePresence())
