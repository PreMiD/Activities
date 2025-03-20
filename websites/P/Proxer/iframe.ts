const iframe = new iFrame()

iframe.on('UpdateData', async () => {
  // Exclude proxer
  if (document.querySelector('#proxerToken'))
    return

  const videos = document.querySelectorAll('video')
  const [video] = videos
  if (videos.length === 0)
    return

  if (video) {
    // Exclude proxer ads
    if (video.className.includes('ads'))
      return
    iframe.send({
      currentTime: video.currentTime,
      duration: video.duration,
      paused: video.paused,
    })
  }
  else {
    iframe.send(null)
  }
})
