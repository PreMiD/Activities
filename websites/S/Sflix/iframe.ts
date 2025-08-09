const iframe = new iFrame()

iframe.on('UpdateData', () => {
  const video = document.querySelector('video')
  if (video && !Number.isNaN(video.duration)) {
    iframe.send({
      currTime: video.currentTime,
      duration: video.duration,
      paused: video.paused,
    })
  }
})
