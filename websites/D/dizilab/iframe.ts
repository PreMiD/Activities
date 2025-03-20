const iframe = new iFrame()

setInterval(() => {
  const video = (document.querySelector<HTMLVideoElement>('#vplayer video') ?? document.querySelector<HTMLVideoElement>('video'))

  if (video && document.location.hostname === 'vidmoly.to') {
    iframe.send({
      error: false,
      currentTime: video.currentTime,
      duration: video.duration,
      paused: video.paused,
    })
  }
  else if (video && document.location.hostname !== 'vidmoly.to') {
    iframe.send({
      error: false,
      currentTime: video.currentTime,
      duration: video.duration,
      paused: video.paused,
    })
  }
  else {
    iframe.send({
      error: true,
    })
  }
}, 100)
