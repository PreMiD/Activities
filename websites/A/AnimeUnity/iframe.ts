const iframe = new iFrame()

iframe.on('UpdateData', async () => {
  const video = document.querySelector<HTMLVideoElement>('video')
  if (video) {
    iframe.send({
      current: video.currentTime,
      duration: video.duration,
      paused: video.paused,
    })
  }
})
