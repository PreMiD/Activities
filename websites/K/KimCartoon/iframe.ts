const iframe = new iFrame()
iframe.on('UpdateData', async () => {
  if (document.querySelector('video')) {
    const video = document.querySelector('video')

    if (video && !Number.isNaN(video.duration)) {
      iframe.send({
        iframeVideo: {
          iFrameVideo: true,
          currTime: video.currentTime,
          dur: video.duration,
          paused: video.paused,
        },
      })
    }
    else if (video) {
      iframe.send({
        iframeVideo: {
          iFrameVideo: true,
        },
      })
    }
  }
})
