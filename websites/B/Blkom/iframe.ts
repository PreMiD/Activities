const iframe = new iFrame()

iframe.on('UpdateData', async () => {
  if (document.querySelector('.vjs-tech')) {
    const video = document.querySelector<HTMLVideoElement>('.vjs-tech')
    if (video && !Number.isNaN(video.duration)) {
      iframe.send({
        duration: video.duration,
        currentTime: video.currentTime,
        paused: video.paused,
      })
    }
  }
})
