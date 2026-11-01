const iframe = new iFrame()

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
    // Ignore invalid seekable ranges.
  }

  try {
    if (video.buffered?.length) {
      const end = video.buffered.end(video.buffered.length - 1)
      if (Number.isFinite(end) && end > 0)
        return end
    }
  }
  catch {
    // Ignore invalid buffered ranges.
  }

  return Number.NaN
}

function collectVideos(root: Document | ShadowRoot): HTMLVideoElement[] {
  const videos: HTMLVideoElement[] = []

  for (const video of root.querySelectorAll<HTMLVideoElement>('video'))
    videos.push(video)

  for (const element of root.querySelectorAll('*')) {
    if (element.shadowRoot)
      videos.push(...collectVideos(element.shadowRoot))
  }

  return videos
}

function getVideoPriority(video: HTMLVideoElement): number {
  let priority = 0

  if (Number.isFinite(video.currentTime) && video.currentTime > 0)
    priority += 2

  if (Number.isFinite(getKnownDuration(video)) && getKnownDuration(video) > 0)
    priority += 4

  if (!video.paused)
    priority += 10

  if (video.readyState > 1)
    priority += 1

  if (video.hidden || video.style.display === 'none')
    priority -= 1000

  return priority
}

function findBestVideo(): HTMLVideoElement | null {
  const videos = collectVideos(document)
  if (videos.length === 0)
    return null

  return videos.reduce((bestVideo, video) => {
    if (!bestVideo)
      return video

    return getVideoPriority(video) > getVideoPriority(bestVideo) ? video : bestVideo
  }, null as HTMLVideoElement | null)
}

function sendCurrentVideoState(): void {
  const video = findBestVideo()

  if (!video || !Number.isFinite(video.currentTime) || !Number.isFinite(getKnownDuration(video))) {
    iframe.send({ iframeVideo: null })
    return
  }

  iframe.send({
    iframeVideo: {
      currentTime: video.currentTime,
      duration: getKnownDuration(video),
      paused: video.paused,
    },
  })
}

let debounceTimer: number | undefined
function queueStateRefresh(): void {
  if (debounceTimer !== undefined)
    window.clearTimeout(debounceTimer)

  debounceTimer = window.setTimeout(() => {
    debounceTimer = undefined
    sendCurrentVideoState()
  }, 200)
}

const events = ['loadedmetadata', 'durationchange', 'timeupdate', 'play', 'pause', 'seeked', 'playing', 'waiting', 'canplay']
for (const eventName of events)
  document.addEventListener(eventName, queueStateRefresh, true)

const observer = new MutationObserver(() => {
  queueStateRefresh()
})

const observeRoot = document.body ?? document.documentElement
if (observeRoot)
  observer.observe(observeRoot, { childList: true, subtree: true })

iframe.on('UpdateData', () => {
  sendCurrentVideoState()
})

sendCurrentVideoState()
