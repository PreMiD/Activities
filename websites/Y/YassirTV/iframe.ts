const iframe = new iFrame()

iframe.on('UpdateData', async () => {
  const video = document.querySelector<HTMLVideoElement>('video')

  if (video) {
    iframe.send({
      video: {
        paused: video.paused,
        ended: video.ended,
        readyState: video.readyState,
        currentTime: video.currentTime,
        duration: video.duration,
      },
    })
  }
})
