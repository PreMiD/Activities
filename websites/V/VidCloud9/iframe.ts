const iframe = new iFrame()
iframe.on('UpdateData', async () => {
  let video
  if (
    document.querySelector(
      '#myVideo > div.jw-wrapper.jw-reset > div.jw-media.jw-reset > video',
    )
  ) {
    video = document.querySelector<HTMLVideoElement>(
      '#myVideo > div.jw-wrapper.jw-reset > div.jw-media.jw-reset > video',
    )
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
  else if (document.querySelector('#myVideo')) {
    video = document.querySelector<HTMLVideoElement>('#myVideo')
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
