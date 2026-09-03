const iframe = new iFrame()

iframe.on('UpdateData', async () => {
  const video = document.querySelector('video')

  if (video) {
    iframe.send({
      video: {
        paused: video.paused,
        currentTime: video.currentTime,
        duration: video.duration,
      },
    })
  }
})
