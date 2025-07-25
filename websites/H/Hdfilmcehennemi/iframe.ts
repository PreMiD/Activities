const iframe = new iFrame()

iframe.on('UpdateData', () => {
  const video = document.querySelector<HTMLVideoElement>('video')
  if (!video || Number.isNaN(video.duration))
    return
  iframe.send({
    iFrameVideoData: {
      currTime: video.currentTime,
      dur: video.duration,
      paused: video.paused || video.ended,
    },
  })
})
