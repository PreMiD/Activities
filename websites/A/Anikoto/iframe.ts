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

const iframe = new iFrame()
const PARENT_MESSAGE_SOURCE = 'premid-anikoto'
const PLAYBACK_POLL_INTERVAL_MS = 500
const PLAYING_REFRESH_INTERVAL_MS = 1_500
const SELECTED_VIDEO_SCORE_LEEWAY = 700
let lastSend = 0
let lastStateKey: string | undefined
let lastStateSentAt = 0
let selectedVideo: HTMLVideoElement | undefined

function getCleanText(selector: string): string | undefined {
  return document.querySelector(selector)?.textContent?.replace(/\s+/g, ' ').trim() || undefined
}

function getKnownDuration(video: HTMLVideoElement): number {
  const duration = video.duration

  if (Number.isFinite(duration) && duration > 0 && duration !== Number.POSITIVE_INFINITY)
    return duration

  try {
    if (video.seekable?.length) {
      const end = video.seekable.end(video.seekable.length - 1)
      if (Number.isFinite(end) && end > 0)
        return end
    }
  }
  catch {
    // Ignore media ranges that are unavailable while the player is loading.
  }

  try {
    if (video.buffered?.length) {
      const end = video.buffered.end(video.buffered.length - 1)
      if (Number.isFinite(end) && end > 0)
        return end
    }
  }
  catch {
    // Ignore media ranges that are unavailable while the player is loading.
  }

  return Number.NaN
}

function collectVideos(root: Document | ShadowRoot): HTMLVideoElement[] {
  const videos = [...root.querySelectorAll<HTMLVideoElement>('video')]

  for (const element of root.querySelectorAll<HTMLElement>('*')) {
    if (element.shadowRoot)
      videos.push(...collectVideos(element.shadowRoot))
  }

  return videos
}

function getVisibleArea(element: Element): number {
  const rect = element.getBoundingClientRect()
  return Math.max(0, rect.width) * Math.max(0, rect.height)
}

function isElementVisible(element: Element): boolean {
  const rect = element.getBoundingClientRect()

  if (rect.width <= 1 || rect.height <= 1)
    return false

  const style = window.getComputedStyle(element)

  return style.display !== 'none'
    && style.visibility !== 'hidden'
    && Number(style.opacity || 1) > 0
}

function getPlayerRoot(video: HTMLVideoElement): HTMLElement {
  return video.closest<HTMLElement>(
    [
      '.jwplayer',
      '.plyr',
      '.video-js',
      '.dplayer',
      '.art-video-player',
      '.artplayer-app',
      '.xgplayer',
      '.player',
      '#player',
    ].join(', '),
  ) ?? document.documentElement
}

function getStateFromClassName(className: string): boolean | undefined {
  const normalized = className.toLowerCase()

  if (
    /\b(?:jw-state-paused|vjs-paused|plyr--paused|dplayer-paused|art-paused|xgplayer-is-pause)\b/.test(normalized)
  ) {
    return true
  }

  if (
    /\b(?:jw-state-playing|vjs-playing|plyr--playing|dplayer-playing|art-playing|xgplayer-is-playing|xgplayer-playing)\b/.test(normalized)
  ) {
    return false
  }

  return undefined
}

function getButtonPlaybackState(root: HTMLElement): boolean | undefined {
  const controls = [...root.querySelectorAll<HTMLElement>(
    [
      '[aria-label]',
      '[title]',
      '[data-title]',
      '.jw-icon-playback',
      '.plyr__control',
      '.vjs-play-control',
      '.dplayer-play-icon',
      '.art-control-playAndPause',
      '.xgplayer-play',
    ].join(', '),
  )].filter(isElementVisible)

  for (const control of controls) {
    const label = [
      control.getAttribute('aria-label'),
      control.getAttribute('title'),
      control.getAttribute('data-title'),
      control.textContent,
    ].join(' ').toLowerCase()

    if (/\b(?:pause|paused)\b/.test(label))
      return false

    if (/\b(?:play|replay|resume)\b/.test(label))
      return true
  }

  return undefined
}

function getDomPlaybackState(video: HTMLVideoElement): boolean | undefined {
  const root = getPlayerRoot(video)
  const roots = [root, document.documentElement]

  for (const element of roots) {
    const state = getStateFromClassName(element.className)

    if (state !== undefined)
      return state
  }

  return getButtonPlaybackState(root)
}

function getVideoScore(video: HTMLVideoElement): number {
  const duration = getKnownDuration(video)
  const visibleArea = getVisibleArea(video)
  const domPlaybackState = getDomPlaybackState(video)
  const isPlaying = domPlaybackState === false || (!video.paused && !video.ended)

  return (
    Math.min(visibleArea / 40, 8000)
    + (isPlaying ? 250 : 0)
    + (video.currentTime > 0 ? 1200 : 0)
    + (Number.isFinite(duration) && duration > 0 ? Math.min(duration, 1000) : 0)
    + (isElementVisible(video) ? 500 : 0)
    + (selectedVideo === video ? 500 : 0)
    + video.readyState
  )
}

function pickBestVideo(): HTMLVideoElement | undefined {
  const videos = collectVideos(document).filter(video => video.readyState > 0 || video.currentTime > 0)

  if (!videos.length)
    return undefined

  const best = videos.reduce((best, candidate) => {
    return getVideoScore(candidate) > getVideoScore(best) ? candidate : best
  })

  if (selectedVideo?.isConnected && videos.includes(selectedVideo)) {
    const selectedScore = getVideoScore(selectedVideo)
    const bestScore = getVideoScore(best)

    if (selectedScore + SELECTED_VIDEO_SCORE_LEEWAY >= bestScore)
      return selectedVideo
  }

  selectedVideo = best
  return best
}

function postParentVideoState(video: IFrameVideoData | null): void {
  try {
    if (window.parent === window)
      return

    window.parent.postMessage({
      source: PARENT_MESSAGE_SOURCE,
      type: 'video-state',
      frameUrl: document.location.href,
      sampledAt: Date.now(),
      video,
    }, '*')
  }
  catch {
    // Ignore pages that block parent messaging.
  }
}

function sendVideoPayload(video: IFrameVideoData | null): void {
  const payload = {
    sampledAt: Date.now(),
    video,
  }

  iframe.send(payload)
  postParentVideoState(video)
}

function sendNoVideoState(): void {
  selectedVideo = undefined
  sendVideoPayload(null)
}

function getCurrentVideoState(): IFrameVideoData | null {
  try {
    const video = pickBestVideo()

    if (!video)
      return null

    const duration = getKnownDuration(video)

    return {
      currentTime: Number.isFinite(video.currentTime) ? video.currentTime : undefined,
      duration: Number.isFinite(duration) ? duration : undefined,
      paused: getDomPlaybackState(video) ?? (video.paused || video.ended),
      readyState: video.readyState,
      sampledAt: Date.now(),
      src: video.currentSrc || video.src || undefined,
      title:
        getCleanText('.video-title')
        ?? getCleanText('.jw-title-primary')
        ?? getCleanText('.plyr__video-title')
        ?? document.title?.replace(/\s+/g, ' ').trim()
        ?? undefined,
      url: document.location.href,
    }
  }
  catch {
    // Ignore inaccessible or transient iframe states.
    return null
  }
}

function sendVideoState(): void {
  const video = getCurrentVideoState()

  if (!video) {
    sendNoVideoState()
    return
  }

  sendVideoPayload(video)
}

function sendVideoStateThrottled(): void {
  const now = Date.now()

  if (now - lastSend < 250)
    return

  lastSend = now
  sendVideoState()
}

function getStateKey(video: IFrameVideoData | null): string {
  if (!video)
    return 'no-video'

  const time = Number.isFinite(video.currentTime)
    ? Math.floor((video.currentTime ?? 0) * 2) / 2
    : ''

  return [
    video.paused === true ? 'paused' : video.paused === false ? 'playing' : 'unknown',
    time,
    Number.isFinite(video.duration) ? Math.round(video.duration ?? 0) : '',
    video.src ?? video.url ?? '',
  ].join('|')
}

function sendVideoStateOnChange(): void {
  const video = getCurrentVideoState()
  const stateKey = getStateKey(video)
  const now = Date.now()
  const refreshInterval = video?.paused ? 5_000 : PLAYING_REFRESH_INTERVAL_MS

  if (stateKey === lastStateKey && now - lastStateSentAt < refreshInterval)
    return

  lastStateKey = stateKey
  lastStateSentAt = now

  if (video)
    sendVideoPayload(video)
  else
    sendNoVideoState()
}

iframe.on('UpdateData', sendVideoState)

document.addEventListener('loadedmetadata', sendVideoState, true)
document.addEventListener('durationchange', sendVideoState, true)
document.addEventListener('canplay', sendVideoState, true)
document.addEventListener('playing', sendVideoState, true)
document.addEventListener('play', sendVideoState, true)
document.addEventListener('pause', sendVideoState, true)
document.addEventListener('ended', sendVideoState, true)
document.addEventListener('seeked', sendVideoState, true)
document.addEventListener('timeupdate', sendVideoStateThrottled, true)
document.addEventListener('progress', sendVideoStateThrottled, true)

window.setInterval(sendVideoStateOnChange, PLAYBACK_POLL_INTERVAL_MS)

let mutationTimer: number | undefined
const observer = new MutationObserver(() => {
  if (mutationTimer !== undefined)
    window.clearTimeout(mutationTimer)

  mutationTimer = window.setTimeout(() => {
    mutationTimer = undefined
    sendVideoState()
  }, 400)
})

observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
})
