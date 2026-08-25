const iframe = new iFrame()

iframe.on('UpdateData', async () => {
  const video = document.querySelector<HTMLVideoElement>('video')
  if (video && !Number.isNaN(video.duration) && video.duration > 0) {
    iframe.send({
      duration: video.duration,
      currentTime: video.currentTime,
      paused: video.paused,
      ended: video.ended,
    })
  }
})

