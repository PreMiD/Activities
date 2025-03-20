const iframe = new iFrame()

setInterval(() => {
  if (document.location.hostname === 'static.crunchyroll.com') {
    const video = document.querySelector<HTMLVideoElement>('#player0') ?? document.querySelector<HTMLVideoElement>('#player_html5_api')

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
}, 100)
