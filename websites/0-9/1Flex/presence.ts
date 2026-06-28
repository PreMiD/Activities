import { ActivityType, Assets, getTimestamps, getTimestampsFromMedia, StatusDisplayType } from 'premid'

declare global {
  interface Window {
    __premid1FlexRouteHooksInstalled?: boolean
  }
}

const presence = new Presence({
  clientId: '1520346822692835409',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://imgur.com/etdu1L5.png',
  Thumbnail = 'https://imgur.com/r3cFlG5.png',
}

async function getStrings() {
  return presence.getStrings({
    playing: 'general.playing',
    paused: 'general.paused',
    live: 'general.live',
    searchFor: 'general.searchFor',
    viewHome: 'general.viewHome',
    viewMovie: 'general.viewMovie',
    viewShow: 'general.viewShow',
    watchingMovie: 'general.watchingMovie',
    watchingSeries: 'general.watchingSeries',
    watchingLive: 'general.watchingLive',
    brandTagline: '1flex.brandTagline',
    privacy: '1flex.privacy',
    privacyState: '1flex.privacyState',
    homePremium: '1flex.homePremium',
    homeCinematic: '1flex.homeCinematic',
    homeState: '1flex.homeState',
    searching: '1flex.searching',
    searchIdle: '1flex.searchIdle',
    query: '1flex.query',
    languageLabel: '1flex.languageLabel',
    genreLabel: '1flex.genreLabel',
    categoryLabel: '1flex.categoryLabel',
    countryLabel: '1flex.countryLabel',
    providerLabel: '1flex.providerLabel',
    sortLabel: '1flex.sortLabel',
    movieBrowse: '1flex.movieBrowse',
    moviePick: '1flex.moviePick',
    showBrowse: '1flex.showBrowse',
    showPick: '1flex.showPick',
    liveDetails: '1flex.liveDetails',
    liveState: '1flex.liveState',
    sportsDetails: '1flex.sportsDetails',
    sportsState: '1flex.sportsState',
    gamesDetails: '1flex.gamesDetails',
    gamesState: '1flex.gamesState',
    torrentDetails: '1flex.torrentDetails',
    torrentState: '1flex.torrentState',
    languageDetails: '1flex.languageDetails',
    languageState: '1flex.languageState',
    myListDetails: '1flex.myListDetails',
    myListState: '1flex.myListState',
    animeDetails: '1flex.animeDetails',
    animeState: '1flex.animeState',
    profile: '1flex.profile',
    login: '1flex.login',
    movieDetails: '1flex.movieDetails',
    showDetails: '1flex.showDetails',
    moreInfo: '1flex.moreInfo',
    pausedSuite: '1flex.paused',
    buffering: '1flex.buffering',
    sportsStream: '1flex.sportsStream',
    streamingState: '1flex.streamingState',
    seasonEpisode: '1flex.seasonEpisode',
    unknownEpisode: '1flex.unknownEpisode',
    contentFallback: '1flex.contentFallback',
    downloadLinks: '1flex.downloadLinks',
    in1Flex: '1flex.in1Flex',
    buttonOpen: '1flex.buttonOpen',
    buttonSearch: '1flex.buttonSearch',
    buttonWatch: '1flex.buttonWatch',
    buttonLive: '1flex.buttonLive',
    buttonGames: '1flex.buttonGames',
    buttonTorrent: '1flex.buttonTorrent',
    buttonMyList: '1flex.buttonMyList',
    buttonLanguages: '1flex.buttonLanguages',
    buttonAnime: '1flex.buttonAnime',
  })
}

type OneFlexStrings = Awaited<ReturnType<typeof getStrings>>

interface WatchProgress {
  watched?: number
  duration?: number
}

interface TmdbEpisode {
  episode_number?: number
  season_number?: number
  name?: string
  overview?: string
  air_date?: string
  still_path?: string | null
}

interface TmdbMovieDetails {
  id?: number
  title?: string
  original_title?: string
  overview?: string
  release_date?: string
  poster_path?: string | null
  backdrop_path?: string | null
}

interface TmdbTVDetails {
  id?: number
  name?: string
  original_name?: string
  overview?: string
  first_air_date?: string
  poster_path?: string | null
  backdrop_path?: string | null
}

interface TmdbSeasonDetails {
  episodes?: TmdbEpisode[]
}

interface ShowProgressEntry {
  season?: number | string
  episode?: number | string
  title?: string
  name?: string
  episode_title?: string
  description?: string
  overview?: string
  episode_overview?: string
  progress?: WatchProgress
  last_updated?: number
}

interface WatchHistoryEntry {
  id?: number | string
  type?: string
  mediaType?: string
  title?: string
  name?: string
  poster_path?: string | null
  backdrop_path?: string | null
  overview?: string
  release_date?: string
  first_air_date?: string
  progress?: WatchProgress
  last_updated?: number
  last_season_watched?: number | string
  last_episode_watched?: number | string
  season?: number | string
  episode?: number | string
  episode_title?: string
  episode_name?: string
  episode_overview?: string
  description?: string
  show_progress?: Record<string, ShowProgressEntry>
}

interface EpisodeInfo {
  season?: number | string
  episode?: number | string
  title?: string
  overview?: string
  line?: string
}

interface EndpointMediaInfo {
  title?: string
  detailsTitle?: string
  overview?: string
  releaseYear?: string
  cover?: string
}

interface IFramePlaybackData {
  paused?: boolean
  buffering?: boolean
  currentTime?: number
  duration?: number
  title?: string
  src?: string
  pageHref: string
  updatedAt: number
}

interface PresenceSettings {
  privacy: boolean
  showButtons: boolean
  showTimestamps: boolean
  showCover: boolean
  statusStyle: number
}

type OneFlexPresenceData = PresenceData & {
  type: ActivityType.Watching
}

interface MediaPresenceSnapshot {
  data: Partial<OneFlexPresenceData>
  href: string
  updatedAt: number
}

let iframePlaybackData: IFramePlaybackData | null = null
let lastMediaPresenceSnapshot: MediaPresenceSnapshot | null = null
let lastLocalBufferingAt = 0
let lastSportsStreamTitleHint: { title?: string, updatedAt: number } | null = null
let lastContentModalTitleHint: { title?: string, updatedAt: number } | null = null
let lastLocationKey = document.location.href
let scheduledPresenceUpdate: number | undefined
let lastDomPresenceSignature = ''
let lastDomMutationCheckAt = 0
let lastPresenceIdentity = ''
const endpointCache = new Map<string, { expiresAt: number, data: unknown }>()

const tmdbEndpoint = 'https://db.1flex.org'
const iframeDataMaxAge = 4 * 1000
const historyDataMaxAge = 8 * 1000
const mediaSnapshotGrace = 350
const mediaBufferingHold = 3500
const interactionHintMaxAge = 5 * 1000
const endpointTimeout = 800
const endpointSuccessCacheMs = 30 * 1000
const endpointFailureCacheMs = 3 * 1000

const playerHosts = [
  'vidlink.pro',
  'vidsrc.wtf',
  'vidsrc.to',
  'vidsrc.net',
  'vidsrc.xyz',
  'vidsrc.icu',
  'vidsrc.cc',
  'vidsrc.in',
  'vidsrc.pm',
  'vidsrc.me',
  'videasy.to',
  'vidup.to',
  'vidzee.wtf',
  'vidrock.ru',
  'vidplay',
  'vidcloud',
  'vidfast',
  'vidora',
  'vidjoy',
  'embed.su',
  'multiembed',
  '2embed',
  'autoembed',
  'superembed',
  'moviesapi',
  'rabbitstream',
  'megacloud',
  'mcloud',
  'upcloud',
  'streamtape',
  'filemoon',
  'voe.sx',
  'dood',
  'mixdrop',
  'streamwish',
  'uqload',
]

const watchHistoryKeys = [
  'watch-history',
  'vidlink-watch-history',
  'vidsrc-watch-history',
  'videasy-watch-history',
  'vidup-watch-history',
  'vidzee-watch-history',
  'vidrock-watch-history',
]

presence.on('iFrameData', (data: unknown) => {
  if (!isRecord(data))
    return

  iframePlaybackData = {
    paused: typeof data.paused === 'boolean' ? data.paused : undefined,
    buffering: typeof data.buffering === 'boolean' ? data.buffering : undefined,
    currentTime: typeof data.currentTime === 'number' ? data.currentTime : undefined,
    duration: typeof data.duration === 'number' ? data.duration : undefined,
    title: typeof data.title === 'string' ? data.title : undefined,
    src: typeof data.src === 'string' ? data.src : undefined,
    pageHref: document.location.href,
    updatedAt: Date.now(),
  }

  schedulePresenceUpdate(100)
})

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isTechnicalText(value: string): boolean {
  const lowered = value.toLowerCase()
  const noisyFragments = [
    '_next/static',
    'static/chunks',
    'self.__next_f',
    'font/woff2',
    '.woff2',
    'crossorigin',
    'fetchpriority',
    'charset',
    'buildid',
    'assetprefix',
    'initialtree',
    'initialseeddata',
    'dangerouslysetinnerhtml',
    'webpack',
    'polyfills',
  ]

  if (noisyFragments.some(fragment => lowered.includes(fragment)))
    return true

  return lowered.includes('\\"')
    && (
      lowered.includes('font')
      || lowered.includes('href')
      || lowered.includes('script')
      || lowered.includes('src')
      || lowered.includes('type')
    )
}

function cleanText(value?: string | null): string | undefined {
  const cleaned = value
    ?.replace(/\s+/g, ' ')
    .replace(/\s*(?:[-|]\s*)?1Flex(?:\s.*)?$/i, '')
    .trim()

  if (!cleaned || isTechnicalText(cleaned))
    return undefined

  return cleaned
}

function titleCase(value: string): string {
  return value
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function contains(value: string | undefined, search: string): boolean {
  return Boolean(value && value.includes(search))
}

function getFreshHintTitle(hint: { title?: string, updatedAt: number } | null): string | undefined {
  if (!hint || Date.now() - hint.updatedAt > interactionHintMaxAge)
    return undefined

  return hint.title
}

function clearTransientMediaState(keepClickHints = false): void {
  iframePlaybackData = null
  lastMediaPresenceSnapshot = null
  lastLocalBufferingAt = 0
  endpointCache.clear()

  if (!keepClickHints) {
    lastSportsStreamTitleHint = null
    lastContentModalTitleHint = null
  }
}

function syncLocationState(): void {
  if (lastLocationKey === document.location.href)
    return

  lastLocationKey = document.location.href
  clearTransientMediaState()
}

function schedulePresenceUpdate(delay = 250): void {
  if (scheduledPresenceUpdate)
    window.clearTimeout(scheduledPresenceUpdate)

  scheduledPresenceUpdate = window.setTimeout(() => {
    scheduledPresenceUpdate = undefined
    void updatePresence()
  }, delay)
}

function refreshPresenceSoon(delay = 80, keepClickHints = true): void {
  clearTransientMediaState(keepClickHints)
  schedulePresenceUpdate(delay)
}

function hasAnyClass(element: Element, pattern: RegExp): boolean {
  return pattern.test((element.getAttribute('class') ?? '').toString())
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function titleFromSlug(pathname: string): string | undefined {
  const match = decodeURIComponent(pathname).match(
    /^\/(?:movie|movies|tv|show|shows|series)\/(?:\d+[-/]?)?([^/?#]+)/i,
  )

  if (!match?.[1])
    return undefined

  return titleCase(match[1].replace(/[-_]+/g, ' '))
}

function readableRouteLabel(value?: string): string | undefined {
  if (!value)
    return undefined

  const normalized = cleanText(
    decodeURIComponent(value)
      .replace(/^\d+[-_]*/, '')
      .replace(/[-_+]+/g, ' '),
  )

  if (!normalized || /^\d+$/.test(normalized))
    return undefined

  return titleCase(normalized)
}

function formatString(message: string, ...values: Array<number | string | undefined>): string {
  let formatted = message

  values.forEach((value, index) => {
    formatted = formatted.replace(`{${index}}`, value?.toString() ?? '')
  })

  return formatted
}

function truncate(value: string | undefined, maxLength = 128): string | undefined {
  if (!value || value.length <= maxLength)
    return value

  return `${value.slice(0, maxLength - 1).trimEnd()}...`
}

function compactLine(parts: Array<string | undefined>, maxLength = 128): string | undefined {
  return truncate(parts.filter(Boolean).join(' | '), maxLength)
}

function applyLogoCover(presenceData: OneFlexPresenceData): void {
  presenceData.largeImageKey = ActivityAssets.Logo
  presenceData.largeImageText = '1FLEX'
}

function applySimplePresence(
  presenceData: OneFlexPresenceData,
  name: string,
  details: string,
  state?: string,
): void {
  presenceData.name = name
  presenceData.details = details
  presenceData.state = state
  presenceData.smallImageKey = Assets.Viewing
  presenceData.smallImageText = details
  applyLogoCover(presenceData)
}

function playbackStateLine(
  contentLine: string | undefined,
  buffering: boolean,
  paused: boolean,
  strings: OneFlexStrings,
): string | undefined {
  if (buffering)
    return strings.buffering

  if (paused)
    return strings.paused

  return contentLine
}

function getRecordString(record: Record<string, unknown> | undefined, key: string): string | undefined {
  const value = record?.[key]
  return typeof value === 'string' ? value : undefined
}

function getRecordNumber(record: Record<string, unknown> | undefined, key: string): number | undefined {
  const value = record?.[key]
  return typeof value === 'number' ? value : undefined
}

function getRecordNumberOrString(record: Record<string, unknown> | undefined, key: string): number | string | undefined {
  const value = record?.[key]
  return typeof value === 'number' || typeof value === 'string' ? value : undefined
}

function getRecordNullableString(record: Record<string, unknown> | undefined, key: string): string | null | undefined {
  const value = record?.[key]
  return typeof value === 'string' || value === null ? value : undefined
}

function getRecordArray(record: Record<string, unknown> | undefined, key: string): unknown[] | undefined {
  const value = record?.[key]
  return Array.isArray(value) ? value : undefined
}

function parseWatchProgress(value: unknown): WatchProgress | undefined {
  if (!isRecord(value))
    return undefined

  const progress: WatchProgress = {
    watched: getRecordNumber(value, 'watched'),
    duration: getRecordNumber(value, 'duration'),
  }

  return typeof progress.watched === 'number' || typeof progress.duration === 'number'
    ? progress
    : undefined
}

function parseShowProgressEntry(value: unknown): ShowProgressEntry | undefined {
  if (!isRecord(value))
    return undefined

  const entry: ShowProgressEntry = {
    season: getRecordNumberOrString(value, 'season'),
    episode: getRecordNumberOrString(value, 'episode'),
    title: getRecordString(value, 'title'),
    name: getRecordString(value, 'name'),
    episode_title: getRecordString(value, 'episode_title'),
    description: getRecordString(value, 'description'),
    overview: getRecordString(value, 'overview'),
    episode_overview: getRecordString(value, 'episode_overview'),
    progress: parseWatchProgress(value.progress),
    last_updated: getRecordNumber(value, 'last_updated'),
  }

  return Object.values(entry).some(item => item !== undefined) ? entry : undefined
}

function parseShowProgress(value: unknown): Record<string, ShowProgressEntry> | undefined {
  if (!isRecord(value))
    return undefined

  const entries: Array<[string, ShowProgressEntry]> = []

  for (const [key, entry] of Object.entries(value)) {
    const parsed = parseShowProgressEntry(entry)

    if (parsed)
      entries.push([key, parsed])
  }

  return entries.length ? Object.fromEntries(entries) : undefined
}

function parseWatchHistoryEntry(value: Record<string, unknown>, fallbackId?: string): WatchHistoryEntry {
  return {
    id: getRecordNumberOrString(value, 'id') ?? fallbackId,
    type: getRecordString(value, 'type'),
    mediaType: getRecordString(value, 'mediaType'),
    title: getRecordString(value, 'title'),
    name: getRecordString(value, 'name'),
    poster_path: getRecordNullableString(value, 'poster_path'),
    backdrop_path: getRecordNullableString(value, 'backdrop_path'),
    overview: getRecordString(value, 'overview'),
    release_date: getRecordString(value, 'release_date'),
    first_air_date: getRecordString(value, 'first_air_date'),
    progress: parseWatchProgress(value.progress),
    last_updated: getRecordNumber(value, 'last_updated'),
    last_season_watched: getRecordNumberOrString(value, 'last_season_watched'),
    last_episode_watched: getRecordNumberOrString(value, 'last_episode_watched'),
    season: getRecordNumberOrString(value, 'season'),
    episode: getRecordNumberOrString(value, 'episode'),
    episode_title: getRecordString(value, 'episode_title'),
    episode_name: getRecordString(value, 'episode_name'),
    episode_overview: getRecordString(value, 'episode_overview'),
    description: getRecordString(value, 'description'),
    show_progress: parseShowProgress(value.show_progress),
  }
}

function getYearFromDate(value?: string): string | undefined {
  return getFirstMatch(value, /\b((?:19|20)\d{2})\b/)
}

function getNumericValue(value?: number | string): number | undefined {
  if (typeof value === 'number')
    return value

  if (typeof value === 'string') {
    const numeric = Number.parseInt(value, 10)
    return Number.isFinite(numeric) ? numeric : undefined
  }

  return undefined
}

async function fetchEndpointJson(path: string): Promise<unknown | undefined> {
  const cacheKey = `${tmdbEndpoint}${path}`
  const cached = endpointCache.get(cacheKey)

  if (cached && cached.expiresAt > Date.now())
    return cached.data

  try {
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), endpointTimeout)
    const response = await fetch(cacheKey, {
      cache: 'no-store',
      signal: controller.signal,
    })

    window.clearTimeout(timeout)

    if (!response.ok) {
      endpointCache.set(cacheKey, {
        data: undefined,
        expiresAt: Date.now() + endpointFailureCacheMs,
      })
      return undefined
    }

    const data: unknown = await response.json()
    endpointCache.set(cacheKey, {
      data,
      expiresAt: Date.now() + endpointSuccessCacheMs,
    })

    return data
  }
  catch {
    endpointCache.set(cacheKey, {
      data: undefined,
      expiresAt: Date.now() + endpointFailureCacheMs,
    })
    return undefined
  }
}

function applyStatusDisplay(presenceData: OneFlexPresenceData, _settings: PresenceSettings): void {
  presenceData.statusDisplayType = StatusDisplayType.Name
}

function isVisible(element: Element): boolean {
  if (!(element instanceof HTMLElement))
    return false

  const rect = element.getBoundingClientRect()

  if (
    rect.width <= 0
    || rect.height <= 0
    || rect.bottom <= 0
    || rect.right <= 0
    || rect.top >= window.innerHeight
    || rect.left >= window.innerWidth
  ) {
    return false
  }

  for (let current: HTMLElement | null = element; current; current = current.parentElement) {
    const style = window.getComputedStyle(current)

    if (
      current.hidden
      || current.getAttribute('aria-hidden') === 'true'
      || style.display === 'none'
      || style.visibility === 'hidden'
      || style.visibility === 'collapse'
      || Number.parseFloat(style.opacity || '1') <= 0.01
      || hasAnyClass(current, /(?:^|\s)(?:hidden|invisible|opacity-0)(?:\s|$)/)
    ) {
      return false
    }
  }

  return true
}

function hasCloseControl(root: ParentNode): boolean {
  return Array.from(root.querySelectorAll<HTMLElement>('button, [role="button"], a'))
    .some((element) => {
      const label = cleanText(
        element.getAttribute('aria-label')
        ?? element.getAttribute('title')
        ?? element.textContent,
      )

      return Boolean(label && /^(?:close|dismiss|x|\u00D7)$/i.test(label))
        || isCloseControl(element)
    })
}

function isCloseControl(element: HTMLElement): boolean {
  const label = cleanText(
    element.getAttribute('aria-label')
    ?? element.getAttribute('title')
    ?? element.textContent,
  )

  if (label && /^(?:close|dismiss|x|\u00D7)$/i.test(label))
    return true

  const rect = element.getBoundingClientRect()
  const hasIcon = Boolean(element.querySelector<SVGElement>('svg, path'))
  const isSmallButton = rect.width >= 20
    && rect.width <= 80
    && rect.height >= 20
    && rect.height <= 80
  const isTopRight = rect.top <= window.innerHeight * 0.3
    && rect.left >= window.innerWidth * 0.45

  return hasIcon && isSmallButton && isTopRight
}

function getCloseControlDialogRoots(): HTMLElement[] {
  const roots: HTMLElement[] = []
  const controls = Array.from(document.querySelectorAll<HTMLElement>('button, [role="button"], a'))
    .filter(element => isVisible(element) && isCloseControl(element))

  for (const control of controls) {
    let current = control.parentElement
    let depth = 0

    while (current && current !== document.body && depth < 8) {
      const rect = current.getBoundingClientRect()

      if (
        rect.width >= Math.min(window.innerWidth * 0.35, 420)
        && rect.height >= Math.min(window.innerHeight * 0.25, 220)
      ) {
        roots.push(current)
      }

      current = current.parentElement
      depth += 1
    }
  }

  return roots
}

function isOpenDialogCandidate(element: HTMLElement): boolean {
  if (
    element.getAttribute('aria-hidden') === 'true'
    || element.getAttribute('data-state') === 'closed'
    || hasAnyClass(element, /(?:^|\s)(?:hidden|invisible|opacity-0)(?:\s|$)/)
  ) {
    return false
  }

  const text = element.textContent?.toLowerCase() ?? ''
  const rect = element.getBoundingClientRect()

  if (contains(text, 'please click to play video please'))
    return false

  const isDialog = element.matches('[role="dialog"], [aria-modal="true"], [data-download-modal="true"]')
  const hasClose = hasCloseControl(element)
  const hasMedia = Boolean(element.querySelector<HTMLElement>('video, iframe, canvas, img'))
  const hasLargeSurface = rect.width >= Math.min(window.innerWidth * 0.45, 520)
    && rect.height >= Math.min(window.innerHeight * 0.35, 300)
  const hasModalContent = /resume|play|stream|server|provider|episodes|season|cast|genres|this movie is|this show is|download links|sign in|now playing live television|select a stream|admin|hd|live|vs\.?/i.test(text)
  const hasTitle = Boolean(getUsefulHeading(element) ?? getVisibleImageLabel(element))

  return isDialog || (hasClose && (hasMedia || hasModalContent || (hasLargeSurface && hasTitle)))
}

function getText(element?: Element | null): string | undefined {
  return cleanText(element?.textContent)
}

function isSearchInput(input: HTMLInputElement): boolean {
  const hint = `${input.type} ${input.name} ${input.id} ${input.placeholder} ${input.getAttribute('aria-label') ?? ''}`
  return /search|query|movie|film|show|title/i.test(hint)
}

function getActiveSearchQuery(): string | undefined {
  const active = document.activeElement

  if (active instanceof HTMLInputElement && isSearchInput(active))
    return cleanText(active.value)

  const inputs = Array.from(document.querySelectorAll<HTMLInputElement>('input'))
  const input = inputs.find(element => isVisible(element) && isSearchInput(element) && cleanText(element.value))

  return cleanText(input?.value)
}

function getSearchQueryFromUrl(): string | undefined {
  const params = new URLSearchParams(document.location.search)
  const query = params.get('q')
    ?? params.get('query')
    ?? params.get('search')
    ?? params.get('keyword')
    ?? params.get('s')

  return cleanText(query)
}

function getFirstQueryValue(...keys: string[]): string | undefined {
  const params = new URLSearchParams(document.location.search)

  for (const key of keys) {
    const value = readableRouteLabel(params.get(key) ?? undefined)

    if (value)
      return value
  }

  return undefined
}

function getSelectedOptionText(selector: string): string | undefined {
  const select = document.querySelector<HTMLSelectElement>(selector)
  const option = select?.selectedOptions?.[0]
  const text = cleanText(option?.textContent)

  if (!select?.value || !text || /^(?:select|loading|choose)/i.test(text))
    return undefined

  return text
}

function isIgnoredLiveTvTitle(value: string | undefined): boolean {
  return !value
    || /^(?:live|livetv|live tv|watch live tv|now playing live television|admin|hd|other icon|icon|play|pause|close|stream|select stream|select a stream|server|provider)$/i.test(value)
    || /^\d{1,2}:\d{2}(?::\d{2})?$/.test(value)
    || value.length > 90
}

function getLiveTvTitleFromRoot(root: ParentNode): string | undefined {
  return getVisibleTextCandidates(root)
    .map(cleanText)
    .find((text): text is string => Boolean(text && !isIgnoredLiveTvTitle(text)))
    ?? getVisibleTextSegments(root)
      .map(cleanText)
      .find((text): text is string => Boolean(
        text
        && text.length >= 2
        && !isIgnoredLiveTvTitle(text),
      ))
}

function isLiveTvRoute(): boolean {
  return /\/(?:live-tv|livetv|live)(?:\/|$)/i.test(document.location.pathname)
}

function getLiveTvChannelTitle(): string | undefined {
  if (!isLiveTvRoute())
    return undefined

  const selectedStream = getSelectedOptionText([
    'select#stream-select',
    'select[name="streams"]',
    'select[name*="stream" i]',
    'select[name*="channel" i]',
    'select[name*="live" i]',
    'select[id*="stream" i]',
    'select[id*="channel" i]',
    'select[id*="live" i]',
  ].join(', '))

  if (selectedStream && !isIgnoredLiveTvTitle(selectedStream))
    return selectedStream

  const queryTitle = getFirstQueryValue('channel', 'stream', 'name', 'title')

  if (queryTitle && !isIgnoredLiveTvTitle(queryTitle))
    return queryTitle

  const nowPlayingCard = Array.from(document.querySelectorAll<HTMLElement>('div, section, article'))
    .filter(element => isVisible(element))
    .find((element) => {
      const text = element.textContent?.toLowerCase() ?? ''
      return contains(text, 'now playing live television')
    })

  if (!nowPlayingCard)
    return undefined

  return Array.from(nowPlayingCard.querySelectorAll<HTMLElement>('h1, h2, h3, h4'))
    .map(element => getText(element))
    .find(text => Boolean(text && !isIgnoredLiveTvTitle(text)))
    ?? getLiveTvTitleFromRoot(nowPlayingCard)
}

function getRouteSection(): string {
  return document.location.pathname.replace(/\/+$/, '').split('/').filter(Boolean)[0]?.toLowerCase() ?? ''
}

function isSeriesDialog(dialogRoot: HTMLElement, dialogText = dialogRoot.textContent?.toLowerCase() ?? ''): boolean {
  return /this show is|episodes|episode\s+\d+|season\s+\d+|\d+\s+seasons?|tv shows?|series|s\d+\s*e\d+/i.test(dialogText)
}

function getMoreInfoActivityName(dialogRoot: HTMLElement, dialogText = dialogRoot.textContent?.toLowerCase() ?? ''): string {
  const section = getRouteSection()

  if (section === '' || section === '/')
    return 'Home'

  if (section === 'movies' || section === 'movie')
    return 'Movies'

  if (section === 'tv' || section === 'shows' || section === 'show' || section === 'series' || section === 'tv-shows')
    return 'TV Shows'

  if (section === 'my-list' || section === 'watchlist' || section === 'list' || section === 'favorites')
    return isSeriesDialog(dialogRoot, dialogText) ? 'TV Shows' : 'Movies'

  if (section === 'browse-by-languages' || section === 'languages' || section === 'language')
    return isSeriesDialog(dialogRoot, dialogText) ? 'TV Shows' : 'Movies'

  if (section === 'anime')
    return 'Anime'

  return isSeriesDialog(dialogRoot, dialogText) ? 'TV Shows' : 'Movies'
}

function getSelectedTextByHint(hintPattern: RegExp): string | undefined {
  const selects = Array.from(document.querySelectorAll<HTMLSelectElement>('select'))

  for (const select of selects) {
    if (!isVisible(select))
      continue

    const hint = cleanText([
      select.name,
      select.id,
      select.getAttribute('aria-label'),
      select.closest<HTMLLabelElement>('label')?.textContent,
      select.parentElement?.textContent,
    ].filter(Boolean).join(' '))

    if (!hint || !hintPattern.test(hint))
      continue

    const text = cleanText(select.selectedOptions?.[0]?.textContent)

    if (text && !/^(?:select|loading|choose)$/i.test(text))
      return text
  }

  return undefined
}

function isUsefulControlText(text: string | undefined): text is string {
  return Boolean(
    text
    && text.length <= 90
    && !/^(?:select|loading|choose|content type|select your preference|sort by)$/i.test(text),
  )
}

function getPrimaryButtonText(root: ParentNode): string | undefined {
  const buttons = Array.from(root.querySelectorAll<HTMLElement>('button'))

  for (const button of buttons) {
    if (!isVisible(button))
      continue

    const className = `${button.className}`

    if (!/justify-between|min-w-\[|bg-zinc-800|border-zinc-600/.test(className))
      continue

    const text = getText(button.querySelector<HTMLSpanElement>('span') ?? button)

    if (isUsefulControlText(text))
      return text
  }

  return buttons
    .filter(button => isVisible(button))
    .map(button => getText(button.querySelector<HTMLSpanElement>('span') ?? button))
    .find(isUsefulControlText)
}

function getLabeledControlText(labelPattern: RegExp): string | undefined {
  const labels = Array.from(document.querySelectorAll<HTMLElement>('label'))

  for (const label of labels) {
    const labelText = getText(label)

    if (!labelText || !labelPattern.test(labelText) || !isVisible(label))
      continue

    let current = label.parentElement
    let depth = 0

    while (current && current !== document.body && depth < 4) {
      const text = getPrimaryButtonText(current)

      if (text)
        return text

      current = current.parentElement
      depth += 1
    }
  }

  return undefined
}

function getActiveButtonText(...patterns: RegExp[]): string | undefined {
  const buttons = Array.from(document.querySelectorAll<HTMLElement>('button, [role="button"], a'))

  return buttons
    .filter(element => isVisible(element))
    .filter(element => element.getAttribute('aria-pressed') === 'true'
      || element.getAttribute('aria-selected') === 'true'
      || element.getAttribute('aria-current') === 'true'
      || hasAnyClass(element, /(?:^|\s)(?:active|selected|bg-red|text-red|border-red)(?:\s|$)/))
    .map(element => getText(element))
    .find(text => Boolean(text && patterns.some(pattern => pattern.test(text))))
}

function getLanguageBrowserState(): string {
  const type = getFirstQueryValue('type', 'media_type', 'category')
    ?? getLabeledControlText(/content\s*type|type/i)
    ?? getActiveButtonText(/^(?:movies?|series|tv shows?)$/i)
    ?? 'Movies'
  const language = getFirstQueryValue('language', 'lang', 'original_language')
    ?? getLabeledControlText(/select your preference|language|preference/i)
    ?? getSelectedTextByHint(/language|preference/i)
    ?? 'All Languages'
  const sort = getFirstQueryValue('sort', 'order', 'sort_by')
    ?? getLabeledControlText(/sort\s*by|sort/i)
    ?? getSelectedTextByHint(/sort/i)
    ?? getActiveButtonText(/suggestions for you|a-z|z-a|year released|rating/i)
    ?? 'Suggestions for you'

  return compactLine([
    `Type: ${/series|tv/i.test(type) ? 'TV Shows' : 'Movies'}`,
    `Select your preference: ${language}`,
    `Sort By: ${sort}`,
  ]) ?? 'Type: Movies | Select your preference: All Languages | Sort By: Suggestions for you'
}

function getTorrentSearchQuery(): string | undefined {
  return getSearchQueryFromUrl() ?? getActiveSearchQuery()
}

function getTorrentResultCount(): number | undefined {
  const visibleText = getVisibleText(document)
  const displayedCount = getNumericValue(getFirstMatch(visibleText, /search results\s*\(\s*(\d+)\s*found\s*\)/i))

  if (typeof displayedCount === 'number')
    return displayedCount

  const bodyText = visibleText?.toLowerCase() ?? ''

  if (/no results|nothing found|not found|0 results/i.test(bodyText))
    return 0

  const resultElements = Array.from(
    document.querySelectorAll<HTMLElement>('a[href*="magnet:"], a[href*=".torrent"], article, li, [class*="torrent"], [class*="result"]'),
  )
  const seen = new Set<string>()

  for (const element of resultElements) {
    if (!isVisible(element))
      continue

    if (element.closest<HTMLElement>('nav, header, footer'))
      continue

    const text = getText(element)
    const href = element instanceof HTMLAnchorElement ? element.href : element.querySelector<HTMLAnchorElement>('a[href]')?.href

    if (!text && !href)
      continue

    if (!/magnet|torrent|seed|leech|\b(?:gb|mb)\b|download/i.test(`${text ?? ''} ${href ?? ''}`))
      continue

    const key = href ?? text

    if (key)
      seen.add(key)
  }

  if (seen.size > 0)
    return seen.size

  return getTorrentSearchQuery() ? 0 : undefined
}

function getTorrentState(): string | undefined {
  const query = getTorrentSearchQuery()

  if (!query)
    return undefined

  const count = getTorrentResultCount()

  if (count === 0)
    return 'No results found'

  if (typeof count === 'number')
    return `Search Results (${count} found)`

  return `Searching: ${query}`
}

function collectMediaRecords(value: unknown, records: Record<string, unknown>[] = []): Record<string, unknown>[] {
  if (Array.isArray(value)) {
    for (const item of value)
      collectMediaRecords(item, records)

    return records
  }

  if (!isRecord(value))
    return records

  const hasMediaShape = Boolean(value.id || value.title || value.name)
    && Boolean(value.type || value.mediaType || value.poster_path || value.backdrop_path)

  if (hasMediaShape)
    records.push(value)

  for (const item of Object.values(value))
    collectMediaRecords(item, records)

  return records
}

function getStoredMyListCounts(): { movies: number, series: number } | undefined {
  const records: Record<string, unknown>[] = []

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index)

    if (!key || !/my.?list|watch.?list|favorite|bookmark|saved/i.test(key))
      continue

    try {
      collectMediaRecords(JSON.parse(localStorage.getItem(key) ?? ''), records)
    }
    catch {
      // Ignore unrelated localStorage values.
    }
  }

  if (!records.length)
    return undefined

  return records.reduce<{ movies: number, series: number }>((counts, record) => {
    const type = `${record.type ?? record.mediaType ?? ''}`.toLowerCase()

    if (/tv|show|series/.test(type))
      counts.series += 1
    else
      counts.movies += 1

    return counts
  }, { movies: 0, series: 0 })
}

function getMyListCounts(): { movies: number, series: number } {
  const cards = Array.from(
    document.querySelectorAll<HTMLElement>('a[href], article, [class*="card"], [class*="movie"], [class*="show"], [class*="series"]'),
  )
  const seen = new Set<string>()
  const counts = { movies: 0, series: 0 }

  for (const card of cards) {
    if (!isVisible(card))
      continue

    if (card.closest<HTMLElement>('nav, header, footer'))
      continue

    const href = card instanceof HTMLAnchorElement ? card.href : card.querySelector<HTMLAnchorElement>('a[href]')?.href
    const text = getText(card)
    const signature = href ?? text

    if (!signature || seen.has(signature))
      continue

    if (/^(?:home|movies|tv shows|series|games|livetv|sports|torrents|anime|my list|browse by languages)$/i.test(text ?? ''))
      continue

    const haystack = `${href ?? ''} ${text ?? ''}`.toLowerCase()

    if (/\/(?:tv|show|shows|series|tv-shows)\b|season|episode|\bs\d+\s*e\d+|\d+\s+seasons?/.test(haystack)) {
      counts.series += 1
      seen.add(signature)
    }
    else if (/\/(?:movie|movies)\b|\bmovie\b|\bfilm\b|\b\d+h(?:\s*\d+m)?\b/.test(haystack)) {
      counts.movies += 1
      seen.add(signature)
    }
  }

  if (counts.movies || counts.series)
    return counts

  return getStoredMyListCounts() ?? counts
}

function getMetaContent(selector: string): string | undefined {
  return document.querySelector<HTMLMetaElement>(selector)?.content
}

function getDocumentTitle(): string | undefined {
  return cleanText(
    getMetaContent('meta[property="og:title"]')
    ?? getMetaContent('meta[name="twitter:title"]')
    ?? document.title,
  )
}

function getUsefulHeading(root: ParentNode = document): string | undefined {
  const ignored = [
    'home',
    'movies',
    'tv shows',
    'series',
    'games',
    'livetv',
    'live tv',
    'sports',
    'torrents',
    'torrent',
    'anime',
    'my list',
    'browse by languages',
    'continue watching',
    'download links',
    'sign in required',
    'authentication required',
    'episodes',
    'more like this',
    'spoiler protection',
    'trending now',
    'popular movies',
    'popular tv shows',
    'top rated movies',
    'top rated tv shows',
    'recently added',
    'new episode',
    'explore all',
    'loading more',
    'no more results',
    'no content available',
    'no content found',
    'happy christmas',
  ]

  const headings = Array.from(root.querySelectorAll<HTMLElement>('h1, h2, [class*="title"]'))

  for (const heading of headings) {
    const text = getText(heading)

    if (
      text
      && text.length <= 90
      && !ignored.some(ignoredText => text.toLowerCase() === ignoredText || contains(text.toLowerCase(), ignoredText))
      && !/^(?:watching|browsing|choosing|live|hd|admin|other icon|logo|poster|backdrop)$/i.test(text)
    ) {
      return text
    }
  }

  return undefined
}

function getVisibleImageLabel(root: ParentNode = document): string | undefined {
  return Array.from(root.querySelectorAll<HTMLImageElement>('img'))
    .filter(image => isVisible(image))
    .sort((first, second) => {
      const firstRect = first.getBoundingClientRect()
      const secondRect = second.getBoundingClientRect()

      return secondRect.width * secondRect.height - firstRect.width * firstRect.height
    })
    .map(image => cleanText(
      image.alt
      || image.title
      || image.getAttribute('aria-label'),
    ))
    .find(label => Boolean(label && !/^(?:logo|poster|backdrop|image|thumbnail|other icon)$/i.test(label)))
}

function getVisibleTextCandidates(root: ParentNode = document): string[] {
  const selector = [
    'h1',
    'h2',
    'h3',
    'h4',
    '[class*="title"]',
    '[class*="font-medium"]',
    '[class*="font-bold"]',
    '[class*="font-semibold"]',
    '[class*="text-lg"]',
    '[class*="text-xl"]',
    '[class*="text-2xl"]',
    '[class*="text-3xl"]',
  ].join(', ')

  return Array.from(root.querySelectorAll<HTMLElement>(selector))
    .filter(element => isVisible(element))
    .map(element => getText(element))
    .filter((text): text is string => Boolean(
      text
      && text.length >= 8
      && text.length <= 120
      && !/^(?:home|movies|tv shows|series|games|livetv|sports|torrents|anime|my list|browse by languages|continue watching|live sports|admin|hd|live|play|resume|close|other icon)$/i.test(text)
      && !/watch live sports|stream movies|episodes|explore all|loading more|no more results/i.test(text),
    ))
}

function getVisibleTextSegments(root: ParentNode = document): string[] {
  const selector = [
    'h1',
    'h2',
    'h3',
    'h4',
    'span',
    'p',
    'button',
    '[class*="font-medium"]',
    '[class*="font-bold"]',
    '[class*="font-semibold"]',
    '[class*="text-lg"]',
    '[class*="text-xl"]',
    '[class*="text-2xl"]',
    '[class*="text-3xl"]',
  ].join(', ')
  const seen = new Set<string>()

  return Array.from(root.querySelectorAll<HTMLElement>(selector))
    .filter(element => isVisible(element))
    .map(element => getText(element))
    .filter((text): text is string => Boolean(text && text.length >= 1 && text.length <= 140))
    .filter((text) => {
      const normalized = text.toLowerCase()

      if (seen.has(normalized))
        return false

      seen.add(normalized)
      return true
    })
}

function isIgnoredSportsText(value: string): boolean {
  return /^(?:sports|live sports|sports stream|live|admin|hd|stream|watch stream|select a stream to begin watching|loading matches|no matches available|all sports|live matches|today's matches|all matches|team 1|team 2|profile|account|notifications?|settings|sign out|logout|login|sign in)$/i.test(value)
    || /^\d{1,2}:\d{2}(?::\d{2})?$/.test(value)
    || (/^[a-z]+$/i.test(value) && value.length <= 3)
}

function isLikelySportsEventTitle(value: string | undefined): value is string {
  if (!value)
    return false

  const text = cleanText(value)

  return Boolean(
    text
    && text.length >= 4
    && text.length <= 120
    && !isIgnoredSportsText(text)
    && !/^(?:close|dismiss|admin|hd|live|watch|stream|play|pause|loading|buffering|select a stream|all sports|live matches|today's matches|profile|account|notifications?|settings|sign out|logout|login|sign in)$/i.test(text)
    && !/\b(?:1st|2nd|3rd|4th)\s+(?:half|quarter)\b/i.test(text)
    && !/^\d+\s*[-:]\s*\d+$/.test(text),
  )
}

function getSportsTitleFromRoot(root: ParentNode): string | undefined {
  const heading = getUsefulHeading(root)

  if (isLikelySportsEventTitle(heading))
    return heading

  const imageLabel = getVisibleImageLabel(root)

  if (isLikelySportsEventTitle(imageLabel))
    return imageLabel

  return getVisibleTextCandidates(root)
    .find(isLikelySportsEventTitle)
}

function getSportsTitleFromSegments(root: ParentNode): string | undefined {
  const segments = getVisibleTextSegments(root)

  for (const [index, segment] of segments.entries()) {
    if (!/^(?:vs\.?|v)$/i.test(segment))
      continue

    const home = [...segments.slice(0, index)]
      .reverse()
      .find(text => !isIgnoredSportsText(text))
    const away = segments
      .slice(index + 1)
      .find(text => !isIgnoredSportsText(text))

    if (home && away)
      return `${home} vs ${away}`
  }

  return undefined
}

function getSportsTitleFromText(root?: ParentNode): string | undefined {
  const text = getVisibleText(root)
    ?.replace(/\b(?:Watch Stream|LIVE|Live Matches|Today's Matches|All Matches|All Sports|HD|admin)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!text)
    return undefined

  const match = text.match(/([A-Z0-9][A-Za-z0-9 '&./-]{2,80}?)\s+(?:vs\.?|v)\s+([A-Z0-9][A-Za-z0-9 '&./-]{2,80})(?=\s|$)/)

  if (!match)
    return undefined

  const home = cleanText(match[1]?.replace(/^(?:football|basketball|baseball|soccer|hockey|tennis|rugby|cricket|mma|boxing|motorsport)\s+/i, ''))
  const away = cleanText(match[2])

  return home && away ? `${home} vs ${away}` : undefined
}

function getSportsStreamTitle(root?: ParentNode): string | undefined {
  if (!root) {
    const titleHint = getFreshHintTitle(lastSportsStreamTitleHint)

    if (titleHint)
      return titleHint
  }

  const roots = root ? [root] : [document]
  const titleFromRoot = roots
    .map(getSportsTitleFromRoot)
    .find(Boolean)
  const titleFromHeading = roots
    .flatMap(getVisibleTextCandidates)
    .find(candidate => /\b(?:vs\.?|v)\b/i.test(candidate))
  const titleFromSegments = roots
    .map(getSportsTitleFromSegments)
    .find(Boolean)
  const titleFromText = roots
    .map(getSportsTitleFromText)
    .find(Boolean)
  const candidates = roots.flatMap(getVisibleTextCandidates)
  const seen = new Set<string>()

  return titleFromRoot
    ?? titleFromHeading
    ?? titleFromSegments
    ?? titleFromText
    ?? candidates
      .filter((candidate) => {
        const normalized = candidate.toLowerCase()

        if (seen.has(normalized))
          return false

        seen.add(normalized)
        return /\b(?:vs\.?|v)\b/i.test(candidate)
      })
      .sort((first, second) => {
        const firstScore = /\bvs\.?\b/i.test(first) ? 2 : 1
        const secondScore = /\bvs\.?\b/i.test(second) ? 2 : 1

        return secondScore - firstScore || second.length - first.length
      })[0]
      ?? (!root ? getFreshHintTitle(lastSportsStreamTitleHint) : undefined)
}

function findInteractionRoot(
  element: HTMLElement,
  predicate: (element: HTMLElement, text: string) => boolean,
): HTMLElement | undefined {
  let current: HTMLElement | null = element
  let depth = 0

  while (current && current !== document.body && depth < 10) {
    const text = getText(current)

    if (text && predicate(current, text))
      return current

    current = current.parentElement
    depth += 1
  }

  return undefined
}

document.addEventListener('click', (event) => {
  const target = event.target

  if (!(target instanceof Element))
    return

  const control = target.closest<HTMLElement>('button, a, [role="button"]')

  if (!control)
    return

  const controlText = getText(control)?.toLowerCase() ?? ''

  if (controlText.includes('watch stream')) {
    const root = findInteractionRoot(control, element => Boolean(getSportsTitleFromRoot(element) ?? getSportsTitleFromSegments(element) ?? getSportsTitleFromText(element)))
    const title = (root ? getSportsStreamTitle(root) : undefined)
      ?? getSportsStreamTitle(control.parentElement ?? document)

    if (title) {
      lastSportsStreamTitleHint = {
        title,
        updatedAt: Date.now(),
      }
    }
  }
  else if (controlText.includes('more info')) {
    const root = findInteractionRoot(control, element => Boolean(getVisibleImageLabel(element) ?? getUsefulHeading(element)))
    const title = root ? getMediaTitle(root) : undefined

    if (title) {
      lastContentModalTitleHint = {
        title,
        updatedAt: Date.now(),
      }
    }
  }

  schedulePresenceUpdate()
}, true)

function installRouteChangeHooks(): void {
  if (window.__premid1FlexRouteHooksInstalled)
    return

  window.__premid1FlexRouteHooksInstalled = true

  const dispatchRouteChange = () => {
    window.dispatchEvent(new Event('premid-1flex-route-change'))
  }
  const pushState = history.pushState
  const replaceState = history.replaceState

  history.pushState = function patchedPushState(...args) {
    const result = pushState.apply(this, args)
    dispatchRouteChange()
    return result
  }

  history.replaceState = function patchedReplaceState(...args) {
    const result = replaceState.apply(this, args)
    dispatchRouteChange()
    return result
  }

  window.addEventListener('popstate', dispatchRouteChange)
  window.addEventListener('hashchange', dispatchRouteChange)
  window.addEventListener('premid-1flex-route-change', () => {
    syncLocationState()
    refreshPresenceSoon(60, true)
  })
}

installRouteChangeHooks()

function getDomPresenceSignature(): string {
  const dialogRoot = getDialogRoot()
  const dialogTitle = dialogRoot
    ? getUsefulHeading(dialogRoot) ?? getVisibleImageLabel(dialogRoot) ?? ''
    : ''
  const routeSection = getRouteSection()
  const routeState = routeSection === 'browse-by-languages' || routeSection === 'languages' || routeSection === 'language'
    ? getLanguageBrowserState()
    : routeSection === 'torrent' || routeSection === 'torrents'
      ? getTorrentState()
      : ''
  const video = getPlayableVideo()
  const iframe = getPlayerFrame()

  return [
    document.location.href,
    dialogTitle,
    routeState ?? '',
    getLiveTvChannelTitle() ?? '',
    video ? 'video' : '',
    iframe?.src ?? '',
  ].join('|')
}

function checkDomPresenceChange(): void {
  const now = Date.now()

  if (now - lastDomMutationCheckAt < 250)
    return

  lastDomMutationCheckAt = now

  window.setTimeout(() => {
    const signature = getDomPresenceSignature()

    if (signature === lastDomPresenceSignature)
      return

    lastDomPresenceSignature = signature
    refreshPresenceSoon(60, true)
  }, 50)
}

function installFreshnessHooks(): void {
  const observer = new MutationObserver(checkDomPresenceChange)

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['aria-hidden', 'class', 'data-state', 'hidden', 'src', 'style'],
  })

  window.addEventListener('watch-history-updated', () => refreshPresenceSoon(60, true))
  window.addEventListener('focus', () => refreshPresenceSoon(60, true))
  window.addEventListener('pageshow', () => refreshPresenceSoon(60, true))
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden)
      refreshPresenceSoon(60, true)
  })
  window.addEventListener('storage', (event) => {
    if (!event.key || /watch-history|1flex_user|list|rating|favorite|bookmark/i.test(event.key))
      refreshPresenceSoon(60, true)
  })

  lastDomPresenceSignature = getDomPresenceSignature()
}

installFreshnessHooks()

function getDialogScore(element: HTMLElement): number {
  const rect = element.getBoundingClientRect()
  const text = element.textContent?.toLowerCase() ?? ''
  let score = 0
  const isNearFullViewport = rect.width >= window.innerWidth * 0.92
    && rect.height >= window.innerHeight * 0.82

  if (element.matches('[role="dialog"], [aria-modal="true"], [data-download-modal="true"]'))
    score += 30

  if (hasCloseControl(element))
    score += 20

  if (element.querySelector<HTMLElement>('video, iframe, canvas'))
    score += 25

  if (element.querySelector<HTMLImageElement>('img'))
    score += 8

  if (/stream|server|provider|now playing live television|select a stream|admin|hd|live|vs\.?/i.test(text))
    score += 18

  if (/cast:|genres?:|this movie is|this show is|episodes|season\s+\d+|collection|resume/i.test(text))
    score += 14

  if (getUsefulHeading(element) ?? getVisibleImageLabel(element))
    score += 12

  if (isNearFullViewport && !element.matches('[role="dialog"], [aria-modal="true"], [data-download-modal="true"]'))
    score -= 24

  if (/home\s+tv shows\s+movies\s+games\s+livetv\s+sports|continue watching/i.test(text))
    score -= 16

  if (/profile|account|notifications?|settings|sign out|logout/i.test(text))
    score -= 40

  const viewportArea = Math.max(window.innerWidth * window.innerHeight, 1)
  const areaRatio = Math.min((rect.width * rect.height) / viewportArea, 1)

  return score + areaRatio * 10
}

function getDialogRoot(): HTMLElement | undefined {
  const candidates = Array.from(new Set<HTMLElement>([
    ...Array.from(
      document.querySelectorAll<HTMLElement>(
        [
          '[role="dialog"]',
          '[aria-modal="true"]',
          '[data-download-modal="true"]',
          '[class*="dialog"]',
          '[class*="modal"]',
          '[class*="overlay"]',
          '[class*="fixed"]',
          '[class*="inset"]',
          '[class*="z-"]',
          '[class*="max-w-"]',
          '[class*="bg-zinc"]',
        ].join(', '),
      ),
    ),
    ...getCloseControlDialogRoots(),
    ...Array.from(document.querySelectorAll<HTMLElement>('body > div div, body > div section, body > div article'))
      .filter((element) => {
        const rect = element.getBoundingClientRect()

        return rect.width >= Math.min(window.innerWidth * 0.45, 520)
          && rect.height >= Math.min(window.innerHeight * 0.35, 300)
          && hasCloseControl(element)
      }),
  ]))

  return candidates
    .filter(element => isVisible(element))
    .sort((first, second) => getDialogScore(second) - getDialogScore(first))
    .find(isOpenDialogCandidate)
}

function getPlayableVideo(): HTMLVideoElement | undefined {
  return Array.from(document.querySelectorAll<HTMLVideoElement>('video'))
    .find((video) => {
      const src = video.currentSrc
        || video.src
        || video.querySelector<HTMLSourceElement>('source')?.src
        || ''

      return isVisible(video)
        && !/festival|splashscreen/i.test(src)
        && (!Number.isNaN(video.duration) || Boolean(src))
    })
}

function getFrameHost(iframe: HTMLIFrameElement): string | undefined {
  try {
    return new URL(iframe.src).hostname.toLowerCase()
  }
  catch {
    return undefined
  }
}

function isKnownPlayerFrame(iframe: HTMLIFrameElement): boolean {
  const src = iframe.src.toLowerCase()
  const host = getFrameHost(iframe)

  return playerHosts.some(playerHost => (
    src.includes(playerHost)
    || host === playerHost
    || Boolean(host?.endsWith(`.${playerHost}`))
  ))
}

function isLikelyPlayerFrame(iframe: HTMLIFrameElement): boolean {
  const src = iframe.src

  if (!src || /^(?:about:blank|javascript:)/i.test(src) || isYouTubeFrame(iframe))
    return false

  if (isKnownPlayerFrame(iframe))
    return true

  const rect = iframe.getBoundingClientRect()
  const viewportArea = Math.max(window.innerWidth * window.innerHeight, 1)
  const isLargeFrame = rect.width * rect.height >= viewportArea * 0.12

  return isLargeFrame && /embed|player|stream|watch|movie|tv|vid|hls|m3u8/i.test(src)
}

function getPlayerFrame(): HTMLIFrameElement | undefined {
  const frames = Array.from(document.querySelectorAll<HTMLIFrameElement>('iframe'))
    .filter(frame => isVisible(frame) && !isTrailerFrame(frame))

  return frames.find(isKnownPlayerFrame)
    ?? frames.find(isLikelyPlayerFrame)
}

function isPlayerRoute(): boolean {
  return /\/(?:player|watch|stream)(?:\/|$)/i.test(document.location.pathname)
}

function isYouTubeFrame(iframe?: HTMLIFrameElement): boolean {
  return Boolean(iframe && /youtube(?:-nocookie)?\.com|youtu\.be/i.test(iframe.src))
}

function isTrailerFrame(iframe: HTMLIFrameElement): boolean {
  const src = iframe.src

  if (!src)
    return false

  if (isYouTubeFrame(iframe))
    return true

  try {
    return /\/yt-player(?:\/|$)/i.test(new URL(src, document.location.href).pathname)
  }
  catch {
    return /\/yt-player(?:\/|$)/i.test(src)
  }
}

function isTrailerRoute(): boolean {
  return /\/yt-player(?:\/|$)/i.test(document.location.pathname)
}

function isTrailerPreviewRoute(): boolean {
  const section = getRouteSection()

  return section === ''
    || section === 'tv'
    || section === 'shows'
    || section === 'show'
    || section === 'series'
    || section === 'tv-shows'
}

function hasTrailerPreviewFrame(root: ParentNode = document): boolean {
  return Array.from(root.querySelectorAll<HTMLIFrameElement>('iframe'))
    .some(frame => isVisible(frame) && isTrailerFrame(frame))
}

function isTrailerPreviewVideo(video: HTMLVideoElement): boolean {
  const src = video.currentSrc
    || video.src
    || video.querySelector<HTMLSourceElement>('source')?.src
    || ''
  const hint = [
    src,
    video.poster,
    video.getAttribute('aria-label'),
    video.getAttribute('title'),
    video.className,
    video.parentElement?.className,
  ].filter(Boolean).join(' ')

  if (/trailer|yt-player|youtube|preview|hero|backdrop|background/i.test(hint))
    return true

  if (!isTrailerPreviewRoute() || isPlayerRoute() || isSportsRoute() || isLiveTvRoute())
    return false

  const rect = video.getBoundingClientRect()
  const viewportArea = Math.max(window.innerWidth * window.innerHeight, 1)
  const isLargePreview = rect.width * rect.height >= viewportArea * 0.08
  const hasPreviewPlaybackMode = video.autoplay
    || video.muted
    || video.defaultMuted
    || video.loop
    || !video.controls

  return isLargePreview && hasPreviewPlaybackMode
}

function hasTrailerPreviewMedia(root: ParentNode = document): boolean {
  return hasTrailerPreviewFrame(root)
    || Array.from(root.querySelectorAll<HTMLVideoElement>('video'))
      .some(video => isVisible(video) && isTrailerPreviewVideo(video))
}

function shouldIgnoreTrailerPreview(root: ParentNode = document): boolean {
  return isTrailerRoute()
    || (isTrailerPreviewRoute() && hasTrailerPreviewMedia(root))
}

function isSportsRoute(): boolean {
  return /\/sports(?:\/|$)/i.test(document.location.pathname)
}

function isLiveStreamRoute(): boolean {
  return isSportsRoute() || isLiveTvRoute()
}

function canUseDetachedFrame(iframe?: HTMLIFrameElement): boolean {
  if (!iframe || isYouTubeFrame(iframe))
    return false

  return isKnownPlayerFrame(iframe)
    || isLikelyPlayerFrame(iframe)
    || isLiveTvRoute()
    || /\/(?:sports|games|movie|movies|tv|shows|show|series|tv-shows|player|watch|stream)(?:\/|$)/i.test(document.location.pathname)
}

function isFinishedPlayback(currentTime?: number, duration?: number): boolean {
  return Boolean(
    duration
    && duration > 0
    && typeof currentTime === 'number'
    && currentTime >= Math.max(duration - 1, duration * 0.98),
  )
}

function hasFreshIframePlaybackData(maxAge = iframeDataMaxAge): boolean {
  return Boolean(
    iframePlaybackData
    && iframePlaybackData.pageHref === document.location.href
    && Date.now() - iframePlaybackData.updatedAt < maxAge,
  )
}

function hasVideoPlaybackEvidence(video?: HTMLVideoElement): boolean {
  if (!video || video.ended || isFinishedPlayback(video.currentTime, video.duration))
    return false

  return !video.paused
    || video.currentTime > 0
    || (Number.isFinite(video.duration) && video.duration > 0 && video.readyState > 0)
}

function hasIframePlaybackEvidence(iframe?: HTMLIFrameElement): boolean {
  if (!iframe || !hasFreshIframePlaybackData())
    return false

  if (isFinishedPlayback(iframePlaybackData?.currentTime, iframePlaybackData?.duration))
    return false

  return Boolean(
    iframePlaybackData?.src
    || typeof iframePlaybackData?.paused === 'boolean'
    || iframePlaybackData?.buffering
    || (iframePlaybackData?.duration && iframePlaybackData.duration > 0),
  )
}

function hasFocusedMediaSurface(video?: HTMLVideoElement, iframe?: HTMLIFrameElement): boolean {
  const mediaElement = video ?? iframe

  if (!mediaElement)
    return false

  const rect = mediaElement.getBoundingClientRect()
  const viewportArea = Math.max(window.innerWidth * window.innerHeight, 1)

  return rect.width * rect.height >= viewportArea * 0.08
}

function isMediaInsideRoot(
  root: HTMLElement | undefined,
  video?: HTMLVideoElement,
  iframe?: HTMLIFrameElement,
): boolean {
  return Boolean(root && ((video && root.contains(video)) || (iframe && root.contains(iframe))))
}

function hasActivePlayerSurface(
  video: HTMLVideoElement | undefined,
  iframe: HTMLIFrameElement | undefined,
  dialogRoot: HTMLElement | undefined,
  isPlayerPage: boolean,
): boolean {
  if (isPlayerPage)
    return true

  if (isMediaInsideRoot(dialogRoot, video, iframe))
    return true

  if (video)
    return hasFocusedMediaSurface(video)

  return canUseDetachedFrame(iframe) && hasFocusedMediaSurface(undefined, iframe)
}

function getHistoryEntries(): WatchHistoryEntry[] {
  const entries: WatchHistoryEntry[] = []

  for (const key of watchHistoryKeys) {
    const raw = localStorage.getItem(key)

    if (!raw)
      continue

    try {
      const parsed: unknown = JSON.parse(raw)
      const values = Array.isArray(parsed)
        ? parsed.map(value => ({ key: undefined, value }))
        : isRecord(parsed)
          ? Object.keys(parsed).map(key => ({ key, value: parsed[key] }))
          : []

      for (const { key, value } of values) {
        if (isRecord(value))
          entries.push(parseWatchHistoryEntry(value, key))
      }
    }
    catch {
      // Ignore broken third-party player cache entries.
    }
  }

  return entries.sort((first, second) => (second.last_updated ?? 0) - (first.last_updated ?? 0))
}

function getLatestHistoryEntry(): WatchHistoryEntry | undefined {
  return getHistoryEntries()[0]
}

function isFreshHistoryEntry(entry?: WatchHistoryEntry, maxAge = historyDataMaxAge): boolean {
  return Boolean(entry?.last_updated && Date.now() - entry.last_updated < maxAge)
}

function getActiveHistoryEntry(root?: ParentNode): WatchHistoryEntry | undefined {
  const entry = getLatestHistoryEntry()

  if (!entry)
    return undefined

  const rootTitle = root ? getUsefulHeading(root) : undefined
  const entryTitle = cleanText(entry.title) ?? cleanText(entry.name)

  if (
    rootTitle
    && entryTitle
    && (
      contains(rootTitle.toLowerCase(), entryTitle.toLowerCase())
      || contains(entryTitle.toLowerCase(), rootTitle.toLowerCase())
    )
  ) {
    return entry
  }

  if (root)
    return undefined

  if (isFreshHistoryEntry(entry))
    return entry

  return undefined
}

function toImageUrl(path?: string | null, size = 'w500'): string | undefined {
  if (!path)
    return undefined

  if (/^https?:\/\//i.test(path))
    return path

  if (path.startsWith('/'))
    return `https://image.tmdb.org/t/p/${size}${path}`

  return undefined
}

function getCover(root?: ParentNode, historyEntry?: WatchHistoryEntry): string {
  const historyCover = toImageUrl(historyEntry?.poster_path)
    ?? toImageUrl(historyEntry?.backdrop_path, 'w780')

  if (!root) {
    return historyCover
      ?? getMetaContent('meta[property="og:image"]')
      ?? ActivityAssets.Thumbnail
  }

  const container = root ?? document
  const images = Array.from(container.querySelectorAll<HTMLImageElement>('img'))
    .filter(image => isVisible(image) && image.src && !/placeholder|favicon|nobg|logo/i.test(image.src))

  return images.find(image => contains(image.src, 'image.tmdb.org'))?.src
    ?? images[0]?.src
    ?? historyCover
    ?? getMetaContent('meta[property="og:image"]')
    ?? ActivityAssets.Thumbnail
}

function getLatestShowProgress(entry?: WatchHistoryEntry): ShowProgressEntry | undefined {
  const progress = entry?.show_progress

  if (!progress)
    return undefined

  const entries = Object.keys(progress)
    .map(key => progress[key])
    .filter((value): value is ShowProgressEntry => Boolean(value))

  return entries.sort((first, second) => (second.last_updated ?? 0) - (first.last_updated ?? 0))[0]
}

function getFirstMatch(value: string | undefined, pattern: RegExp): string | undefined {
  return value?.match(pattern)?.[1]
}

function getVisibleText(root?: ParentNode): string | undefined {
  const container = root instanceof Element ? root : document.body

  if (!container)
    return undefined

  const parts: string[] = []
  let totalLength = 0
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement

      if (!parent || parent.closest<HTMLElement>('script, style, noscript, template, svg'))
        return NodeFilter.FILTER_REJECT

      if (!isVisible(parent) || !cleanText(node.textContent))
        return NodeFilter.FILTER_REJECT

      return NodeFilter.FILTER_ACCEPT
    },
  })

  while (walker.nextNode()) {
    const text = cleanText(walker.currentNode.textContent)

    if (!text)
      continue

    parts.push(text)
    totalLength += text.length

    if (totalLength > 4000)
      break
  }

  return cleanText(parts.join(' '))
}

function getSelectedEpisodeText(root?: ParentNode): string | undefined {
  const container = root ?? document
  const candidates = Array.from(
    container.querySelectorAll<HTMLElement>('[aria-selected="true"], [aria-current="true"], [class*="selected"], [class*="bg-red"], button'),
  )

  return candidates
    .map(candidate => getText(candidate))
    .find(text => Boolean(text && /episode|season|s\d+|e\d+/i.test(text)))
}

function extractEpisodeTitle(value?: string): string | undefined {
  const text = cleanText(value)

  if (!text)
    return undefined

  const match = text.match(/(?:\bseason\s*\d+\s*[-:|]\s*)?(?:\bepisode\s*\d+\b|\bs\d+\s*e\d+\b|\be\d+\b)/i)
  const title = match
    ? cleanText(text.slice((match.index ?? 0) + match[0].length).replace(/^\s*[-:|]\s*/, ''))
    : undefined

  if (title && !/^(?:episode|season)\s*\d+$/i.test(title))
    return title

  return undefined
}

function getEpisodeCardInfo(
  root: ParentNode | undefined,
  episode: number | string | undefined,
  expectedTitle: string | undefined,
): Pick<EpisodeInfo, 'title' | 'overview'> {
  const container = root ?? document
  const episodeNumber = episode?.toString()
  const episodePattern = episodeNumber
    ? new RegExp(`^${escapeRegExp(episodeNumber)}\\b`)
    : undefined
  const candidates = Array.from(
    container.querySelectorAll<HTMLElement>(
      'article, li, [role="listitem"], [class*="episode"], [class*="Episode"], [class*="grid"], [class*="flex"]',
    ),
  )

  const matches = candidates
    .filter(element => isVisible(element))
    .map((element) => {
      const text = getText(element)

      if (!text || text.length < 20 || text.length > 700)
        return undefined

      const title = Array.from(
        element.querySelectorAll<HTMLElement>('h2, h3, h4, [class*="title"], [class*="Title"]'),
      )
        .map(candidate => getText(candidate))
        .find(candidate => Boolean(
          candidate
          && candidate.length <= 90
          && !/^(?:episodes?|season|spoiler protection)$/i.test(candidate),
        ))
      const overview = Array.from(element.querySelectorAll<HTMLElement>('p'))
        .map(candidate => getText(candidate))
        .find(candidate => Boolean(
          candidate
          && candidate.length >= 30
          && !/loading|download|subtitle|sign in|authentication|spoiler/i.test(candidate),
        ))
      const hasExpectedTitle = Boolean(expectedTitle && contains(text, expectedTitle))
      const hasDuration = /\b\d+\s*(?:m|min|minutes)\b/i.test(text)
      const hasEpisodeHint = hasExpectedTitle
        || Boolean(episodePattern?.test(text))
        || (hasDuration && Boolean(title && overview))
      const score = (title ? 3 : 0)
        + (overview ? 3 : 0)
        + (hasExpectedTitle ? 4 : 0)
        + (episodePattern?.test(text) ? 2 : 0)
        + (hasDuration ? 1 : 0)

      return hasEpisodeHint && score >= 5 ? { score, title, overview } : undefined
    })
    .filter((match): match is { score: number, title: string | undefined, overview: string | undefined } => Boolean(match))
    .sort((first, second) => second.score - first.score)

  return {
    title: matches[0]?.title,
    overview: matches[0]?.overview,
  }
}

function getEpisodeInfo(root: ParentNode | undefined, entry: WatchHistoryEntry | undefined, strings: OneFlexStrings): EpisodeInfo {
  const latestShowProgress = getLatestShowProgress(entry)
  const rootText = getVisibleText(root)
  const selectedText = getSelectedEpisodeText(root)
  const season = entry?.last_season_watched
    ?? entry?.season
    ?? latestShowProgress?.season
    ?? getFirstMatch(selectedText, /season\s*(\d+)/i)
    ?? getFirstMatch(rootText, /season\s*(\d+)/i)
    ?? getFirstMatch(selectedText, /\bs(\d+)\s*e\d+/i)
    ?? getFirstMatch(rootText, /\bs(\d+)\s*e\d+/i)
  const episode = entry?.last_episode_watched
    ?? entry?.episode
    ?? latestShowProgress?.episode
    ?? getFirstMatch(selectedText, /episode\s*(\d+)/i)
    ?? getFirstMatch(rootText, /episode\s*(\d+)/i)
    ?? getFirstMatch(selectedText, /\bs\d+\s*e(\d+)/i)
    ?? getFirstMatch(rootText, /\bs\d+\s*e(\d+)/i)
  const storedEpisodeTitle = cleanText(entry?.episode_title)
    ?? cleanText(entry?.episode_name)
    ?? cleanText(latestShowProgress?.episode_title)
    ?? cleanText(latestShowProgress?.title)
    ?? cleanText(latestShowProgress?.name)
    ?? extractEpisodeTitle(selectedText)
    ?? extractEpisodeTitle(rootText)
  const cardInfo = season || episode || latestShowProgress
    ? getEpisodeCardInfo(root, episode, storedEpisodeTitle)
    : {}
  const episodeTitle = storedEpisodeTitle ?? cardInfo.title
  const episodeOverview = cleanText(latestShowProgress?.overview)
    ?? cleanText(latestShowProgress?.description)
    ?? cleanText(latestShowProgress?.episode_overview)
    ?? cleanText(entry?.episode_overview)
    ?? cardInfo.overview

  if (!season && !episode) {
    return {
      title: episodeTitle,
      overview: episodeOverview,
    }
  }

  const seasonEpisode = formatString(strings.seasonEpisode, season, episode)

  return {
    season,
    episode,
    title: episodeTitle,
    overview: episodeOverview,
    line: seasonEpisode,
  }
}

function getReleaseYear(root?: ParentNode, entry?: WatchHistoryEntry): string | undefined {
  const directYear = getFirstMatch(entry?.release_date, /\b((?:19|20)\d{2})\b/)
    ?? getFirstMatch(entry?.first_air_date, /\b((?:19|20)\d{2})\b/)
    ?? getFirstMatch(getVisibleText(root), /\b((?:19|20)\d{2})\b/)

  return directYear
}

function isSeriesContent(entry: WatchHistoryEntry | undefined, episodeInfo: EpisodeInfo): boolean {
  const type = (entry?.type ?? entry?.mediaType ?? '').toLowerCase()

  return type === 'tv'
    || type === 'show'
    || contains(type, 'series')
    || Boolean(episodeInfo.season || episodeInfo.episode || episodeInfo.line)
    || /\/(?:tv|show|shows|series|tv-shows)\b/i.test(document.location.pathname)
}

function parseMovieDetails(data: unknown): TmdbMovieDetails | undefined {
  if (!isRecord(data))
    return undefined

  return {
    id: getRecordNumber(data, 'id'),
    title: getRecordString(data, 'title'),
    original_title: getRecordString(data, 'original_title'),
    overview: getRecordString(data, 'overview'),
    release_date: getRecordString(data, 'release_date'),
    poster_path: getRecordString(data, 'poster_path') ?? null,
    backdrop_path: getRecordString(data, 'backdrop_path') ?? null,
  }
}

function parseTVDetails(data: unknown): TmdbTVDetails | undefined {
  if (!isRecord(data))
    return undefined

  return {
    id: getRecordNumber(data, 'id'),
    name: getRecordString(data, 'name'),
    original_name: getRecordString(data, 'original_name'),
    overview: getRecordString(data, 'overview'),
    first_air_date: getRecordString(data, 'first_air_date'),
    poster_path: getRecordString(data, 'poster_path') ?? null,
    backdrop_path: getRecordString(data, 'backdrop_path') ?? null,
  }
}

function parseSeasonDetails(data: unknown): TmdbSeasonDetails | undefined {
  if (!isRecord(data))
    return undefined

  return {
    episodes: getRecordArray(data, 'episodes')
      ?.filter(isRecord)
      .map((episode): TmdbEpisode => ({
        episode_number: getRecordNumber(episode, 'episode_number'),
        season_number: getRecordNumber(episode, 'season_number'),
        name: getRecordString(episode, 'name'),
        overview: getRecordString(episode, 'overview'),
        air_date: getRecordString(episode, 'air_date'),
        still_path: getRecordString(episode, 'still_path') ?? null,
      })),
  }
}

async function getEndpointMediaInfo(
  entry: WatchHistoryEntry | undefined,
  episodeInfo: EpisodeInfo,
): Promise<EndpointMediaInfo | undefined> {
  const id = entry?.id?.toString()

  if (!id)
    return undefined

  if (isSeriesContent(entry, episodeInfo)) {
    const season = getNumericValue(episodeInfo.season ?? entry?.last_season_watched ?? entry?.season)
    const episode = getNumericValue(episodeInfo.episode ?? entry?.last_episode_watched ?? entry?.episode)
    const [showData, seasonData] = await Promise.all([
      fetchEndpointJson(`/tv/${id}?append_to_response=images,videos,content_ratings,credits,similar,aggregate_credits`),
      season ? fetchEndpointJson(`/tv/${id}/season/${season}`) : Promise.resolve(undefined),
    ])
    const show = parseTVDetails(showData)
    const seasonDetails = parseSeasonDetails(seasonData)
    const selectedEpisode = seasonDetails?.episodes?.find(item => item.episode_number === episode)
    const episodeTitle = cleanText(selectedEpisode?.name)
    const episodeOverview = cleanText(selectedEpisode?.overview)

    return {
      title: cleanText(show?.name) ?? cleanText(show?.original_name),
      detailsTitle: episodeTitle,
      overview: episodeOverview ?? cleanText(show?.overview),
      releaseYear: getYearFromDate(show?.first_air_date),
      cover: toImageUrl(show?.poster_path) ?? toImageUrl(show?.backdrop_path, 'w780'),
    }
  }

  const movie = parseMovieDetails(
    await fetchEndpointJson(`/movie/${id}?append_to_response=images,videos,releases,credits,similar`),
  )

  if (!movie)
    return undefined

  return {
    title: cleanText(movie.title) ?? cleanText(movie.original_title),
    detailsTitle: cleanText(movie.title) ?? cleanText(movie.original_title),
    overview: cleanText(movie.overview),
    releaseYear: getYearFromDate(movie.release_date),
    cover: toImageUrl(movie.poster_path) ?? toImageUrl(movie.backdrop_path, 'w780'),
  }
}

function getPlaybackProgress(video: HTMLVideoElement | undefined, entry: WatchHistoryEntry | undefined): WatchProgress | undefined {
  const iframeDataFresh = hasFreshIframePlaybackData()

  if (video && Number.isFinite(video.duration) && video.duration > 0 && !isFinishedPlayback(video.currentTime, video.duration)) {
    return {
      watched: video.currentTime,
      duration: video.duration,
    }
  }

  if (
    iframeDataFresh
    && iframePlaybackData?.duration
    && !isFinishedPlayback(iframePlaybackData.currentTime, iframePlaybackData.duration)
  ) {
    return {
      watched: iframePlaybackData.currentTime ?? 0,
      duration: iframePlaybackData.duration,
    }
  }

  if (isFinishedPlayback(entry?.progress?.watched, entry?.progress?.duration))
    return undefined

  return entry?.progress
}

function getMediaTitle(root?: ParentNode, historyEntry?: WatchHistoryEntry): string | undefined {
  return (root ? getUsefulHeading(root) : undefined)
    ?? (root ? getVisibleImageLabel(root) : undefined)
    ?? cleanText(historyEntry?.title)
    ?? cleanText(historyEntry?.name)
    ?? cleanText(iframePlaybackData?.title)
    ?? titleFromSlug(document.location.pathname)
    ?? getDocumentTitle()
}

function isVideoBuffering(video?: HTMLVideoElement): boolean {
  if (!video || video.paused || video.ended)
    return false

  const waitingForData = video.seeking
    || video.readyState < video.HAVE_FUTURE_DATA
    || (video.networkState === video.NETWORK_LOADING && video.readyState < video.HAVE_ENOUGH_DATA)

  if (waitingForData)
    lastLocalBufferingAt = Date.now()

  return Date.now() - lastLocalBufferingAt < mediaBufferingHold
}

function hasStreamLoadingSignal(root: ParentNode = document): boolean {
  const loadingElements = Array.from(
    root.querySelectorAll<HTMLElement>(
      '[aria-busy="true"], [role="status"], [class*="buffer"], [class*="loader"], [class*="loading"], [class*="spinner"], [class*="animate-spin"]',
    ),
  )

  if (
    loadingElements.some(element =>
      isVisible(element)
      && /buffer|connect|fetch|load|prepar|progress|spin|wait|animate-spin/i.test(`${element.textContent ?? ''} ${element.className}`),
    )
  ) {
    return true
  }

  return /buffering|loading|please wait|preparing stream|connecting|fetching stream/i.test(getVisibleText(root) ?? '')
}

function isMediaBuffering(
  video: HTMLVideoElement | undefined,
  iframe: HTMLIFrameElement | undefined,
  root?: ParentNode,
): boolean {
  if (video)
    return isVideoBuffering(video)

  const iframeData = iframePlaybackData

  if (iframe && iframeData && hasFreshIframePlaybackData())
    return iframeData.buffering ?? false

  if (root && hasStreamLoadingSignal(root)) {
    lastLocalBufferingAt = Date.now()
    return true
  }

  return false
}

function isMediaActivelyPlaying(video: HTMLVideoElement | undefined, iframe: HTMLIFrameElement | undefined): boolean {
  if (video) {
    return !video.paused
      && !video.ended
      && Number.isFinite(video.duration)
      && video.duration > 0
      && !isFinishedPlayback(video.currentTime, video.duration)
  }

  const iframeData = iframePlaybackData

  return Boolean(
    iframe
    && iframeData
    && hasFreshIframePlaybackData()
    && iframeData.paused === false
    && typeof iframeData.currentTime === 'number'
    && iframeData.duration
    && iframeData.duration > 0
    && !isFinishedPlayback(iframeData.currentTime, iframeData.duration),
  )
}

function isMediaPaused(video: HTMLVideoElement | undefined, iframe: HTMLIFrameElement | undefined, entry: WatchHistoryEntry | undefined): boolean {
  if (video)
    return video.paused

  const iframeData = iframePlaybackData

  if (iframe && iframeData && hasFreshIframePlaybackData())
    return iframeData.paused ?? false

  if (entry?.last_updated && Date.now() - entry.last_updated < 20000)
    return false

  return false
}

function isDetailsDialog(root: HTMLElement): boolean {
  if (shouldIgnoreTrailerPreview(root))
    return false

  const text = root.textContent?.toLowerCase() ?? ''
  const hasClose = hasCloseControl(root)
  const hasTitle = Boolean(
    getFreshHintTitle(lastContentModalTitleHint)
    ?? getUsefulHeading(root)
    ?? getVisibleImageLabel(root),
  )
  const hasContentMetadata = /cast:|genres?:|this movie is|this show is|collection|episodes|season\s+\d+|more like this|\b(?:pg-13|pg|r|tv-ma|tv-14|hd)\b/i.test(text)
  const hasPlaybackAction = /\b(?:resume|play)\b/i.test(text)
  const hasYear = /\b(?:19|20)\d{2}\b/.test(text)
  const isAccountUi = /profile|account|notifications?|settings|sign out|logout|login|sign in|authentication required|privacy/i.test(text)

  return hasClose
    && hasTitle
    && !isAccountUi
    && (hasContentMetadata || (hasYear && hasPlaybackAction))
    && !/select a stream|server|provider|watch stream|now playing live television/i.test(text)
}

function applyLiveStreamPresence(
  presenceData: OneFlexPresenceData,
  settings: PresenceSettings,
  strings: OneFlexStrings,
  title: string,
  liveLabel: string,
  dialogRoot?: HTMLElement,
  video?: HTMLVideoElement,
  iframe?: HTMLIFrameElement,
  activityName = 'LiveTV',
): void {
  const buffering = isMediaBuffering(video, iframe, dialogRoot)
  const paused = isMediaPaused(video, iframe, undefined)

  presenceData.name = activityName
  presenceData.details = truncate(title)
  presenceData.state = buffering ? strings.buffering : paused ? strings.paused : 'LIVE'
  presenceData.smallImageKey = buffering ? Assets.Downloading : paused ? Assets.Pause : Assets.Live
  presenceData.smallImageText = buffering ? strings.buffering : paused ? strings.paused : strings.live
  presenceData.largeImageText = compactLine([liveLabel, title])
  applyLogoCover(presenceData)

  delete presenceData.endTimestamp
  applyButtons(presenceData, settings.showButtons, isLiveTvRoute() ? strings.buttonLive : strings.buttonWatch)
}

function applySportsStreamPresence(
  presenceData: OneFlexPresenceData,
  settings: PresenceSettings,
  strings: OneFlexStrings,
  dialogRoot: HTMLElement,
  video?: HTMLVideoElement,
  iframe?: HTMLIFrameElement,
): void {
  const title = getSportsStreamTitle(dialogRoot)
    ?? strings.sportsStream

  applyLiveStreamPresence(presenceData, settings, strings, title, strings.sportsStream, dialogRoot, video, iframe, 'Sports')
}

function applyButtons(presenceData: OneFlexPresenceData, enabled: boolean, label: string): void {
  if (!enabled)
    return

  presenceData.buttons = [
    {
      label,
      url: document.location.href,
    },
  ]
}

function getPresenceIdentity(presenceData: OneFlexPresenceData): string {
  return [
    presenceData.name,
    presenceData.details,
    presenceData.state,
    presenceData.largeImageKey,
    presenceData.largeImageText,
    presenceData.smallImageKey,
    presenceData.smallImageText,
    presenceData.statusDisplayType,
  ].map(value => value?.toString() ?? '').join('|')
}

function snapshotPresenceData(presenceData: OneFlexPresenceData): Partial<OneFlexPresenceData> {
  return {
    name: presenceData.name,
    details: presenceData.details,
    state: presenceData.state,
    largeImageKey: presenceData.largeImageKey,
    largeImageText: presenceData.largeImageText,
    smallImageKey: presenceData.smallImageKey,
    smallImageText: presenceData.smallImageText,
    startTimestamp: presenceData.startTimestamp,
    endTimestamp: presenceData.endTimestamp,
    buttons: presenceData.buttons,
    type: presenceData.type,
  }
}

function rememberMediaPresence(presenceData: OneFlexPresenceData): void {
  lastMediaPresenceSnapshot = {
    data: snapshotPresenceData(presenceData),
    href: document.location.href,
    updatedAt: Date.now(),
  }
}

function applyRecentMediaSnapshot(presenceData: OneFlexPresenceData): boolean {
  if (
    !lastMediaPresenceSnapshot
    || lastMediaPresenceSnapshot.href !== document.location.href
    || Date.now() - lastMediaPresenceSnapshot.updatedAt > mediaSnapshotGrace
    || isTrailerRoute()
  ) {
    return false
  }

  Object.assign(presenceData, lastMediaPresenceSnapshot.data)
  return true
}

function isHomeRoute(): boolean {
  return document.location.pathname.replace(/\/+$/, '') === ''
    || document.location.pathname.replace(/\/+$/, '') === '/'
}

async function applyMediaPresence(
  presenceData: OneFlexPresenceData,
  settings: PresenceSettings,
  strings: OneFlexStrings,
): Promise<boolean> {
  const video = getPlayableVideo()
  const iframe = getPlayerFrame()
  const isPlayerPage = isPlayerRoute()

  if (isTrailerRoute()) {
    lastMediaPresenceSnapshot = null
    return false
  }

  const liveChannelTitle = getLiveTvChannelTitle()

  const dialogRoot = getDialogRoot()
  const sportsRoute = isSportsRoute()
  const liveTvRoute = isLiveTvRoute()

  if (!isPlayerPage && shouldIgnoreTrailerPreview(dialogRoot ?? document)) {
    lastMediaPresenceSnapshot = null
    return false
  }

  if (sportsRoute) {
    if (dialogRoot) {
      applySportsStreamPresence(presenceData, settings, strings, dialogRoot, video, iframe)
      return true
    }

    if (video || iframe || isPlayerPage) {
      const title = getSportsStreamTitle(dialogRoot)
        ?? getSportsTitleFromRoot(document)
        ?? strings.sportsStream

      applyLiveStreamPresence(presenceData, settings, strings, title, strings.sportsStream, undefined, video, iframe, 'Sports')
      return true
    }

    lastMediaPresenceSnapshot = null
    return false
  }

  if (liveTvRoute && (liveChannelTitle || dialogRoot || video || iframe || isPlayerPage)) {
    const title = liveChannelTitle
      ?? (dialogRoot ? getLiveTvTitleFromRoot(dialogRoot) : undefined)
      ?? 'LiveTV Stream'

    applyLiveStreamPresence(presenceData, settings, strings, title, strings.liveDetails, dialogRoot, video, iframe)
    rememberMediaPresence(presenceData)
    return true
  }

  if (dialogRoot && isDetailsDialog(dialogRoot) && !isPlayerPage)
    return false

  const activeHistoryEntry = getActiveHistoryEntry(dialogRoot)
  const latestHistoryEntry = dialogRoot ? undefined : getLatestHistoryEntry()
  const hasFreshHistory = isFreshHistoryEntry(activeHistoryEntry ?? latestHistoryEntry, 5 * 1000)
  const hasMediaSurfaceSignal = Boolean(video || iframe || isPlayerPage || liveChannelTitle)
  const canUseHistorySignal = hasFreshHistory && hasMediaSurfaceSignal

  if (!hasMediaSurfaceSignal)
    return applyRecentMediaSnapshot(presenceData)

  if (isYouTubeFrame(iframe)) {
    lastMediaPresenceSnapshot = null
    return false
  }

  const hasActiveSurface = hasActivePlayerSurface(video, iframe, dialogRoot, isPlayerPage)

  if (!hasActiveSurface && !canUseHistorySignal && !liveChannelTitle)
    return applyRecentMediaSnapshot(presenceData)

  if (
    isHomeRoute()
    && !dialogRoot
    && !isPlayerPage
    && !video
    && !iframe
    && !liveChannelTitle
    && !canUseHistorySignal
  ) {
    return applyRecentMediaSnapshot(presenceData)
  }

  if (!isPlayerPage && !hasVideoPlaybackEvidence(video) && !hasIframePlaybackEvidence(iframe) && !iframe && !liveChannelTitle && !canUseHistorySignal)
    return applyRecentMediaSnapshot(presenceData)

  const historyEntry = activeHistoryEntry ?? (!dialogRoot && canUseHistorySignal ? latestHistoryEntry : undefined)
  const playbackProgress = getPlaybackProgress(video, historyEntry)
  const episodeInfo = getEpisodeInfo(dialogRoot, historyEntry, strings)
  const endpointInfo = await getEndpointMediaInfo(historyEntry, episodeInfo)
  const title = endpointInfo?.title
    ?? getMediaTitle(dialogRoot, historyEntry)
    ?? strings.contentFallback
  const releaseYear = endpointInfo?.releaseYear ?? getReleaseYear(dialogRoot, historyEntry)
  const buffering = isMediaBuffering(video, iframe, dialogRoot)
  const activelyPlaying = isMediaActivelyPlaying(video, iframe)
  const paused = isMediaPaused(video, iframe, historyEntry)
  const isLive = contains(document.location.pathname, 'live') || contains(iframe?.src, 'live')
  const yearLine = releaseYear
  const episodeYearLine = compactLine([episodeInfo.line, releaseYear])
  const contentLine = episodeInfo.line ? episodeYearLine : yearLine
  const playbackContentLine = playbackStateLine(contentLine, buffering, paused, strings)
  const detailsTitle = endpointInfo?.detailsTitle ?? episodeInfo.title ?? title
  const coverTitleLine = detailsTitle !== title ? `${title}: ${detailsTitle}` : title
  const coverSeasonEpisodeLine = compactLine([
    episodeInfo.season ? `Season ${episodeInfo.season}` : undefined,
    episodeInfo.episode ? `Episode ${episodeInfo.episode}` : undefined,
  ], 64)?.replace(' | ', ' • ')
  const coverText = compactLine([coverTitleLine, coverSeasonEpisodeLine, releaseYear])
  const cleanCoverSeasonEpisodeLine = [
    episodeInfo.season ? `Season ${episodeInfo.season}` : undefined,
    episodeInfo.episode ? `Episode ${episodeInfo.episode}` : undefined,
  ].filter(Boolean).join(' • ') || undefined
  const cleanCoverMetaLine = cleanCoverSeasonEpisodeLine && releaseYear
    ? `${cleanCoverSeasonEpisodeLine} | ${releaseYear}`
    : cleanCoverSeasonEpisodeLine ?? releaseYear
  const cleanCoverText = truncate(cleanCoverMetaLine
    ? cleanCoverSeasonEpisodeLine
      ? `${coverTitleLine} - ${cleanCoverMetaLine}`
      : `${coverTitleLine} | ${cleanCoverMetaLine}`
    : coverTitleLine)

  presenceData.name = title
  presenceData.largeImageText = cleanCoverText ?? coverText ?? strings.brandTagline
  presenceData.details = truncate(detailsTitle)
  presenceData.state = isLive
    ? playbackContentLine ?? strings.liveDetails
    : playbackContentLine
  presenceData.smallImageKey = buffering ? Assets.Downloading : paused ? Assets.Pause : isLive ? Assets.Live : Assets.Play
  presenceData.smallImageText = buffering ? strings.buffering : paused ? strings.paused : isLive ? strings.live : strings.playing

  if (settings.showCover)
    presenceData.largeImageKey = endpointInfo?.cover ?? getCover(dialogRoot, historyEntry)

  if (settings.showTimestamps && activelyPlaying && !paused && !buffering) {
    if (video && Number.isFinite(video.duration) && video.duration > 0) {
      [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(video)
    }
    else if (
      playbackProgress?.duration
      && playbackProgress.duration > 0
      && typeof playbackProgress.watched === 'number'
    ) {
      [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(
        playbackProgress.watched,
        playbackProgress.duration,
      )
    }
  }

  if (paused || buffering) {
    delete presenceData.startTimestamp
    delete presenceData.endTimestamp
  }

  applyButtons(presenceData, settings.showButtons, strings.buttonWatch)
  rememberMediaPresence(presenceData)
  return true
}

function applyDialogPresence(
  presenceData: OneFlexPresenceData,
  settings: PresenceSettings,
  strings: OneFlexStrings,
): boolean {
  const dialogRoot = getDialogRoot()

  if (!dialogRoot)
    return false

  if (shouldIgnoreTrailerPreview(dialogRoot))
    return false

  const dialogText = dialogRoot.textContent?.toLowerCase() ?? ''

  if (isSportsRoute()) {
    applySportsStreamPresence(presenceData, settings, strings, dialogRoot)
    return true
  }

  if (contains(dialogText, 'download links')) {
    presenceData.details = strings.downloadLinks
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = strings.viewHome
    presenceData.largeImageText = strings.brandTagline
    applyButtons(presenceData, settings.showButtons, strings.buttonOpen)
    return true
  }

  if (contains(dialogText, 'sign in') || contains(dialogText, 'authentication required')) {
    presenceData.details = strings.login
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = strings.viewHome
    return true
  }

  if (!isDetailsDialog(dialogRoot))
    return false

  const title = getFreshHintTitle(lastContentModalTitleHint)
    ?? getMediaTitle(dialogRoot)

  if (!title)
    return false

  applySimplePresence(
    presenceData,
    getMoreInfoActivityName(dialogRoot, dialogText),
    'Viewing More Info',
    title,
  )

  applyButtons(presenceData, settings.showButtons, strings.buttonOpen)
  return true
}

function applyRoutePresence(
  presenceData: OneFlexPresenceData,
  settings: PresenceSettings,
  strings: OneFlexStrings,
): void {
  lastMediaPresenceSnapshot = null

  const pathname = document.location.pathname.replace(/\/+$/, '') || '/'
  const pathParts = pathname.split('/').filter(Boolean)
  const section = pathParts[0]?.toLowerCase() ?? ''
  const urlSearchQuery = getSearchQueryFromUrl()
  const activeSearchQuery = getActiveSearchQuery()
  const searchQuery = urlSearchQuery ?? activeSearchQuery

  if (pathname.startsWith('/search')) {
    applySimplePresence(
      presenceData,
      'Home',
      'Browsing Home 1FLEX',
      searchQuery ? `Searching: ${searchQuery}` : 'Choosing Movie or Series',
    )
    applyButtons(presenceData, settings.showButtons, strings.buttonSearch)
    return
  }

  if (section === 'movies' || section === 'movie') {
    applySimplePresence(presenceData, 'Movies', 'Browsing Movies 1FLEX', 'Choosing Movies')
    applyButtons(presenceData, settings.showButtons, strings.buttonOpen)
    return
  }

  if (section === 'tv' || section === 'shows' || section === 'show' || section === 'series' || section === 'tv-shows') {
    applySimplePresence(presenceData, 'TV Shows', 'Browsing Series 1FLEX', 'Choosing Series')
    applyButtons(presenceData, settings.showButtons, strings.buttonOpen)
    return
  }

  if (section === 'live' || section === 'livetv' || section === 'live-tv') {
    applySimplePresence(presenceData, 'LiveTV', 'Browsing LiveTV 1FLEX', 'Choosing LiveTV Stream')
    applyButtons(presenceData, settings.showButtons, strings.buttonLive)
    return
  }

  if (section === 'sports') {
    applySimplePresence(presenceData, 'Sports', 'Browsing Sports 1FLEX', 'Choosing Sports Stream')
    applyButtons(presenceData, settings.showButtons, strings.buttonOpen)
    return
  }

  if (section === 'games') {
    applySimplePresence(presenceData, 'Games', 'Browsing Games 1FLEX', 'Choosing Games')
    applyButtons(presenceData, settings.showButtons, strings.buttonGames)
    return
  }

  if (section === 'torrent' || section === 'torrents') {
    applySimplePresence(presenceData, 'Torrent', 'Torrent Search', getTorrentState())
    applyButtons(presenceData, settings.showButtons, strings.buttonTorrent)
    return
  }

  if (section === 'my-list' || section === 'watchlist' || section === 'list' || section === 'favorites') {
    const counts = getMyListCounts()

    applySimplePresence(
      presenceData,
      'MyList',
      'Browsing MyList 1FLEX',
      `${counts.movies} Movies and ${counts.series} Series`,
    )
    applyButtons(presenceData, settings.showButtons, strings.buttonMyList)
    return
  }

  if (section === 'browse-by-languages' || section === 'languages' || section === 'language') {
    applySimplePresence(
      presenceData,
      'Browser by Languages',
      'Browsing Browser by Languages 1FLEX',
      getLanguageBrowserState(),
    )
    applyButtons(presenceData, settings.showButtons, strings.buttonLanguages)
    return
  }

  if (section === 'anime') {
    applySimplePresence(presenceData, 'Anime', 'Browsing Anime 1FLEX', 'Choosing Anime')
    applyButtons(presenceData, settings.showButtons, strings.buttonAnime)
    return
  }

  if (section === 'login' || section === 'register' || section === 'profile' || section === 'account') {
    presenceData.details = section === 'profile' || section === 'account'
      ? strings.profile
      : strings.login
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = strings.viewHome
    return
  }

  if (activeSearchQuery) {
    applySimplePresence(presenceData, 'Home', 'Browsing Home 1FLEX', `Searching: ${activeSearchQuery}`)
    applyButtons(presenceData, settings.showButtons, strings.buttonSearch)
    return
  }

  applySimplePresence(presenceData, 'Home', 'Browsing Home 1FLEX', 'Choosing Movie or Series')
  applyButtons(presenceData, settings.showButtons, strings.buttonOpen)
}

async function updatePresence(): Promise<void> {
  syncLocationState()

  const settings: PresenceSettings = {
    privacy: await presence.getSetting<boolean>('privacy') ?? false,
    showButtons: await presence.getSetting<boolean>('showButtons') ?? true,
    showTimestamps: await presence.getSetting<boolean>('showTimestamps') ?? true,
    showCover: await presence.getSetting<boolean>('showCover') ?? true,
    statusStyle: await presence.getSetting<number>('statusStyle') ?? 0,
  }
  const strings = await getStrings()

  const presenceData: OneFlexPresenceData = {
    largeImageKey: ActivityAssets.Logo,
    largeImageText: strings.brandTagline,
    startTimestamp: browsingTimestamp,
    type: ActivityType.Watching,
  }

  if (settings.privacy) {
    presenceData.details = strings.privacy
    presenceData.state = strings.privacyState
    applyStatusDisplay(presenceData, settings)
    presence.setActivity(presenceData)
    return
  }

  const priorityDialogRoot = getDialogRoot()
  const handledPriorityDialog = Boolean(
    priorityDialogRoot
    && !isLiveStreamRoute()
    && isDetailsDialog(priorityDialogRoot)
    && applyDialogPresence(presenceData, settings, strings),
  )

  if (!handledPriorityDialog && !(await applyMediaPresence(presenceData, settings, strings)) && !applyDialogPresence(presenceData, settings, strings))
    applyRoutePresence(presenceData, settings, strings)

  applyStatusDisplay(presenceData, settings)

  if (!settings.showTimestamps) {
    delete presenceData.startTimestamp
    delete presenceData.endTimestamp
  }

  if (presenceData.details) {
    const presenceIdentity = getPresenceIdentity(presenceData)

    if (presenceIdentity !== lastPresenceIdentity) {
      presence.clearActivity()
      lastPresenceIdentity = presenceIdentity
    }

    presence.setActivity(presenceData)
  }
  else {
    lastPresenceIdentity = ''
    presence.clearActivity()
  }
}

presence.on('UpdateData', () => {
  void updatePresence()
})
