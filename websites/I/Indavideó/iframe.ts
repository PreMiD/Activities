const iframe = new iFrame()

iframe.on('UpdateData', async () => {
  const video = document.querySelector<HTMLMediaElement>(
    'div#mainContainer > div#player > video#html5video.video-player',
  )
  if (video) {
    iframe.send({
      currentTime: video.currentTime,
      paused: video.paused,
      duration: video.duration,
    })
  }
})
