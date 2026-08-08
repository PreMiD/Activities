interface VideoData {
  currentTime: number
  duration: number
  paused: boolean
}

const iframe = new iFrame()

iframe.on('UpdateData', () => {
  const videos = Array.from(document.querySelectorAll<HTMLVideoElement>('video'))
  const video = videos.find(candidate => candidate.readyState > 0 && Number.isFinite(candidate.duration) && candidate.duration > 0)

  if (!video) {
    iframe.send(null)
    return
  }

  const videoData: VideoData = {
    currentTime: video.currentTime,
    duration: video.duration,
    paused: video.paused,
  }

  iframe.send(videoData)
})
