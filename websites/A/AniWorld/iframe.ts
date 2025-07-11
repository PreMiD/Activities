const iframe = new iFrame()

iframe.on('UpdateData', async () => {
  const video = document.querySelector('video.jw-video') as HTMLVideoElement | null
  if (video && !Number.isNaN(video.duration)) {
    iframe.send({
      iframe_video: {
        iFrameVideo: true,
        currTime: video.currentTime,
        duration: video.duration,
        paused: video.paused,
      },
    })
  }
})
