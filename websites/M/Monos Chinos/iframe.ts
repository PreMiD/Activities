const iframe = new iFrame()

iframe.on('UpdateData', () => {
  const video = document.querySelector<HTMLVideoElement>('video.jw-video') || document.querySelector<HTMLVideoElement>('video')

  if (!video)
    return

  iframe.send({
    elapsed: video.currentTime,
    duration: video.duration,
    ended: video.ended,
    paused: video.paused,
  })
})
