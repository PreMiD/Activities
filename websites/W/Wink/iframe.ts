const iframe = new iFrame()

iframe.on('UpdateData', async () => {
  const video = document.querySelector<HTMLVideoElement>('.eump-fullport:last-child')
  if (video) {
    iframe.send({
      paused: video.paused,
      duration: video.duration,
      currentTime: video.currentTime,
      poster: null,
      title: null,
    })
  }
  else {
    iframe.send(null)
  }
})
