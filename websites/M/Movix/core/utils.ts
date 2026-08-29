import type {
  IframePlayback,
  LiveTvContext,
  PartyContext,
  WatchContext,
} from './types.js'
import { ActivityType } from 'premid'
import {
  FALLBACK_LOGO,
  HTTPS_URL_PATTERN,
  LEADING_EPISODE_LABEL_PATTERN,
  LEADING_EPISODE_NUMBER_PATTERN,
  NON_BREAKING_SPACE_PATTERN,
  ONLY_EPISODE_NUMBER_PATTERN,
  PRESENCE_ICONS,
  PROVIDER_NAMES,
  QUOTED_TEXT_PATTERNS,
  RELEASE_TAG_PATTERN,
  SAFE_BUTTON_RULES,
  SITE_NAME,
  SOURCE_EDGE_SEPARATOR_PATTERN,
  SOURCE_SEGMENT_SPLIT_PATTERN,
  SOURCE_URL_PREFIX_PATTERN,
  SOURCE_URL_TOKEN_PATTERN,
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
import { format, s } from './strings.js'

const IFRAME_PLAYBACK_MAX_AGE_MS = 10_000

let lastRouteKey = ''
let lastRouteStartedAt = Date.now()
let privacyModeEnabled = false
let posterEnabled = true
let iframePlayback: IframePlayback | null = null
let iframePlaybackAt = 0

export function setPrivacyMode(enabled: boolean): void {
  privacyModeEnabled = enabled
}

export function isPrivacyModeEnabled(): boolean {
  return privacyModeEnabled
}

export function setPosterEnabled(enabled: boolean): void {
  posterEnabled = enabled
}

export function setIframePlayback(data: unknown): void {
  if (!data || typeof data !== 'object') {
    return
  }

  const candidate = data as Partial<IframePlayback>
  if (
    typeof candidate.currentTime !== 'number'
    || typeof candidate.duration !== 'number'
    || typeof candidate.paused !== 'boolean'
    || !Number.isFinite(candidate.duration)
    || candidate.duration <= 0
  ) {
    return
  }

  iframePlayback = {
    currentTime: candidate.currentTime,
    duration: candidate.duration,
    paused: candidate.paused,
  }
  iframePlaybackAt = Date.now()
}

export function getIframePlayback(): IframePlayback | null {
  if (
    !iframePlayback
    || Date.now() - iframePlaybackAt > IFRAME_PLAYBACK_MAX_AGE_MS
  ) {
    return null
  }

  return iframePlayback
}

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
  if (!enabled || privacyModeEnabled) {
    return undefined
  }

  const rule = SAFE_BUTTON_RULES.find(entry => entry.pattern.test(pathname))
  if (!rule) {
    return undefined
  }

  const url = document.location.href
  if (!isButtonUrlAllowed(url)) {
    return undefined
  }

  return [
    {
      label: s()[rule.label],
      url,
    },
  ]
}

export function buildBasePresence(image?: string): PresenceData {
  return {
    name: SITE_NAME,
    largeImageKey: posterEnabled
      ? image || getPageImage() || FALLBACK_LOGO
      : FALLBACK_LOGO,
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
  presenceData.state = truncate(presenceData.state) || undefined

  if (!presenceData.details) {
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
  details: string,
  state: string,
  image?: string,
) {
  if (privacyModeEnabled) {
    const presenceData = buildBasePresence(FALLBACK_LOGO)
    presenceData.details = normalizeText(details)
    return presenceData
  }

  const presenceData = buildBasePresence(image)

  presenceData.details = normalizeText(details)
  presenceData.state = normalizeText(state)
  return presenceData
}

export function createWatchingPresence(options: {
  title: string
  displayTitle?: string
  privacyDetails?: string
  season?: string
  episode?: string
  image?: string
}) {
  const privacy = privacyModeEnabled
  const presenceData = buildBasePresence(privacy ? FALLBACK_LOGO : options.image)
  const video = getCurrentVideoElement()
  const season = normalizeText(options.season)
  const episode = normalizeText(options.episode)
  const routeWatchMediaType = getWatchMediaTypeForPath(document.location.pathname)
  const details = privacy
    ? normalizeText(options.privacyDetails) || s().watchContent
    : normalizeText(
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
    = !routeWatchMediaType && season && episode ? `S${season}E${episode} - ` : ''
  const watchContext = getWatchContext()
  const activeEmbedFrame = getActiveEmbedFrame()
  const embedSourceLabel = privacy
    ? ''
    : getActiveEmbedSourceLabel(activeEmbedFrame)
  const selectedSourceLabel = privacy
    ? ''
    : formatWatchSourceLabel(watchContext.sourceLabel)
  const selectedSourceDisplay = privacy
    ? ''
    : formatWatchSourceDisplay(watchContext.sourceLabel, watchContext.sourceDetail)
  const embedSourceDisplay = privacy
    ? ''
    : formatWatchSourceDisplay(embedSourceLabel, watchContext.sourceDetail)
  const embedSourceState = privacy
    ? ''
    : formatWatchSourceState(embedSourceLabel, watchContext.sourceDetail)
  const selectedSourceState = privacy
    ? ''
    : formatWatchSourceState(watchContext.sourceLabel, watchContext.sourceDetail)
  const hoverEpisodeLabel = privacy
    ? ''
    : getWatchEpisodeHoverLabel(season, episode)

  presenceData.type = ActivityType.Watching
  presenceData.details = details || options.title
  presenceData.state = `${prefix}${s().sourceSelection}`
  presenceData.smallImageKey = PRESENCE_ICONS.search
  presenceData.smallImageText = s().sourceSelection
  presenceData.largeImageText = hoverEpisodeLabel || SITE_NAME

  if (video && Number.isFinite(video.duration) && video.duration > 0) {
    if (video.ended) {
      presenceData.state = `${prefix}${s().ended}`
      presenceData.smallImageKey = PRESENCE_ICONS.stop
      presenceData.smallImageText = s().ended
    }
    else if (video.paused) {
      presenceData.state = selectedSourceDisplay
        ? `${s().paused} - ${selectedSourceDisplay}`
        : `${prefix}${s().paused}`
      presenceData.smallImageKey = PRESENCE_ICONS.pause
      presenceData.smallImageText = s().paused
    }
    else {
      presenceData.state = selectedSourceDisplay || `${prefix}${s().playing}`
      presenceData.smallImageKey = PRESENCE_ICONS.play
      presenceData.smallImageText = s().playing
      presenceData.startTimestamp
        = Date.now() - Math.floor(video.currentTime * 1000)
      presenceData.endTimestamp
        = Date.now()
          + Math.max(0, Math.floor((video.duration - video.currentTime) * 1000))
    }
  }
  else if (activeEmbedFrame || embedSourceLabel) {
    const embedPlayback = getIframePlayback()

    if (embedPlayback && embedPlayback.paused) {
      presenceData.state = embedSourceDisplay
        ? `${s().paused} - ${embedSourceDisplay}`
        : `${prefix}${s().paused}`
      presenceData.smallImageKey = PRESENCE_ICONS.pause
      presenceData.smallImageText = s().paused
    }
    else if (embedPlayback) {
      presenceData.state = embedSourceDisplay || `${prefix}${s().playing}`
      presenceData.smallImageKey = PRESENCE_ICONS.play
      presenceData.smallImageText = s().playing
      presenceData.startTimestamp
        = Date.now() - Math.floor(embedPlayback.currentTime * 1000)
      presenceData.endTimestamp
        = Date.now()
          + Math.max(
            0,
            Math.floor(
              (embedPlayback.duration - embedPlayback.currentTime) * 1000,
            ),
          )
    }
    else {
      presenceData.state = embedSourceState || s().externalPlayer
      presenceData.smallImageKey = PRESENCE_ICONS.play
      presenceData.smallImageText = s().playing
    }
  }
  else if (selectedSourceLabel) {
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

export function getPartyContext(): PartyContext {
  const element = document.querySelector('[data-premid-party-context]')

  if (!(element instanceof HTMLElement)) {
    return {
      title: '',
      mediaType: '',
      season: '',
      episode: '',
      poster: '',
      participants: 0,
    }
  }

  const participants = Number.parseInt(
    element.getAttribute('data-premid-party-participants') || '',
    10,
  )

  return {
    title: normalizeText(element.getAttribute('data-premid-party-title')),
    mediaType: normalizeText(
      element.getAttribute('data-premid-party-media-type'),
    ),
    season: normalizeText(element.getAttribute('data-premid-party-season')),
    episode: normalizeText(element.getAttribute('data-premid-party-episode')),
    poster: normalizeText(element.getAttribute('data-premid-party-poster')),
    participants:
      Number.isFinite(participants) && participants > 0 ? participants : 0,
  }
}

export function getLiveTvContext(): LiveTvContext {
  const element = document.querySelector('[data-premid-live-context]')

  if (!(element instanceof HTMLElement)) {
    return { channel: '', poster: '' }
  }

  return {
    channel: normalizeText(element.getAttribute('data-premid-channel')),
    poster: normalizeText(element.getAttribute('data-premid-channel-poster')),
  }
}

export function formatWatchSourceLabel(value: unknown): string {
  const normalized = normalizeText(value)
  if (!normalized) {
    return ''
  }

  if (
    SOURCE_URL_PREFIX_PATTERN.test(normalized)
    || normalized.includes('://')
  ) {
    return getEmbedSourceLabelFromUrl(normalized)
  }

  const lowered = normalized.toLowerCase().replace(WHITESPACE_PATTERN, '_')
  if (WATCH_SOURCE_LABEL_MAP[lowered]) {
    return WATCH_SOURCE_LABEL_MAP[lowered]
  }

  return lowered
    .replace(WORD_SEPARATOR_PATTERN, ' ')
    .replace(WORD_INITIAL_PATTERN, character => character.toUpperCase())
}

function segmentWords(value: string): string[] {
  return value
    .toLowerCase()
    .replace(WORD_SEPARATOR_PATTERN, ' ')
    .split(' ')
    .filter(Boolean)
}

function isSegmentContained(segment: string, other: string): boolean {
  if (segment.length >= other.length) {
    return false
  }

  const otherWords = segmentWords(other)
  return segmentWords(segment).every(word => otherWords.includes(word))
}

export function formatWatchSourceDisplay(label: unknown, detail: unknown): string {
  const sourceLabel = formatWatchSourceLabel(label)
  if (!sourceLabel) {
    return ''
  }

  const labelWords = segmentWords(sourceLabel).join(' ')
  const strippedDetail = normalizeText(
    normalizeText(detail).replace(SOURCE_URL_TOKEN_PATTERN, ' '),
  )

  const segments: string[] = []
  for (const rawSegment of strippedDetail.split(SOURCE_SEGMENT_SPLIT_PATTERN)) {
    let segment = normalizeText(
      rawSegment.replace(SOURCE_EDGE_SEPARATOR_PATTERN, ''),
    )
    if (!segment) {
      continue
    }

    const segmentLower = segmentWords(segment).join(' ')
    if (!segmentLower || segmentLower === labelWords) {
      continue
    }

    if (segmentLower.startsWith(`${labelWords} `)) {
      segment = normalizeText(segment.slice(sourceLabel.length))
      if (!segment) {
        continue
      }
    }

    segments.push(segment)
  }

  const kept: string[] = []
  segments.forEach((segment, index) => {
    const lower = segment.toLowerCase()
    const isRedundant = segments.some((other, otherIndex) => {
      if (otherIndex === index) {
        return false
      }

      if (lower === other.toLowerCase()) {
        return otherIndex < index
      }

      return isSegmentContained(segment, other)
    })

    if (!isRedundant && !kept.some(entry => entry.toLowerCase() === lower)) {
      kept.push(segment)
    }
  })

  const cleanedDetail = kept.join(' - ')
  return cleanedDetail ? `${sourceLabel} - ${cleanedDetail}` : sourceLabel
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
    const hostname = new URL(
      normalized.includes('://') ? normalized : `https://${normalized}`,
    ).hostname.replace(WWW_PREFIX_PATTERN, '')
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
  return PROVIDER_NAMES[providerId] || format(s().platformId, providerId)
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

export function applyVideoPlaybackToPresence(presenceData: PresenceData): void {
  const video = getCurrentVideoElement()

  if (!video || !Number.isFinite(video.duration) || video.duration <= 0) {
    return
  }

  if (video.ended) {
    presenceData.smallImageKey = PRESENCE_ICONS.stop
    presenceData.smallImageText = s().ended
  }
  else if (video.paused) {
    presenceData.smallImageKey = PRESENCE_ICONS.pause
    presenceData.smallImageText = s().paused
  }
  else {
    presenceData.smallImageKey = PRESENCE_ICONS.play
    presenceData.smallImageText = s().playing
    presenceData.startTimestamp
      = Date.now() - Math.floor(video.currentTime * 1000)
    presenceData.endTimestamp
      = Date.now()
        + Math.max(0, Math.floor((video.duration - video.currentTime) * 1000))
  }
}

export function createSpecificPagePresence(
  details: string,
  state: string,
  image?: string,
) {
  const subject = normalizeText(details)
  if (!subject) {
    return null
  }

  if (privacyModeEnabled) {
    const presenceData = buildBasePresence(FALLBACK_LOGO)
    presenceData.details = normalizeText(state) || s().browseMovix
    return presenceData
  }

  const presenceData = buildBasePresence(image)

  presenceData.details = subject
  presenceData.state = normalizeText(state)
  return presenceData
}
