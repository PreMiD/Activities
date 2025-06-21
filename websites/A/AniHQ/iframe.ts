const iframe = new iFrame()

iframe.on('UpdateData', () => {
  if (document.location.hostname === 'animestream.playerp2p.com') {
    const video = document.querySelector<HTMLVideoElement>(
      '#media-player .jw-media video',
    )
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
  }
})
