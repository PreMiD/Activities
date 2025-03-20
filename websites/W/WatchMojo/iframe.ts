const iframe = new iFrame()
iframe.on('UpdateData', async () => {
  const video = document.querySelector<HTMLVideoElement>(
    '.video-stream.html5-main-video',
  )
  if (video) {
    iframe.send({
      video: true,
      duration: video.duration,
      currentTime: video.currentTime,
      paused: video.paused,
    })
  }
  else {
    iframe.send({
      video: false,
    })
  }
})
