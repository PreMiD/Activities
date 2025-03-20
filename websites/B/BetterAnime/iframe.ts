(iframe =>
  iframe.on('UpdateData', () => {
    const video = document.querySelector('video')
    if (video) {
      iframe.send({
        duration: video.duration,
        currentTime: video.currentTime,
        paused: video.paused,
      })
    }
  }))(new iFrame())
