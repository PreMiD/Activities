const iframe = new iFrame()
iframe.on('UpdateData', async () => {
  if (document.querySelector('.video')) {
    const video = document.querySelector<HTMLVideoElement>('.video')
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
  }
  else if (document.querySelector('body > div > div > div > video')) {
    const video = document.querySelector<HTMLVideoElement>('body > div > div > div > video')
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
  }
})
