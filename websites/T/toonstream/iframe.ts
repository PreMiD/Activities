const iframe = new iFrame()

iframe.on('UpdateData', async () => {
  const video = document.querySelector('video')

  if (video) {
    iframe.send({
      iframeVideoData: {
        iFrameVideo: true,
        currTime: video.currentTime,
        dur: video.duration,
        paused: video.paused,
      },
    })
  }
})
