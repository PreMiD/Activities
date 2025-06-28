const iframe = new iFrame()

setInterval(() => {
  if (!document.location.hostname.includes('youtube.com') && !document.location.hostname.includes('youtu.be')) {
    const video = document.querySelector('video')
    if (video != null && !Number.isNaN(video.duration)) {
      iframe.send({
        currTime: video.currentTime,
        duration: video.duration,
        paused: video.paused,
      })
    }
  }
}, 500)
