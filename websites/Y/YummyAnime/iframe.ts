declare class iFrame {
  send(data: any): void
  on(event: string, callback: (data: any) => void): void
}

const iframe = new iFrame()

function getKnownDuration(video: HTMLVideoElement): number {
  const d = video.duration
  if (Number.isFinite(d) && d > 0 && d !== Number.POSITIVE_INFINITY)
    return d

  try {
    if (video.seekable?.length) {
      const end = video.seekable.end(video.seekable.length - 1)
      if (Number.isFinite(end) && end > 0)
        return end
    }
  }
  catch {
    // ignore
  }

  try {
    if (video.buffered?.length) {
      const end = video.buffered.end(video.buffered.length - 1)
      if (Number.isFinite(end) && end > 0)
        return end
    }
  }
  catch {
    // ignore
  }
  return Number.NaN
}

function collectVideos(root: Document | ShadowRoot): HTMLVideoElement[] {
  const out: HTMLVideoElement[] = []
  for (const v of root.querySelectorAll('video')) out.push(v)

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

  const withDuration = videos.filter((v) => {
    const d = getKnownDuration(v)
    return Number.isFinite(d) && d > 0
  })

  if (!withDuration.length) {
    const playing = videos.filter(v => !v.paused && v.currentTime > 0)
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
        duration: 0,
        currentTime: 0,
        paused: true,
        referrer: document.referrer,
      })
      return
    }

    const duration = getKnownDuration(video)
    const isFiniteDuration = Number.isFinite(duration) && duration > 0

    iframe.send({
      duration: isFiniteDuration ? duration : 0,
      currentTime: video.currentTime,
      paused: video.paused,
      referrer: document.referrer,
    })
  }
  catch {
    // ignore
  }
}

let lastTimeUpdateSend = 0
function sendVideoStateThrottled(): void {
  const now = Date.now()
  if (now - lastTimeUpdateSend < 200)
    return
  lastTimeUpdateSend = now
  sendVideoState()
}

iframe.on('UpdateData', async () => {
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
mo.observe(document.documentElement, { subtree: true, childList: true })
