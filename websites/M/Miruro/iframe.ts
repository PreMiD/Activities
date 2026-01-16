const iframe = new iFrame()

interface VideoData {
  paused: boolean
  currentTime: number
  duration: number
}

iframe.on('UpdateData', async () => {
  const video = document.querySelector<HTMLVideoElement>('video')
  if (!video) return

  iframe.send({
    paused: video.paused,
    currentTime: video.currentTime,
    duration: video.duration,
  })
})
