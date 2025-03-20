const iframe = new iFrame()

iframe.on('UpdateData', async () => {
  if (document.querySelector('video')) {
    const video = document.querySelector('video')
    if (video && !Number.isNaN(video.duration)) {
      iframe.send({
        duration: video.duration,
        currentTime: video.currentTime,
        paused: video.paused,
        isPlaying: !video.paused,
      })
    }
  }
})
