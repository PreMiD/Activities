const iframe = new iFrame()

iframe.on('UpdateData', async () => {
  const video = document.querySelector('video')

  if (video && !Number.isNaN(video.duration)) {
    iframe.send({
      duration: video.duration,
      currentTime: video.currentTime,
      paused: video.paused,
    })
  }
})
