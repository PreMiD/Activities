const iframe = new iFrame()

iframe.on('UpdateData', async () => {
  const video = document.querySelector<HTMLVideoElement>('video')
  const body = document.body

  if (video && !Number.isNaN(video.duration)) {
    iframe.send({
      duration: video.duration,
      currentTime: video.currentTime,
      paused: video.paused,
      seriesId: body.getAttribute('data-series_id'),
      title: body.getAttribute('data-title'),
      eptitle: body.getAttribute('data-eptitle'),
      epnum: body.getAttribute('data-epnum'),
      senum: body.getAttribute('data-senum'),
      maindesc: body.getAttribute('data-maindesc'),
      epDesc: body.getAttribute('data-ep-desc'),
      hasVideo: true,
    })
  }
})
