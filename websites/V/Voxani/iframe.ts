export interface FramePlayback {
  url: string
  documentStartedAt: number
  sampledAt: number
  currentTime: number
  duration: number | null
  paused: boolean
  ended: boolean
  readyState: number
  buffering: boolean
  mediaId: string
  seeks: number
  rate: number
}

const iframe = new iFrame()
let currentVideo: HTMLVideoElement | undefined
let listeners: AbortController | undefined
let seeks = 0
let mediaRevision = 0
let mediaSource = ''
let waiting = false
let lastPosition = 0
let seekStart: number | undefined
let urlPromise: Promise<string | undefined> | undefined

iframe.on('UpdateData', async () => {
  if (window.parent === window || window.parent !== window.top)
    return

  const location = document.location
  const selector = location.hostname === 'aniembed.se'
    ? 'video-player video, video[slot="media"]'
    : '#megaplay-player video, video.jw-video'
  const videos = document.querySelectorAll<HTMLVideoElement>(selector)
  const video = videos.length === 1 ? videos[0] : undefined
  if (video !== currentVideo) {
    listeners?.abort()
    currentVideo = video
    mediaRevision++
    seeks = 0
    seekStart = undefined
    mediaSource = video?.currentSrc ?? ''
    waiting = false
    if (video) {
      listeners = new AbortController()
      const options = { signal: listeners.signal }
      lastPosition = video.currentTime
      video.addEventListener('timeupdate', () => {
        if (!video.seeking && seekStart === undefined)
          lastPosition = video.currentTime
      }, options)
      video.addEventListener('seeking', () => {
        seekStart ??= lastPosition
      }, options)
      video.addEventListener('seeked', () => {
        if (Math.abs(video.currentTime - (seekStart ?? lastPosition)) >= 0.75)
          seeks++
        seekStart = undefined
        lastPosition = video.currentTime
      }, options)
      video.addEventListener('emptied', () => {
        mediaRevision++
        waiting = false
      }, options)
      video.addEventListener('waiting', () => {
        waiting = true
      }, options)
      video.addEventListener('canplay', () => {
        waiting = false
      }, options)
      video.addEventListener('playing', () => {
        waiting = false
      }, options)
    }
  }
  if (!video)
    return

  const href = location.href
  urlPromise ??= iframe.getUrl().catch(() => undefined)
  const reportedUrl = await urlPromise
  if (!reportedUrl) {
    urlPromise = undefined
    return
  }
  const reported = new URL(reportedUrl, href)
  if (reported.origin !== location.origin || reported.pathname !== location.pathname
    || location.href !== href || currentVideo !== video || !video.isConnected || video.error) {
    return
  }

  if (mediaSource !== video.currentSrc) {
    mediaSource = video.currentSrc
    mediaRevision++
  }

  const { currentTime, duration, paused, ended, readyState, seeking, playbackRate } = video
  if (!Number.isFinite(currentTime) || currentTime < 0 || !Number.isFinite(playbackRate))
    return

  iframe.send({
    url: href,
    documentStartedAt: performance.timeOrigin,
    sampledAt: Date.now(),
    currentTime,
    duration: Number.isFinite(duration) && duration > 0 ? duration : null,
    paused,
    ended,
    readyState,
    buffering: seeking || waiting || (!paused && readyState < 3),
    mediaId: String(mediaRevision),
    seeks,
    rate: playbackRate,
  } satisfies FramePlayback)
})
