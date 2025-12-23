const iframe = new iFrame()

iframe.on('UpdateData', async () => {
  const video = document.querySelector('video')

  if (!video) {
    iframe.send({})
    return
  }

  try {
    const data: any = {
      duration: video.duration,
      currentTime: video.currentTime,
      paused: video.paused,
    }

    if (!Number.isNaN(data.duration) && !Number.isNaN(data.currentTime))
      iframe.send(data)
    else
      iframe.send({})
  }
  catch {
    iframe.send({})
  }
})
