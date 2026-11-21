const iframe = new iFrame()

iframe.on('UpdateData', async () => {
  const video = document.querySelector('video')

  if (!video)
    return

  iframe.send({
    currentTime: video.currentTime,
    duration: video.duration,
    paused: video.paused,
  })
})
