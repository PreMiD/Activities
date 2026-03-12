const iframe = new iFrame()

iframe.on('UpdateData', async () => {
  const video = document.querySelector<HTMLVideoElement>('.jw-video')
    || document.querySelector<HTMLVideoElement>('.html5-video-container')

  if (video && !Number.isNaN(video.duration)) {
    iframe.send({
      current: video.currentTime,
      duration: video.duration,
      paused: video.paused,
    })
  }
})
