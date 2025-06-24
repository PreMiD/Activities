const iframe = new iFrame()

setInterval(() => {
  const video = document.querySelector('video')
  if (video != null && !Number.isNaN(video.duration)) {
    iframe.send({
      currTime: video.currentTime,
      duration: video.duration,
      paused: video.paused,
    })
  }
}, 500)
