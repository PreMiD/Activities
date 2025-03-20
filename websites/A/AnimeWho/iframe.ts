const videoFrame = new iFrame()

videoFrame.on('UpdateData', async () => {
  const video = document.querySelector<HTMLVideoElement>('video')

  if (video) {
    videoFrame.send({
      paused: video.paused,
      duration: video.duration,
      currentTime: video.currentTime,
    })
  }
})
