export interface IFrameData {
  currentTime?: number
  duration?: number
  paused?: boolean
}

const iframe = new iFrame()

function getCandidateVideos(): HTMLVideoElement[] {
  return Array.from(document.querySelectorAll<HTMLVideoElement>('video'))
}

function getBestVideoElement(): HTMLVideoElement | null {
  const candidates = getCandidateVideos()
  if (!candidates.length)
    return null

  if (candidates.length === 1)
    return candidates[0] ?? null

  const withScore = candidates.map((video) => {
    const duration = Number(video.duration)
    const currentTime = Number(video.currentTime)
    const hasKnownDuration = Number.isFinite(duration) && duration > 0
    const hasProgress = Number.isFinite(currentTime) && currentTime > 0
    const score
      = (video.readyState ?? 0) * 10
        + (hasKnownDuration ? 100 : 0)
        + (hasProgress ? 25 : 0)

    return { video, score }
  })

  withScore.sort((a, b) => b.score - a.score)
  return withScore[0]?.video ?? null
}

function getFiniteDuration(video: HTMLVideoElement): number {
  const rawDuration = Number(video.duration)
  if (Number.isFinite(rawDuration) && rawDuration > 0)
    return rawDuration

  const seekable = video.seekable
  if (seekable && seekable.length > 0) {
    const end = Number(seekable.end(seekable.length - 1))
    if (Number.isFinite(end) && end > 0)
      return end
  }

  const buffered = video.buffered
  if (buffered && buffered.length > 0) {
    const end = Number(buffered.end(buffered.length - 1))
    if (Number.isFinite(end) && end > 0)
      return end
  }

  return Number.NaN
}

iframe.on('UpdateData', async () => {
  const video = getBestVideoElement()
  if (!video) {
    iframe.send({})
    return
  }

  try {
    const duration = getFiniteDuration(video)
    const currentTime = Number(video.currentTime)

    if (!Number.isFinite(currentTime)) {
      iframe.send({})
      return
    }

    const data: IFrameData = {
      currentTime,
      paused: video.paused,
    }

    if (Number.isFinite(duration) && duration > 0)
      data.duration = duration

    iframe.send(data)
  }
  catch {
    iframe.send({})
  }
})
