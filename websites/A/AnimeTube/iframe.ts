const iframe = new iFrame()

iframe.on('UpdateData', async () => {
  const video = document.querySelector<HTMLVideoElement>(
    '#videojs-player_html5_api',
  )

  if (video) {
    iframe.send({
      currentTime: video.currentTime,
      paused: video.paused,
      duration: video.duration,
    })
  }
})
