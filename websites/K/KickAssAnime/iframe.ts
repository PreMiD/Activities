const iframe = new iFrame()

iframe.on('UpdateData', async () => {
  if (document.querySelector('video')) {
    const video = document.querySelector('video')
    if (video && !Number.isNaN(video.duration)) {
      iframe.send({
        exists: true,
        duration: video.duration,
        currentTime: video.currentTime,
        paused: video.paused,
      })
    }
    else if (video) {
      iframe.send({
        exists: true,
        paused: true,
      })
    }
  }
})
