const iframe = new iFrame()

iframe.on('UpdateData', async () => {
  const video = document.querySelector<HTMLVideoElement>('video')
  if (video && !Number.isNaN(video.duration)) {
    iframe.send({
      duration: video.duration,
      currTime: video.currentTime,
      paused: video.paused,
    })
  }
})
