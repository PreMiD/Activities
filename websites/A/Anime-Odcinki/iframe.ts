const iframe = new iFrame()

iframe.on('UpdateData', async () => {
  if (document.querySelector('video')) {
    const video = document.querySelector<HTMLVideoElement>('video')
    if (video && !Number.isNaN(video.duration)) {
      iframe.send({
        exists: true,
        duration: video.duration,
        currentTime: video.currentTime,
        paused: video.paused,
      })
    }
  }
})
