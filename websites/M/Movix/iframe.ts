const iframe = new iFrame()

iframe.on('UpdateData', async () => {
  const video = document.querySelector('video')

  if (
    video
    && Number.isFinite(video.duration)
    && video.duration > 0
  ) {
    iframe.send({
      currentTime: video.currentTime,
      duration: video.duration,
      paused: video.paused,
    })
  }
})
