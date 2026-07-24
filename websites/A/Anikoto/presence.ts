import { ActivityType, Assets, getTimestamps } from 'premid'

type Nullable<T> = T | null | undefined

interface IFrameVideoData {
  currentTime?: number
  duration?: number
  paused?: boolean
  readyState?: number
  sampledAt?: number
  src?: string
  title?: string
  url?: string
}

interface IFramePayload {
  pageUrl?: string
  sampledAt?: number
  video?: IFrameVideoData | null
}

interface VideoCandidate {
  data: IFrameVideoData
  priority: number
}

interface Settings {
  showButtons: boolean
  showExactDetails: boolean
  showTimer: boolean
  privacy: boolean
}

interface WatchInfo {
  activeEpisode?: HTMLAnchorElement
  animeUrl?: string
  episodeLabel?: string
  episodeUrl?: string
  poster?: string
  title?: string
}

const presence = new Presence({
  clientId: '1524344097022672976',
})

enum ActivityAssets {
  Logo = 'https://i.imgur.com/3CY0qmm.png',
}

const VIDEO_DATA_TTL_MS = 12_000
const MESSAGE_VIDEO_DATA_TTL_MS = 7_500
const VIDEO_CANDIDATE_TIE_MS = 500
const PRESENCE_REFRESH_THROTTLE_MS = 1_000
const RECENT_EXPLICIT_PAUSE_MS = 5_000
const STATIONARY_VIDEO_PAUSE_MS = 2_500
const STATIONARY_VIDEO_EPSILON_SECONDS = 0.08
const PARENT_MESSAGE_SOURCE = 'premid-anikoto'

let browsingTimestamp = Math.floor(Date.now() / 1000)
let iframeData: IFramePayload = {}
let lastPageKey = document.location.href
let wasWatching = false
let messageVideoData: IFrameVideoData | undefined
let activityUpdateInFlight = false
let activityUpdateQueued = false
let activityUpdateTimer: number | undefined
let lastPresenceUpdateAt = 0
let lastVideoSnapshot:
  | {
    currentTime: number
    key: string
    paused: boolean
    sampledAt: number
    stationarySince: number
  }
  | undefined

presence.on('iFrameData', (data: IFramePayload) => {
  const previousPaused = iframeData.video?.paused

  iframeData = {
    ...data,
    pageUrl: document.location.href,
    sampledAt: Date.now(),
  }

  const nextPaused = iframeData.video?.paused

  if (nextPaused !== undefined && nextPaused !== previousPaused) {
    scheduleActivityUpdate(true)
  }
  else if (iframeData.video && Date.now() - lastPresenceUpdateAt > PRESENCE_REFRESH_THROTTLE_MS) {
    scheduleActivityUpdate()
  }
})

window.addEventListener('message', (event) => {
  try {
    let data = event.data as unknown

    if (typeof data === 'string')
      data = JSON.parse(data) as unknown

    if (!data || typeof data !== 'object')
      return

    const parentPayload = data as {
      frameUrl?: string
      sampledAt?: number
      source?: string
      type?: string
      video?: IFrameVideoData | null
    }

    if (parentPayload.source === PARENT_MESSAGE_SOURCE && parentPayload.type === 'video-state') {
      updateFrameVideoData(parentPayload.video ?? null, parentPayload.frameUrl)
      return
    }

    const payload = data as {
      channel?: string
      currentTime?: number | string
      duration?: number | string
      event?: string
      paused?: boolean | string
      state?: string
      status?: string
      time?: number | string
      type?: string
    }
    const currentTime = Number(payload.currentTime ?? payload.time)
    const duration = Number(payload.duration)
    const postedPlaybackState = getPostedPlaybackState(payload)
    const isTimeUpdate = payload.type === 'watching-log'
      || (payload.channel === 'megacloud' && payload.event === 'time')

    if (postedPlaybackState !== undefined) {
      messageVideoData = {
        currentTime: Number.isFinite(currentTime) && currentTime >= 0
          ? currentTime
          : messageVideoData?.currentTime,
        duration: Number.isFinite(duration) && duration > 0 ? duration : messageVideoData?.duration,
        paused: postedPlaybackState,
        readyState: 4,
        sampledAt: Date.now(),
        src: 'postMessage',
        url: document.location.href,
      }

      scheduleActivityUpdate(true)
    }
    else if (isTimeUpdate && Number.isFinite(currentTime) && currentTime > 0) {
      const previousTime = messageVideoData?.currentTime
      const hasAdvanced = Number.isFinite(previousTime)
        && currentTime - (previousTime ?? 0) > 0.5

      messageVideoData = {
        currentTime,
        duration: Number.isFinite(duration) && duration > 0 ? duration : undefined,
        paused: hasAdvanced && !hasRecentExplicitPause() ? false : undefined,
        readyState: 4,
        sampledAt: Date.now(),
        src: 'postMessage',
        url: document.location.href,
      }

      if (!getFreshVideoData(iframeData.video ?? undefined, VIDEO_DATA_TTL_MS))
        scheduleActivityUpdate()
    }
    else if (
      payload.type === 'complete'
      || (payload.channel === 'megacloud' && payload.event === 'complete')
    ) {
      messageVideoData = {
        currentTime: Number.isFinite(duration) ? duration : messageVideoData?.currentTime,
        duration: Number.isFinite(duration) && duration > 0 ? duration : messageVideoData?.duration,
        paused: true,
        readyState: 4,
        sampledAt: Date.now(),
        src: 'postMessage',
        url: document.location.href,
      }

      scheduleActivityUpdate(true)
    }
  }
  catch {
    // Ignore unrelated cross-frame messages.
  }
})

function cleanText(text: Nullable<string>): string | undefined {
  return text?.replace(/\s+/g, ' ').trim() || undefined
}

function truncate(text: Nullable<string>, maxLength = 128): string | undefined {
  const clean = cleanText(text)

  if (!clean)
    return undefined

  return clean.length > maxLength ? `${clean.slice(0, maxLength - 1)}...` : clean
}

function safeDecode(value: string | undefined): string | undefined {
  if (!value)
    return undefined

  try {
    return decodeURIComponent(value)
  }
  catch {
    return value
  }
}

function absoluteUrl(url: Nullable<string>): string | undefined {
  if (!url)
    return undefined

  try {
    const parsed = new URL(url, document.location.origin)

    if (!['http:', 'https:'].includes(parsed.protocol))
      return undefined

    return parsed.href
  }
  catch {
    return undefined
  }
}

function getMetaContent(property: string): string | undefined {
  return document
    .querySelector<HTMLMetaElement>(`meta[property="${property}"], meta[name="${property}"]`)
    ?.content
}

function getImageUrl(selector: string): string | undefined {
  const image = document.querySelector<HTMLImageElement>(selector)
  return absoluteUrl(image?.currentSrc || image?.src || image?.getAttribute('src'))
}

function getBackgroundImageUrl(selector: string): string | undefined {
  const element = document.querySelector<HTMLElement>(selector)
  const style = element?.style.backgroundImage || element?.getAttribute('style') || ''
  const match = style.match(/url\((['"]?)(.*?)\1\)/i)

  return absoluteUrl(match?.[2])
}

function getSearchTerm(): string | undefined {
  const params = new URLSearchParams(document.location.search)
  return cleanText(
    params.get('keyword')
    ?? document.querySelector<HTMLInputElement>('#search input[name="keyword"]')?.value,
  )
}

function getReadableSlug(slug: string | undefined): string | undefined {
  if (!slug)
    return undefined

  return slug
    .split('-')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function getAnimeUrl(watchMain: HTMLElement | null, pathEpisode: string | undefined): string | undefined {
  const fromDataset = absoluteUrl(watchMain?.dataset.url)

  if (fromDataset)
    return fromDataset

  if (pathEpisode) {
    return absoluteUrl(
      document.location.href
        .replace(/\/ep-[^/?#]+/i, '')
        .replace(/[?#].*$/, ''),
    )
  }

  return document.location.pathname.startsWith('/watch/')
    ? absoluteUrl(document.location.href)
    : undefined
}

function cleanMetaTitle(title: Nullable<string>): string | undefined {
  if (!title)
    return undefined

  let cleanTitle = title
  const siteIndex = cleanTitle.search(/\s+-\s+Anikoto\b/i)

  if (siteIndex >= 0)
    cleanTitle = cleanTitle.slice(0, siteIndex)

  const episodeIndex = cleanTitle.search(/\bEpisode\s+\d+\b/i)

  if (episodeIndex > 0)
    cleanTitle = cleanTitle.slice(0, episodeIndex)

  return cleanTitle
    .replace(/\bWatch Online Free\b/gi, '')
    .replace(/\bWatch Anime Online\b/gi, '')
    .replace(/(?:^|\s)Anime$/i, '')
    .replace(/\s+/g, ' ')
    .replace(/\s+-\s*$/, '')
    .trim() || undefined
}

function getAnimeTitle(): string | undefined {
  return truncate(
    document.querySelector('#w-info h1.title, #watch-main h1.title, h1[itemprop="name"], h1.title.d-title')
      ?.textContent
      ?? cleanMetaTitle(getMetaContent('og:title')),
  )
}

function getWatchInfo(): WatchInfo {
  const watchMain = document.querySelector<HTMLElement>('#watch-main')
  const activeEpisode = document.querySelector<HTMLAnchorElement>(
    '#w-episodes a.active[data-num], .episodes a.active[data-num], .detail-seasons a.active[data-num], a.active[enabled="1"][data-timestamp]',
  )
  const pathEpisode = document.location.pathname.match(/\/ep-([^/?#]+)/i)?.[1]
  const title = getAnimeTitle()
  const animeUrl = getAnimeUrl(watchMain, pathEpisode)
  const episodeUrl = absoluteUrl(pathEpisode ? document.location.href : activeEpisode?.href || document.location.href)
  const episodeLabel = truncate(
    pathEpisode
      ? `Episode ${safeDecode(pathEpisode)}`
      : watchMain?.dataset.epName
        ? `Episode ${watchMain.dataset.epName}`
        : activeEpisode?.dataset.num
          ? `Episode ${activeEpisode.dataset.num}`
          : undefined,
  )

  return {
    activeEpisode: activeEpisode ?? undefined,
    animeUrl,
    episodeLabel,
    episodeUrl,
    poster:
      getImageUrl('#w-info .poster img, .poster img[itemprop="image"]')
      ?? getBackgroundImageUrl('#player')
      ?? absoluteUrl(getMetaContent('og:image')),
    title,
  }
}

function getPageTitleFromDocument(): string | undefined {
  return truncate(
    document.querySelector('main h1, #body h1, .head .title, .block .title, h1.title')?.textContent
    ?? document.title?.replace(/\s*-\s*Anikoto.*$/i, ''),
  )
}

function getMemberPageLabel(pathname: string): string | undefined {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/member'

  if (normalizedPath === '/member' || normalizedPath === '/member/profile')
    return 'Profile'

  const routes: Record<string, string> = {
    '/member/watch-list': 'Watch List',
    '/member/continue-watching': 'Continue Watching',
    '/member/notification': 'Notifications',
    '/member/notifications': 'Notifications',
    '/member/settings': 'Settings',
    '/member/import': 'Import',
    '/member/anilist-sync': 'AniList Sync',
  }

  return routes[normalizedPath] ?? getReadableSlug(normalizedPath.split('/').pop())
}

function getPageContext(): { details?: string, state?: string, smallImageKey?: string, smallImageText?: string } {
  const { pathname } = document.location

  if (pathname === '/' || pathname === '/home') {
    return {
      details: 'Browsing Anikoto',
      state: pathname === '/' ? 'Landing page' : 'Home page',
      smallImageKey: Assets.Reading,
      smallImageText: 'Browsing',
    }
  }

  if (pathname.startsWith('/member')) {
    return {
      details: 'Browsing Anikoto',
      state: getMemberPageLabel(pathname),
      smallImageKey: Assets.Reading,
      smallImageText: 'Browsing',
    }
  }

  if (pathname.startsWith('/az-list')) {
    return {
      details: 'Browsing anime',
      state: 'A-Z List',
      smallImageKey: Assets.Search,
      smallImageText: 'Browsing',
    }
  }

  if (pathname.startsWith('/filter')) {
    const searchTerm = getSearchTerm()

    return {
      details: searchTerm ? 'Searching anime' : 'Browsing filters',
      state: searchTerm ? truncate(searchTerm) : 'Filter page',
      smallImageKey: Assets.Search,
      smallImageText: 'Searching',
    }
  }

  const genre = pathname.match(/^\/genre\/([^/?#]+)/i)?.[1]
  if (genre) {
    return {
      details: 'Browsing by genre',
      state: truncate(getReadableSlug(safeDecode(genre))),
      smallImageKey: Assets.Search,
      smallImageText: 'Browsing',
    }
  }

  const section = pathname.match(/^\/(latest-updated|new-release|most-viewed|status|type|watch2gether|random)(?:\/([^/?#]+))?/i)
  if (section) {
    const label = getReadableSlug(section[2] ? `${section[1]} ${section[2]}` : section[1])

    return {
      details: 'Browsing Anikoto',
      state: truncate(label),
      smallImageKey: Assets.Reading,
      smallImageText: 'Browsing',
    }
  }

  if (pathname.startsWith('/watch/')) {
    const info = getWatchInfo()

    return {
      details: 'Viewing anime',
      state: info.title,
      smallImageKey: Assets.Reading,
      smallImageText: 'Viewing anime',
    }
  }

  return {
    details: 'Browsing Anikoto',
    state: getPageTitleFromDocument(),
    smallImageKey: Assets.Reading,
    smallImageText: 'Browsing',
  }
}

async function getSettings(): Promise<Settings> {
  const [showButtons, showTimer, showExactDetails, privacy] = await Promise.all([
    presence.getSetting<boolean>('showButtons'),
    presence.getSetting<boolean>('showTimer'),
    presence.getSetting<boolean>('showExactDetails'),
    presence.getSetting<boolean>('privacy'),
  ])

  return {
    showButtons,
    showExactDetails,
    showTimer,
    privacy,
  }
}

function getVideoData(): IFrameVideoData | undefined {
  const candidates = [
    { data: getPageVideoData(), priority: 3 },
    {
      data: iframeData.pageUrl === document.location.href
        ? getFreshVideoData(iframeData.video ?? undefined, VIDEO_DATA_TTL_MS)
        : undefined,
      priority: 2,
    },
    { data: getFreshVideoData(messageVideoData, MESSAGE_VIDEO_DATA_TTL_MS), priority: 1 },
  ].filter((candidate): candidate is VideoCandidate => !!candidate.data)

  const recentExplicitPause = candidates.find((candidate) => {
    return candidate.priority > 1
      && candidate.data.paused === true
      && Date.now() - (candidate.data.sampledAt ?? 0) <= RECENT_EXPLICIT_PAUSE_MS
  })

  const newerExplicitPlay = recentExplicitPause
    ? candidates.some((candidate) => {
        return candidate.priority > 1
          && candidate.data.paused === false
          && (candidate.data.sampledAt ?? 0) > (recentExplicitPause.data.sampledAt ?? 0)
      })
    : false

  if (recentExplicitPause && !newerExplicitPlay)
    return inferPlaybackState(recentExplicitPause.data)

  const latest = candidates.reduce<VideoCandidate | undefined>((best, candidate) => {
    if (!best)
      return candidate

    const sampledDiff = (candidate.data.sampledAt ?? 0) - (best.data.sampledAt ?? 0)

    if (Math.abs(sampledDiff) <= VIDEO_CANDIDATE_TIE_MS)
      return candidate.priority > best.priority ? candidate : best

    return sampledDiff > 0 ? candidate : best
  }, undefined)?.data

  return latest ? inferPlaybackState(latest) : undefined
}

function getPageVideoData(): IFrameVideoData | undefined {
  const video = document.querySelector<HTMLVideoElement>('video')

  if (!video || video.readyState <= 0)
    return undefined

  return {
    currentTime: video.currentTime,
    duration: video.duration,
    paused: video.paused,
    readyState: video.readyState,
    sampledAt: Date.now(),
    src: video.currentSrc || video.src || undefined,
    title: document.title,
    url: document.location.href,
  }
}

function normalizeFrameVideoData(
  videoData: IFrameVideoData | null | undefined,
  frameUrl: string | undefined,
): IFrameVideoData | null {
  if (!videoData || typeof videoData !== 'object')
    return null

  const currentTime = Number(videoData.currentTime)
  const duration = Number(videoData.duration)
  const readyState = Number(videoData.readyState)

  return {
    currentTime: Number.isFinite(currentTime) && currentTime >= 0 ? currentTime : undefined,
    duration: Number.isFinite(duration) && duration > 0 ? duration : undefined,
    paused: typeof videoData.paused === 'boolean' ? videoData.paused : undefined,
    readyState: Number.isFinite(readyState) ? readyState : undefined,
    sampledAt: Date.now(),
    src: typeof videoData.src === 'string' ? videoData.src : undefined,
    title: typeof videoData.title === 'string' ? truncate(videoData.title) : undefined,
    url: absoluteUrl(frameUrl) ?? absoluteUrl(videoData.url) ?? document.location.href,
  }
}

function updateFrameVideoData(videoData: IFrameVideoData | null, frameUrl: string | undefined): void {
  const previousVideo = iframeData.video ?? null
  const previousPaused = previousVideo?.paused
  const nextVideo = normalizeFrameVideoData(videoData, frameUrl)

  if (!nextVideo) {
    if (previousVideo?.url === absoluteUrl(frameUrl)) {
      iframeData = {
        pageUrl: document.location.href,
        sampledAt: Date.now(),
        video: null,
      }
      scheduleActivityUpdate(true)
    }

    return
  }

  iframeData = {
    pageUrl: document.location.href,
    sampledAt: Date.now(),
    video: nextVideo,
  }

  if (nextVideo.paused !== undefined && nextVideo.paused !== previousPaused)
    scheduleActivityUpdate(true)
  else
    scheduleActivityUpdate()
}

function getPostedPlaybackState(payload: {
  event?: string
  paused?: boolean | string
  state?: string
  status?: string
  type?: string
}): boolean | undefined {
  if (typeof payload.paused === 'boolean')
    return payload.paused

  if (typeof payload.paused === 'string') {
    const paused = payload.paused.toLowerCase()

    if (paused === 'true')
      return true

    if (paused === 'false')
      return false
  }

  const states = [payload.event, payload.type, payload.state, payload.status]
    .map(value => value?.toLowerCase().replace(/[^a-z]/g, ''))
    .filter((value): value is string => !!value)

  if (!states.length)
    return undefined

  if (states.some(state => ['pause', 'paused', 'playerpause', 'videopause', 'playbackpaused'].includes(state)))
    return true

  if (states.some(state => ['play', 'playing', 'resume', 'resumed', 'playerplay', 'videoplay', 'playbackplaying'].includes(state)))
    return false

  return undefined
}

function getFreshVideoData(videoData: IFrameVideoData | null | undefined, ttl: number): IFrameVideoData | undefined {
  if (!videoData)
    return undefined

  const sampledAt = videoData.sampledAt ?? 0

  if (!sampledAt || Date.now() - sampledAt > ttl)
    return undefined

  if (
    !Number.isFinite(videoData.currentTime)
    && !Number.isFinite(videoData.duration)
    && !videoData.readyState
  ) {
    return undefined
  }

  return videoData
}

function hasRecentExplicitPause(): boolean {
  const frameVideo = iframeData.pageUrl === document.location.href
    ? getFreshVideoData(iframeData.video ?? undefined, VIDEO_DATA_TTL_MS)
    : undefined
  const pageVideo = getPageVideoData()

  return [pageVideo, frameVideo].some((videoData) => {
    return videoData?.paused === true
      && Date.now() - (videoData.sampledAt ?? 0) <= RECENT_EXPLICIT_PAUSE_MS
  })
}

function inferPlaybackState(videoData: IFrameVideoData): IFrameVideoData {
  const sampledAt = videoData.sampledAt ?? Date.now()
  const currentTime = Number(videoData.currentTime ?? 0)
  const key = videoData.src || videoData.url || document.location.href
  const inferred = { ...videoData }
  let stationarySince = sampledAt

  if (
    lastVideoSnapshot
    && lastVideoSnapshot.key === key
    && sampledAt > lastVideoSnapshot.sampledAt
  ) {
    const timeDelta = currentTime - lastVideoSnapshot.currentTime
    const isAdvancing = timeDelta > STATIONARY_VIDEO_EPSILON_SECONDS
    const isStationary = Math.abs(timeDelta) <= STATIONARY_VIDEO_EPSILON_SECONDS

    stationarySince = isStationary ? lastVideoSnapshot.stationarySince : sampledAt

    if (inferred.paused === undefined && isAdvancing)
      inferred.paused = false

    if (
      inferred.paused !== true
      && isStationary
      && currentTime > 0
      && sampledAt - stationarySince >= STATIONARY_VIDEO_PAUSE_MS
    ) {
      inferred.paused = true
    }
  }

  if (Number.isFinite(currentTime)) {
    lastVideoSnapshot = {
      currentTime,
      key,
      paused: inferred.paused ?? false,
      sampledAt,
      stationarySince,
    }
  }

  return inferred
}

function handlePageChange(currentKey: string): void {
  if (currentKey !== lastPageKey) {
    iframeData = {}
    lastVideoSnapshot = undefined
    messageVideoData = undefined
    browsingTimestamp = Math.floor(Date.now() / 1000)
    lastPageKey = currentKey
    wasWatching = false
  }
}

function updateBrowsingTimestamp(currentKey: string, isWatching: boolean): void {
  handlePageChange(currentKey)

  if (wasWatching !== isWatching)
    browsingTimestamp = Math.floor(Date.now() / 1000)

  wasWatching = isWatching
}

function applyButtons(presenceData: PresenceData, info: WatchInfo, settings: Settings): void {
  if (!settings.showButtons || settings.privacy)
    return

  const buttons: { label: string, url: string }[] = []

  if (info.episodeUrl) {
    buttons.push({
      label: 'Watch Episode',
      url: info.episodeUrl,
    })
  }

  if (info.animeUrl && info.animeUrl !== info.episodeUrl) {
    buttons.push({
      label: 'View Anime',
      url: info.animeUrl,
    })
  }

  const [firstButton, secondButton] = buttons

  if (firstButton && secondButton)
    presenceData.buttons = [firstButton, secondButton]
  else if (firstButton)
    presenceData.buttons = [firstButton]
}

function getAdjustedCurrentTime(videoData: IFrameVideoData): number {
  const currentTime = videoData.currentTime ?? 0

  if (videoData.paused || !videoData.sampledAt)
    return currentTime

  return currentTime + Math.max(0, (Date.now() - videoData.sampledAt) / 1000)
}

function applyPlaybackTimer(presenceData: PresenceData, videoData: IFrameVideoData | undefined, showTimer: boolean): void {
  if (
    !showTimer
    || !videoData
    || videoData.paused
    || !Number.isFinite(videoData.currentTime)
    || !Number.isFinite(videoData.duration)
    || (videoData.duration ?? 0) <= 0
  ) {
    return
  }

  const currentTime = Math.min(
    getAdjustedCurrentTime(videoData),
    videoData.duration ?? Number.POSITIVE_INFINITY,
  )
  const [startTimestamp, endTimestamp] = getTimestamps(
    currentTime,
    videoData.duration ?? 0,
  )

  presenceData.startTimestamp = startTimestamp
  presenceData.endTimestamp = endTimestamp
}

function buildWatchPresence(settings: Settings): PresenceData | undefined {
  const info = getWatchInfo()

  if (!info.title && !info.episodeLabel)
    return undefined

  const videoData = getVideoData()
  const paused = videoData?.paused
  const playbackState = paused === undefined ? undefined : paused ? 'Paused' : 'Playing'
  const hasEpisodePath = /\/watch\/[^/]+\/ep-[^/?#]+/i.test(document.location.pathname)
  const hasEpisodeDataset = !!document.querySelector<HTMLElement>('#watch-main')?.dataset.epName
  const hasLoadedEpisodePlayer = !!document.querySelector('#player iframe, #w-servers .servers, #w-servers .tip b')
  const isEpisodePage = hasEpisodePath || hasEpisodeDataset || (!!info.activeEpisode && hasLoadedEpisodePlayer)

  if (!isEpisodePage)
    return undefined

  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: settings.privacy ? ActivityAssets.Logo : info.poster || ActivityAssets.Logo,
    largeImageText: settings.privacy ? 'Anikoto' : info.title,
    smallImageKey: paused === undefined ? Assets.Reading : paused ? Assets.Pause : Assets.Play,
    smallImageText: playbackState ?? 'Episode page',
  }

  if (settings.privacy) {
    presenceData.details = 'Watching anime'
    presenceData.state = playbackState
  }
  else if (settings.showExactDetails) {
    presenceData.details = truncate(info.title) ?? 'Watching anime'
    presenceData.state = truncate([info.episodeLabel, playbackState].filter(Boolean).join(' - '))
  }
  else {
    presenceData.details = 'Watching anime'
    presenceData.state = playbackState
      ? `${info.episodeLabel ?? 'Episode'} - ${playbackState}`
      : info.episodeLabel
  }

  applyPlaybackTimer(presenceData, videoData, settings.showTimer)
  applyButtons(presenceData, info, settings)

  return presenceData.details ? presenceData : undefined
}

function buildBrowsingPresence(settings: Settings): PresenceData | undefined {
  if (settings.privacy)
    return undefined

  const pageContext = getPageContext()

  if (!pageContext.details)
    return undefined

  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: ActivityAssets.Logo,
    largeImageText: 'Anikoto',
    details: pageContext.details,
    state: settings.showExactDetails ? pageContext.state : undefined,
    smallImageKey: pageContext.smallImageKey,
    smallImageText: pageContext.smallImageText,
  }

  if (settings.showTimer)
    presenceData.startTimestamp = browsingTimestamp

  return presenceData
}

function scheduleActivityUpdate(immediate = false): void {
  if (activityUpdateTimer !== undefined) {
    if (!immediate)
      return

    window.clearTimeout(activityUpdateTimer)
  }

  const delay = immediate
    ? 0
    : Math.max(0, PRESENCE_REFRESH_THROTTLE_MS - (Date.now() - lastPresenceUpdateAt))

  activityUpdateTimer = window.setTimeout(() => {
    activityUpdateTimer = undefined
    void updateActivity()
  }, delay)
}

async function updateActivity(): Promise<void> {
  if (activityUpdateInFlight) {
    activityUpdateQueued = true
    return
  }

  activityUpdateInFlight = true

  try {
    handlePageChange(document.location.href)

    const settings = await getSettings()
    const watchingPresence = buildWatchPresence(settings)

    updateBrowsingTimestamp(document.location.href, !!watchingPresence)

    const presenceData = watchingPresence ?? buildBrowsingPresence(settings)

    if (presenceData?.details)
      presence.setActivity(presenceData)
    else
      presence.clearActivity()

    lastPresenceUpdateAt = Date.now()
  }
  catch {
    presence.clearActivity()
  }
  finally {
    activityUpdateInFlight = false

    if (activityUpdateQueued) {
      activityUpdateQueued = false
      scheduleActivityUpdate(true)
    }
  }
}

presence.on('UpdateData', () => {
  void updateActivity()
})
