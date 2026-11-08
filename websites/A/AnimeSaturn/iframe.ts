const iframe = new iFrame()

iframe.on('UpdateData', async () => {
  const video = document.querySelector<HTMLVideoElement>('video')
  if (video && !Number.isNaN(video.duration)) {
    iframe.send({
      video: {
        paused: video.paused,
        currentTime: video.currentTime,
        duration: video.duration,
      },
    })
  }
})
