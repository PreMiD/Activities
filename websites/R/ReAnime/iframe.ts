const iframe = new iFrame()

function getKnownDuration(video: HTMLVideoElement): number {
  const duration = video.duration
  if (
    Number.isFinite(duration)
    && duration > 0
    && duration !== Number.POSITIVE_INFINITY
  ) {
    return duration
  }

  try {
    if (video.seekable?.length) {
      const end = video.seekable.end(video.seekable.length - 1)
      if (Number.isFinite(end) && end > 0)
        return end
    }
  }
  catch {

  }

  try {
    if (video.buffered?.length) {
      const end = video.buffered.end(video.buffered.length - 1)
      if (Number.isFinite(end) && end > 0)
        return end
    }
  }
  catch {

  }

  return Number.NaN
}

function collectVideos(root: Document | ShadowRoot): HTMLVideoElement[] {
  const out: HTMLVideoElement[] = []

  for (const video of root.querySelectorAll('video'))
    out.push(video)

  for (const el of root.querySelectorAll('*')) {
    if (el.shadowRoot)
      out.push(...collectVideos(el.shadowRoot))
  }

  return out
}

function pickBestVideo(): HTMLVideoElement | null {
  const videos = collectVideos(document)
  if (!videos.length)
    return null

  const withDuration = videos.filter((video) => {
    const duration = getKnownDuration(video)
    return Number.isFinite(duration) && duration > 0
  })

  if (!withDuration.length) {
    const playing = videos.filter(video => !video.paused && video.currentTime > 0)
    if (playing.length)
      return playing[0] ?? null
  }

  const pool = withDuration.length ? withDuration : videos

  return pool.reduce((a, b) => {
    const da = getKnownDuration(a)
    const db = getKnownDuration(b)
    const ad = Number.isFinite(da) ? da : 0
    const bd = Number.isFinite(db) ? db : 0
    return bd >= ad ? b : a
  })
}

function sendVideoState(): void {
  try {
    const video = pickBestVideo()

    if (!video) {
      iframe.send({
        currentTime: 0,
        duration: 0,
        paused: true,
        referrer: document.referrer,
      })
      return
    }

    const duration = getKnownDuration(video)
    const isFiniteDuration = Number.isFinite(duration) && duration > 0

    iframe.send({
      currentTime: video.currentTime,
      duration: isFiniteDuration ? duration : 0,
      paused: video.paused || video.ended,
      referrer: document.referrer,
    })
  }
  catch {

  }
}

let lastSend = 0
function sendVideoStateThrottled(): void {
  const now = Date.now()
  if (now - lastSend < 200)
    return

  lastSend = now
  sendVideoState()
}

iframe.on('UpdateData', () => {
  sendVideoState()
})

document.addEventListener('loadedmetadata', sendVideoState, true)
document.addEventListener('durationchange', sendVideoState, true)
document.addEventListener('canplay', sendVideoState, true)
document.addEventListener('play', sendVideoState, true)
document.addEventListener('pause', sendVideoState, true)
document.addEventListener('seeked', sendVideoState, true)
document.addEventListener('timeupdate', sendVideoStateThrottled, true)
document.addEventListener('progress', sendVideoStateThrottled, true)

let moTimer: number | undefined
const mo = new MutationObserver(() => {
  if (moTimer !== undefined)
    window.clearTimeout(moTimer)

  moTimer = window.setTimeout(() => {
    moTimer = undefined
    sendVideoState()
  }, 400)
})

mo.observe(document.documentElement, {
  subtree: true,
  childList: true,
})
