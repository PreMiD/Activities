const iframe = new iFrame()

iframe.on('UpdateData', async () => {
  if (document.querySelector('#oframe') || document.querySelector('#player')) {
    const video = document.querySelector<HTMLVideoElement>('video')

    if (video && !Number.isNaN(video.duration)) {
      iframe.send({
        hasVideo: true,
        duration: video.duration,
        currentTime: video.currentTime,
        paused: video.paused,
      })
    }
    else {
      iframe.send({ hasVideo: false })
    }
  }
  else {
    iframe.send({ hasVideo: false })
  }
})
