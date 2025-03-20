const iframe = new iFrame()

iframe.on('UpdateData', async () => {
  const video = document.querySelector<HTMLVideoElement>('.jw-video')
    ?? document.querySelector<HTMLVideoElement>('.html5-video-container > video')

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
})
