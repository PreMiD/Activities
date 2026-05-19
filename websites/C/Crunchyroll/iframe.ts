const iframe = new iFrame()

iframe.on('UpdateData', () => {
  const video
    = document.querySelector<HTMLVideoElement>('video')
      ?? document.querySelector<HTMLVideoElement>('#player0')
      ?? document.querySelector<HTMLVideoElement>('#player_html5_api')

  if (video && !Number.isNaN(video.duration)) {
    iframe.send({
      iFrameVideoData: {
        iFrameVideo: true,
        currTime: video.currentTime,
        dur: video.duration,
        paused: video.paused,
      },
    })
  }
})
