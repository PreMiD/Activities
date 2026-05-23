const iframe = new iFrame()

iframe.on('UpdateData', async () => {
  const video = document.querySelector('video')

  if (video) {
    const data = {
      currentTime: video.currentTime,
      paused: video.paused,
      duration: video.duration,
    }
    iframe.send(data)
  }
})
