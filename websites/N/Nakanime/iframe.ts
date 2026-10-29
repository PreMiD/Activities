const iframe = new iFrame()

iframe.on('UpdateData', () => {
  const video = document.querySelector('video')

  if (!video || !Number.isFinite(video.duration) || video.duration <= 0) {
    lastVideo = null

    iframe.send({
      video: null,
    })

    return
  }

  lastVideo = video

  iframe.send({
    video: {
      paused: video.paused,
      currentTime: video.currentTime,
      duration: video.duration,
    },
  })
})
