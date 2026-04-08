import { ActivityType } from 'premid'
import type { VariantText, WatchContext } from './types.js'
import {
  FALLBACK_LOGO,
  HTTPS_URL_PATTERN,
  LEADING_EPISODE_LABEL_PATTERN,
  LEADING_EPISODE_NUMBER_PATTERN,
  NON_BREAKING_SPACE_PATTERN,
  ONLY_EPISODE_NUMBER_PATTERN,
  PROVIDER_NAMES,
  QUOTED_TEXT_PATTERNS,
  RELEASE_TAG_PATTERN,
  SAFE_BUTTON_PATTERNS,
  SITE_NAME,
  SOURCE_LABEL_SEPARATOR_PATTERN,
  STRIP_SITE_NAME_PATTERN,
  TMDB_IMAGE_BASE,
  WATCH_ANIME_PATH_PATTERN,
  WATCH_MOVIE_PATH_PATTERN,
  WATCH_TITLE_NEW_PAGE_PATTERN,
  WATCH_TITLE_SKIP_PATTERN,
  WATCH_TITLE_TRAILER_PATTERN,
  WATCH_TITLE_ZOOM_PATTERN,
  WATCH_TV_PATH_PATTERN,
  WHITESPACE_PATTERN,
  WORD_INITIAL_PATTERN,
  WORD_SEPARATOR_PATTERN,
  WWW_PREFIX_PATTERN,
} from './constants.js'
import {
  PAGE_DETAIL_VARIANTS,
  WATCH_ENDED_VARIANTS,
  WATCH_PAUSED_VARIANTS,
  WATCH_PLAYING_VARIANTS,
  WATCH_WAITING_VARIANTS,
} from './variants.js'

let lastRouteKey = ''
let lastRouteStartedAt = Date.now()

export function normalizeText(value: unknown): string {
  return String(value ?? '')
    .replace(NON_BREAKING_SPACE_PATTERN, ' ')
    .replace(WHITESPACE_PATTERN, ' ')
    .trim()
}

export function truncate(value: unknown, max = 128): string {
  const text = normalizeText(value)
  if (!text)
    return ''
  if (text.length <= max)
    return text
  return `${text.slice(0, max - 1).trim()}...`
}

export function stripSiteName(value: unknown): string {
  return normalizeText(value)
    .replace(STRIP_SITE_NAME_PATTERN, '')
    .trim()
}

export function stripReleaseTag(value: string): string {
  return value.replace(RELEASE_TAG_PATTERN, '').trim()
}

export function firstNonEmpty<T>(...values: T[]): T | '' {
  for (const value of values) {
    if (normalizeText(value)) {
      return value
    }
  }

  return ''
}

export function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value)
  }
  catch {
    return value
  }
}

export function shortenId(value: string, size = 6): string {
  const text = normalizeText(value)
  return text ? text.slice(0, size).toUpperCase() : ''
}

export function toAbsoluteUrl(value: string): string {
  const text = normalizeText(value)
  if (!text)
    return ''

  try {
    return new URL(text, document.location.origin).toString()
  }
  catch {
    return ''
  }
}

export function toTmdbImageUrl(path: unknown, size = 'w500'): string {
  const text = normalizeText(path)
  return text ? `${TMDB_IMAGE_BASE}/${size}${text}` : ''
}

export function isImageUrlAllowed(value: string): boolean {
  return (
    HTTPS_URL_PATTERN.test(value)
    || value.startsWith('data:')
    || value.startsWith('blob:')
  )
}

export function isButtonUrlAllowed(value: string): boolean {
  return HTTPS_URL_PATTERN.test(value)
}

export function findLatestValue<T extends Element>(
  elements: readonly T[],
  resolveValue: (element: T) => string,
): string {
  for (let index = elements.length - 1; index >= 0; index -= 1) {
    const element = elements[index]
    if (!element) {
      continue
    }

    const value = resolveValue(element)
    if (value) {
      return value
    }
  }

  return ''
}

export function isRelevantDomElement(element: Element | null): element is HTMLElement {
  if (!(element instanceof HTMLElement)) {
    return false
  }

  if (
    !element.isConnected
    || element.hidden
    || element.closest('[hidden], [inert], [aria-hidden=\'true\']')
  ) {
    return false
  }

  const style = window.getComputedStyle(element)
  if (
    style.display === 'none'
    || style.visibility === 'hidden'
    || style.visibility === 'collapse'
    || Number.parseFloat(style.opacity || '1') === 0
  ) {
    return false
  }

  return (
    element.getClientRects().length > 0
    || element.offsetWidth > 0
    || element.offsetHeight > 0
  )
}

export function getMetaContent(selector: string): string {
  const elements = Array.from(
    document.querySelectorAll(selector),
  ) as HTMLMetaElement[]

  const latestManagedMeta = findLatestValue(elements, element =>
    element.getAttribute('data-rh') === 'true'
      ? normalizeText(element.content)
      : '')

  if (latestManagedMeta) {
    return latestManagedMeta
  }

  return findLatestValue(elements, element => normalizeText(element.content))
}

export function getAttribute(selector: string, attribute: string): string {
  const elements = Array.from(document.querySelectorAll(selector))

  const visibleValue = findLatestValue(elements, element =>
    isRelevantDomElement(element)
      ? normalizeText(element.getAttribute(attribute))
      : '')

  if (visibleValue) {
    return visibleValue
  }

  return findLatestValue(elements, element =>
    normalizeText(element.getAttribute(attribute)))
}

export function getText(selector: string): string {
  const elements = Array.from(document.querySelectorAll(selector))

  const visibleText = findLatestValue(elements, element =>
    isRelevantDomElement(element)
      ? normalizeText(element.textContent)
      : '')

  if (visibleText) {
    return visibleText
  }

  return findLatestValue(elements, element =>
    element instanceof HTMLElement
      ? normalizeText(element.textContent)
      : '')
}

export function findTitleAttribute(predicate: (title: string) => boolean): string {
  const elements = Array.from(document.querySelectorAll('[title]'))

  const visibleTitle = findLatestValue(elements, (element) => {
    if (!isRelevantDomElement(element)) {
      return ''
    }

    const title = normalizeText(element.getAttribute('title'))
    return title && predicate(title) ? title : ''
  })

  if (visibleTitle) {
    return visibleTitle
  }

  return findLatestValue(elements, (element) => {
    const title = normalizeText(element.getAttribute('title'))
    return title && predicate(title) ? title : ''
  })
}

export function getCurrentVideoElement(): HTMLVideoElement | null {
  const videos = Array.from(
    document.querySelectorAll('video'),
  ) as HTMLVideoElement[]
  let bestVideo: HTMLVideoElement | null = null
  let bestScore = Number.NEGATIVE_INFINITY

  for (const video of videos) {
    if (!video.isConnected) {
      continue
    }

    const isVisible = isRelevantDomElement(video)
    const rect = isVisible ? video.getBoundingClientRect() : null
    const area = rect ? rect.width * rect.height : 0

    let score = 0
    if (isVisible) {
      score += 100
    }

    score += Math.min(40, Math.floor(area / 20000))

    if (video.currentSrc || video.src) {
      score += 20
    }

    if (video.readyState >= 2) {
      score += 15
    }

    if (Number.isFinite(video.duration) && video.duration > 0) {
      score += 20
    }

    if (!video.paused) {
      score += 25
    }

    if (!video.ended) {
      score += 5
    }

    if (score >= bestScore) {
      bestScore = score
      bestVideo = video
    }
  }

  return bestVideo
}

export function getSearchParam(name: string): string {
  return normalizeText(new URLSearchParams(document.location.search).get(name))
}

export function getMatchPart(match: RegExpMatchArray | null, index: number): string {
  return normalizeText(match?.[index])
}

export function getRouteStartedAt(): number {
  const key = `${document.location.pathname}${document.location.search}`

  if (key !== lastRouteKey) {
    lastRouteKey = key
    lastRouteStartedAt = Date.now()
  }

  return lastRouteStartedAt
}

export function hashString(value: string): number {
  let hash = 0

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index)
    hash |= 0
  }

  return Math.abs(hash)
}

export function pickVariant(seed: string, variants: readonly string[]): string {
  const cleanVariants = variants
    .map(variant => normalizeText(variant))
    .filter(Boolean)

  if (cleanVariants.length === 0) {
    return ''
  }

  return cleanVariants[hashString(seed) % cleanVariants.length] || ''
}

export function findVariantsForPath(
  pathname: string,
  collection: Array<{ pattern: RegExp, variants: readonly string[] }>,
): readonly string[] | undefined {
  return collection.find(entry => entry.pattern.test(pathname))?.variants
}

export function resolveVariantText(value: VariantText, seed: string): string {
  return Array.isArray(value) ? pickVariant(seed, value) : normalizeText(value)
}

export function getPageTitle(): string {
  const title = firstNonEmpty(
    getText('main h1'),
    getText('h1'),
    document.title,
    getText('main h2'),
    getText('h2'),
    getMetaContent('meta[property="og:title"]'),
  )

  return stripSiteName(stripReleaseTag(title))
}

export function getPageImage(mode: 'logo' | 'content' = 'logo'): string {
  if (mode === 'logo') {
    return FALLBACK_LOGO
  }

  const candidates
    = mode === 'content'
      ? [
          getAttribute('video[poster]', 'poster'),
          getAttribute('.cinegraph-detail-backdrop img', 'src'),
          getAttribute('.cinegraph-tooltip-poster', 'src'),
          getMetaContent('meta[property="og:image"]'),
          getAttribute('img[alt="Poster"]', 'src'),
          getAttribute('img[alt*="poster" i]', 'src'),
          getAttribute('img[src*="tmdb.org"][src*="/w500"]', 'src'),
          getAttribute('img[src*="tmdb.org"][src*="/original"]', 'src'),
          FALLBACK_LOGO,
        ]
      : [FALLBACK_LOGO]

  for (const candidate of candidates) {
    const absolute = toAbsoluteUrl(candidate)
    if (absolute && isImageUrlAllowed(absolute)) {
      return absolute
    }
  }

  return FALLBACK_LOGO
}

export function getSafeButtons(
  pathname: string,
  enabled: boolean,
): [ButtonData, ButtonData?] | undefined {
  if (
    !enabled
    || !SAFE_BUTTON_PATTERNS.some(pattern => pattern.test(pathname))
  ) {
    return undefined
  }

  const url = document.location.href
  if (!isButtonUrlAllowed(url)) {
    return undefined
  }

  return [
    {
      label: 'Voir la page',
      url,
    },
  ]
}

export function buildBasePresence(image?: string): PresenceData {
  return {
    name: SITE_NAME,
    largeImageKey: image || getPageImage() || FALLBACK_LOGO,
  }
}

export function finalizePresence(
  presenceData: PresenceData | null,
  options: {
    showTimestamp: boolean
    showButtons: boolean
    pathname: string
    allowPageTimestamp?: boolean
  },
) {
  if (!presenceData) {
    return null
  }

  presenceData.details = truncate(presenceData.details)
  presenceData.state = truncate(presenceData.state)

  if (!presenceData.details || !presenceData.state) {
    return null
  }

  if (!presenceData.buttons) {
    const buttons = getSafeButtons(options.pathname, options.showButtons)
    if (buttons?.length) {
      presenceData.buttons = buttons
    }
  }

  if (
    options.showTimestamp
    && options.allowPageTimestamp !== false
    && !presenceData.startTimestamp
    && !presenceData.endTimestamp
  ) {
    presenceData.startTimestamp = getRouteStartedAt()
  }

  if (!presenceData.largeImageKey) {
    presenceData.largeImageKey = FALLBACK_LOGO
  }

  return presenceData
}

export function createPagePresence(
  details: VariantText,
  state: VariantText,
  image?: string,
) {
  const presenceData = buildBasePresence(image)
  const seed = `${document.location.pathname}${document.location.search}`
  const routeDetails = Array.isArray(details)
    ? details
    : findVariantsForPath(document.location.pathname, PAGE_DETAIL_VARIANTS)
      || details

  presenceData.details = resolveVariantText(routeDetails, `${seed}:details`)
  presenceData.state = resolveVariantText(state, `${seed}:state`)
  return presenceData
}

export function createWatchingPresence(options: {
  title: string
  displayTitle?: string
  playingText: VariantText
  pausedText: VariantText
  waitingText: VariantText
  embedText?: VariantText
  endedText?: VariantText
  season?: string
  episode?: string
  image?: string
  statePrefix?: string
}) {
  const presenceData = buildBasePresence(options.image)
  const video = getCurrentVideoElement()
  const season = normalizeText(options.season)
  const episode = normalizeText(options.episode)
  const routeWatchMediaType = getWatchMediaTypeForPath(document.location.pathname)
  const useSimpleWatchRoute = Boolean(routeWatchMediaType)
  const details = normalizeText(
    options.displayTitle
    || (routeWatchMediaType
      ? getFormattedWatchTitle(
          options.title,
          routeWatchMediaType,
          season,
          episode,
        )
      : options.title),
  )
  const prefix
    = options.statePrefix !== undefined
      ? options.statePrefix
      : useSimpleWatchRoute
        ? ''
        : season && episode
          ? `S${season}E${episode} - `
          : ''
  const seed = `${document.location.pathname}:${details}:${season}:${episode}`
  const waitingVariant = useSimpleWatchRoute
    ? 'Selection de la source'
    : Array.isArray(options.waitingText)
      ? options.waitingText
      : findVariantsForPath(document.location.pathname, WATCH_WAITING_VARIANTS)
        || options.waitingText
  const playingVariant = useSimpleWatchRoute
    ? 'Lecture en cours'
    : Array.isArray(options.playingText)
      ? options.playingText
      : findVariantsForPath(document.location.pathname, WATCH_PLAYING_VARIANTS)
        || options.playingText
  const pausedVariant = useSimpleWatchRoute
    ? 'En pause'
    : Array.isArray(options.pausedText)
      ? options.pausedText
      : findVariantsForPath(document.location.pathname, WATCH_PAUSED_VARIANTS)
        || options.pausedText
  const endedVariant = useSimpleWatchRoute
    ? 'Lecture terminee'
    : Array.isArray(options.endedText)
      ? options.endedText
      : findVariantsForPath(document.location.pathname, WATCH_ENDED_VARIANTS)
        || options.endedText
        || 'Le generique approche, personne ne bouge'
  const waitingText = resolveVariantText(
    waitingVariant,
    `${seed}:waiting`,
  )
  const playingText = resolveVariantText(
    playingVariant,
    `${seed}:playing`,
  )
  const pausedText = resolveVariantText(
    pausedVariant,
    `${seed}:paused`,
  )
  const embedText = resolveVariantText(
    options.embedText || 'Lecteur embed actif',
    `${seed}:embed`,
  )
  const endedText = resolveVariantText(
    Array.isArray(options.endedText)
      ? options.endedText
      : findVariantsForPath(document.location.pathname, WATCH_ENDED_VARIANTS)
        || options.endedText
        || 'Le générique approche, personne ne bouge',
    `${seed}:ended`,
  )

  const watchEndedText = useSimpleWatchRoute
    ? resolveVariantText(endedVariant, `${seed}:ended:simple`)
    : endedText
  const watchContext = getWatchContext()
  const activeEmbedFrame = getActiveEmbedFrame()
  const embedSourceLabel = getActiveEmbedSourceLabel(activeEmbedFrame)
  const selectedSourceLabel = formatWatchSourceLabel(watchContext.sourceLabel)
  const embedSourceDisplay = formatWatchSourceDisplay(
    embedSourceLabel,
    watchContext.sourceDetail,
  )
  const selectedSourceDisplay = formatWatchSourceDisplay(
    watchContext.sourceLabel,
    watchContext.sourceDetail,
  )
  const embedSourceState = formatWatchSourceState(
    embedSourceLabel,
    watchContext.sourceDetail,
  )
  const selectedSourceState = formatWatchSourceState(
    watchContext.sourceLabel,
    watchContext.sourceDetail,
  )
  const hoverEpisodeLabel = getWatchEpisodeHoverLabel(season, episode)

  presenceData.type = ActivityType.Watching
  presenceData.details = details || options.title
  presenceData.state = `${prefix}${waitingText}`

  if (hoverEpisodeLabel) {
    presenceData.largeImageText = hoverEpisodeLabel
  }
  else {
    presenceData.largeImageText = 'Lecture en cours'
  }

  if (video && Number.isFinite(video.duration) && video.duration > 0) {
    if (video.ended) {
      presenceData.state = `${prefix}${watchEndedText}`
    }
    else if (video.paused) {
      presenceData.state = selectedSourceDisplay
        ? `En pause - ${selectedSourceDisplay}`
        : `${prefix}${pausedText}`
    }
    else {
      presenceData.state = selectedSourceDisplay || `${prefix}${playingText}`
      presenceData.startTimestamp
        = Date.now() - Math.floor(video.currentTime * 1000)
      presenceData.endTimestamp
        = Date.now()
          + Math.max(0, Math.floor((video.duration - video.currentTime) * 1000))
    }
  }
  else if (activeEmbedFrame || embedSourceLabel) {
    presenceData.state = embedSourceLabel
      ? embedSourceState
      : embedSourceDisplay || embedText
  }
  else if (useSimpleWatchRoute && selectedSourceLabel) {
    presenceData.state = selectedSourceState
  }

  return presenceData
}

const WATCH_EMBED_SOURCE_LABELS = new Set([
  'coflix',
  'custom',
  'dood',
  'doodstream',
  'dropload',
  'emmmmbed',
  'frembed',
  'fstream',
  'lecteur6',
  'mixdrop',
  'omega',
  'oneupload',
  'sibnet',
  'supervideo',
  'uqload',
  'videasy',
  'vidmoly',
  'viper',
  'voe',
  'vostfr',
  'vox',
  'wiflix',
])

const WATCH_SOURCE_LABEL_MAP: Record<string, string> = {
  coflix: 'Coflix',
  custom: 'Custom',
  darkino: 'Nightflix',
  dood: 'Doodstream',
  doodstream: 'Doodstream',
  dropload: 'Dropload',
  emmmmbed: 'Emmmmbed',
  frembed: 'Frembed',
  fstream: 'FStream',
  lecteur6: 'Lecteur6',
  mixdrop: 'Mixdrop',
  mp4: 'MP4',
  nexus_file: 'Nexus File',
  nexus_hls: 'Nexus HLS',
  omega: 'Omega',
  oneupload: 'OneUpload',
  rivestream: 'Rivestream',
  rivestream_hls: 'Rivestream',
  sibnet: 'Sibnet',
  supervideo: 'Supervideo',
  uqload: 'Uqload',
  videasy: 'Videasy',
  vidmoly: 'Vidmoly',
  viper: 'Viper',
  voe: 'VOE',
  vostfr: 'VOSTFR',
  vox: 'Vox',
  wiflix: 'Wiflix',
}

const WATCH_EMBED_PROVIDER_PATTERNS: Array<{ pattern: RegExp, label: string }>
  = [
    { pattern: /frembed/i, label: 'Frembed' },
    { pattern: /videasy/i, label: 'Videasy' },
    { pattern: /vidmoly/i, label: 'Vidmoly' },
    { pattern: /sibnet/i, label: 'Sibnet' },
    { pattern: /oneupload/i, label: 'OneUpload' },
    { pattern: /mixdrop/i, label: 'Mixdrop' },
    { pattern: /dood/i, label: 'Doodstream' },
    { pattern: /dropload/i, label: 'Dropload' },
    { pattern: /supervideo/i, label: 'Supervideo' },
    { pattern: /uqload/i, label: 'Uqload' },
    { pattern: /voe/i, label: 'VOE' },
    { pattern: /emmmmbed/i, label: 'Emmmmbed' },
    { pattern: /lecteur6/i, label: 'Lecteur6' },
    { pattern: /coflix/i, label: 'Coflix' },
    { pattern: /omega/i, label: 'Omega' },
    { pattern: /wiflix/i, label: 'Wiflix' },
    { pattern: /viper/i, label: 'Viper' },
    { pattern: /vox/i, label: 'Vox' },
  ]

const WATCH_TITLE_BLOCKLIST = [
  /^d[ée]velopp[ée] avec$/i,
  /^changer de source$/i,
  /^episodes?$/i,
  /^lecture en cours$/i,
  /^copier$/i,
  /^param(?:Ã¨|e)tres?$/i,
  /^param/i,
  /^settings?$/i,
  /^saison \d+\s*[,-]\s*[ée]pisode \d+$/i,
]

export function getWatchContext(): WatchContext {
  const element = document.querySelector('[data-premid-watch-context]')

  if (!(element instanceof HTMLElement)) {
    return {
      title: '',
      mediaType: '',
      season: '',
      episode: '',
      episodeTitle: '',
      sourceLabel: '',
      sourceDetail: '',
    }
  }

  return {
    title: normalizeText(element.getAttribute('data-premid-title')),
    mediaType: normalizeText(element.getAttribute('data-premid-media-type')),
    season: normalizeText(element.getAttribute('data-premid-season')),
    episode: normalizeText(element.getAttribute('data-premid-episode')),
    episodeTitle: normalizeText(
      element.getAttribute('data-premid-episode-title'),
    ),
    sourceLabel: normalizeText(
      element.getAttribute('data-premid-source-label'),
    ),
    sourceDetail: normalizeText(
      element.getAttribute('data-premid-source-detail'),
    ),
  }
}

export function formatWatchSourceLabel(value: unknown): string {
  const normalized = normalizeText(value)
  if (!normalized) {
    return ''
  }

  const lowered = normalized.toLowerCase().replace(WHITESPACE_PATTERN, '_')
  if (WATCH_SOURCE_LABEL_MAP[lowered]) {
    return WATCH_SOURCE_LABEL_MAP[lowered]
  }

  return lowered
    .replace(WORD_SEPARATOR_PATTERN, ' ')
    .replace(WORD_INITIAL_PATTERN, character => character.toUpperCase())
}

export function formatWatchSourceDisplay(label: unknown, detail: unknown): string {
  const sourceLabel = formatWatchSourceLabel(label)
  if (!sourceLabel) {
    return ''
  }

  const sourceDetail = normalizeText(detail)
  if (!sourceDetail) {
    return `Via ${sourceLabel}`
  }

  const normalizedLabel = sourceLabel
    .toLowerCase()
    .replace(WORD_SEPARATOR_PATTERN, ' ')
    .trim()
  const loweredDetail = sourceDetail.toLowerCase()
  const detailSuffix = loweredDetail.startsWith(normalizedLabel)
    ? sourceDetail.slice(sourceLabel.length)
    : sourceDetail
  const cleanedDetail = detailSuffix
    .replace(SOURCE_LABEL_SEPARATOR_PATTERN, '')
    .trim()
  const normalizedDetail = cleanedDetail
    .toLowerCase()
    .replace(WORD_SEPARATOR_PATTERN, ' ')
    .trim()

  if (!cleanedDetail || normalizedDetail === normalizedLabel) {
    return sourceLabel
  }

  return `${sourceLabel} - ${cleanedDetail}`
}

export function formatWatchSourceState(label: unknown, detail: unknown): string {
  const sourceDisplay = formatWatchSourceDisplay(label, detail)
  return sourceDisplay ? `Via ${sourceDisplay}` : ''
}

export function isLikelyEmbedSource(value: unknown): boolean {
  const normalized = normalizeText(value).toLowerCase().replace(WHITESPACE_PATTERN, '_')
  return WATCH_EMBED_SOURCE_LABELS.has(normalized)
}

export function getActiveEmbedFrame(): HTMLIFrameElement | null {
  const frames = Array.from(
    document.querySelectorAll('iframe'),
  ) as HTMLIFrameElement[]

  for (let index = frames.length - 1; index >= 0; index -= 1) {
    const frame = frames[index]
    const src = normalizeText(frame?.src || frame?.getAttribute('src'))

    if (frame && src && isRelevantDomElement(frame)) {
      return frame
    }
  }

  return null
}

export function getEmbedSourceLabelFromUrl(value: unknown): string {
  const normalized = normalizeText(value)
  if (!normalized) {
    return ''
  }

  for (const entry of WATCH_EMBED_PROVIDER_PATTERNS) {
    if (entry.pattern.test(normalized)) {
      return entry.label
    }
  }

  try {
    const hostname = new URL(normalized).hostname.replace(WWW_PREFIX_PATTERN, '')
    const root = hostname.split('.')[0] || ''
    return formatWatchSourceLabel(root)
  }
  catch {
    return ''
  }
}

export function getActiveEmbedSourceLabel(frame?: HTMLIFrameElement | null): string {
  const activeFrame = frame || getActiveEmbedFrame()
  const frameLabel = getEmbedSourceLabelFromUrl(
    activeFrame?.src || activeFrame?.getAttribute('src'),
  )

  if (frameLabel) {
    return frameLabel
  }

  const contextSourceLabel = formatWatchSourceLabel(getWatchContext().sourceLabel)
  if (contextSourceLabel && isLikelyEmbedSource(contextSourceLabel)) {
    return contextSourceLabel
  }

  return ''
}

export function sanitizeWatchTitle(value: unknown): string {
  const normalized = normalizeText(value)
  if (!normalized) {
    return ''
  }

  const stripped = stripSiteName(stripReleaseTag(normalized))
  if (!stripped) {
    return ''
  }

  if (WATCH_TITLE_BLOCKLIST.some(pattern => pattern.test(stripped))) {
    return ''
  }

  return stripped
}

export function sanitizeWatchEpisodeTitle(value: unknown): string {
  const normalized = normalizeText(value)
    .replace(LEADING_EPISODE_NUMBER_PATTERN, '')
    .replace(LEADING_EPISODE_LABEL_PATTERN, '')
    .trim()

  if (!normalized || ONLY_EPISODE_NUMBER_PATTERN.test(normalized)) {
    return ''
  }

  return normalized
}

export function getWatchTitle(fallback: string): string {
  const routeWatchMediaType = getWatchMediaTypeForPath(document.location.pathname)
  const titleFromAttributes = findTitleAttribute((title) => {
    if (title.length < 4)
      return false
    if (WATCH_TITLE_NEW_PAGE_PATTERN.test(title))
      return false
    if (WATCH_TITLE_TRAILER_PATTERN.test(title))
      return false
    if (WATCH_TITLE_SKIP_PATTERN.test(title))
      return false
    if (WATCH_TITLE_ZOOM_PATTERN.test(title))
      return false
    return Boolean(sanitizeWatchTitle(title))
  })

  const contextTitle = sanitizeWatchTitle(getWatchContext().title)
  if (contextTitle) {
    return contextTitle
  }

  if (routeWatchMediaType) {
    return fallback
  }

  const candidates = [
    titleFromAttributes,
    getText('main h2.text-white.text-3xl'),
    getText('h2.text-white.text-3xl'),
    getText('main h3.text-sm.font-bold'),
    getText('main h3.text-lg.font-semibold'),
    getText('main h1'),
    getText('h3.text-lg'),
    getText('h3'),
    getText('h1'),
    document.title,
    getMetaContent('meta[property="og:title"]'),
  ]

  for (const candidate of candidates) {
    const sanitized = sanitizeWatchTitle(candidate)
    if (sanitized) {
      return sanitized
    }
  }

  return fallback
}

export function getFormattedWatchTitle(
  fallbackTitle: string,
  mediaTypeFallback: 'movie' | 'tv' | 'anime',
  seasonFallback = '',
  episodeFallback = '',
): string {
  const context = getWatchContext()
  const mediaType
    = normalizeText(context.mediaType).toLowerCase() || mediaTypeFallback
  const title = sanitizeWatchTitle(context.title) || fallbackTitle

  if (mediaType === 'tv' || mediaType === 'anime') {
    const season = normalizeText(context.season) || seasonFallback
    const episode = normalizeText(context.episode) || episodeFallback
    const episodeCode = season && episode ? `S${season}E${episode}` : ''
    const episodeTitle = sanitizeWatchEpisodeTitle(context.episodeTitle)

    return [title, episodeCode, episodeTitle].filter(Boolean).join(' - ')
  }

  return title
}

export function getWatchEpisodeHoverLabel(season: string, episode: string): string {
  const episodeCode = season && episode ? `S${season}E${episode}` : ''
  const episodeTitle = sanitizeWatchEpisodeTitle(getWatchContext().episodeTitle)

  return [episodeCode, episodeTitle].filter(Boolean).join(' - ')
}

export function getWatchMediaTypeForPath(
  pathname: string,
): 'movie' | 'tv' | 'anime' | '' {
  if (WATCH_MOVIE_PATH_PATTERN.test(pathname)) {
    return 'movie'
  }

  if (WATCH_TV_PATH_PATTERN.test(pathname)) {
    return 'tv'
  }

  if (WATCH_ANIME_PATH_PATTERN.test(pathname)) {
    return 'anime'
  }

  return ''
}

export function getProviderName(providerId: string): string {
  return PROVIDER_NAMES[providerId] || `Provider ${providerId}`
}

export function extractQuotedText(value: unknown): string {
  const text = normalizeText(value)
  if (!text)
    return ''

  for (const pattern of QUOTED_TEXT_PATTERNS) {
    const match = text.match(pattern)
    const extracted = normalizeText(match?.[1])
    if (extracted) {
      return extracted
    }
  }

  return ''
}

export function createSpecificPagePresence(
  details: string,
  state: VariantText,
  image?: string,
  seedSuffix?: string,
) {
  const subject = normalizeText(details)
  if (!subject) {
    return null
  }

  const presenceData = buildBasePresence(image)
  const seed = `${document.location.pathname}${document.location.search}:${normalizeText(seedSuffix) || subject}`

  presenceData.details = subject
  presenceData.state = resolveVariantText(state, `${seed}:state`)
  return presenceData
}
