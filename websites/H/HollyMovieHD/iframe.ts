const iframe = new iFrame()

iframe.on('UpdateData', async () => {
  const video = document.querySelector<HTMLVideoElement>('video')

  if (!video || !Number.isFinite(video.duration) || video.duration <= 0) {
    iframe.send({ active: false })
    return
  }

  iframe.send({
    currentTime: video.currentTime,
    duration: video.duration,
    paused: video.paused,
  })
})
