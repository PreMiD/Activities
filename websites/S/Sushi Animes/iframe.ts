const iframe = new iFrame()

iframe.on('UpdateData', async () => {
  const video = document.querySelector('video')

  if (video) {
    iframe.send({
      currentTime: video.currentTime,
      paused: video.paused,
      duration: video.duration,
    })
  }
})