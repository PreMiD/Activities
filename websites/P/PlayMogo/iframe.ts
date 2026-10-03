const iframe = new iFrame()

interface PlayerVideoData {
  paused: boolean
  ended: boolean
  currentTime: number
  duration: number
  playbackRate: number
}

function readVideo(): PlayerVideoData | null {
  const video = document.querySelector<HTMLVideoElement>('video')

  if (!video)
    return null

  return {
    paused: video.paused,
    ended: video.ended,
    currentTime: Number.isFinite(video.currentTime) ? video.currentTime : 0,
    duration: Number.isFinite(video.duration) ? video.duration : 0,
    playbackRate: video.playbackRate,
  }
}

iframe.on('UpdateData', async () => {
  iframe.send({
    video: readVideo(),
    videoId: document.location.pathname.match(/^\/(?:d|e)\/([A-Za-z0-9]+)(?:\/|$)/)?.[1] ?? null,
  })
})
