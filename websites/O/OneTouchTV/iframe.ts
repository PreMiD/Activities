const iframe = new iFrame()

iframe.on('UpdateData', async () => {
  const video = document.querySelector<HTMLVideoElement>('video')

  if (video) {
    iframe.send({
      paused: video.paused,
      duration: video.duration,
      currentTime: video.currentTime,
    })
  }
})
