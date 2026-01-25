const iFrameHandler = new iFrame()

iFrameHandler.on('UpdateData', async () => {
  const video = document.querySelector<HTMLVideoElement>('video')
  if (video && !Number.isNaN(video.duration)) {
    iFrameHandler.send({
      currentTime: video.currentTime,
      duration: video.duration,
      paused: video.paused,
    })
  }
})
