const iframe = new iFrame()

iframe.on('UpdateData', async () => {
  const video = document.querySelector<HTMLVideoElement>(
    'video',
  )

  if (video && !video.paused) {
    iframe.send({
      exists: true,
    })
  }
  else {
    iframe.send({
      exists: false,
    })
  }
})
