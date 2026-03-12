const TRanimeizleIframe = new iFrame()

TRanimeizleIframe.on('UpdateData', () => {
  const video = document.querySelector('video')

  if (video && !Number.isNaN(video.duration)) {
    TRanimeizleIframe.send({
      duration: video.duration,
      currentTime: video.currentTime,
      paused: video.paused,
    })
  }
})
