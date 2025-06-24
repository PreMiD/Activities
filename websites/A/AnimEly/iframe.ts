const iframe = new iFrame()

iframe.on('UpdateData', () => {
  if (document.querySelector('video')) {
    const video = document.querySelector<HTMLVideoElement>('video')
    if (video && !Number.isNaN(video.duration)) {
      iframe.send({
        duration: video.duration,
        currentTime: video.currentTime,
        paused: video.paused,
      })
    }
  }
})
