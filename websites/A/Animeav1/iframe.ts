const iframe = new iFrame()

iframe.on('UpdateData', async () => {
  if (
    document.querySelector('video[id$=\'_html5_api\']')
    || document.querySelector('div.jw-media.jw-reset > video')
  ) {
    const video = document.querySelector<HTMLVideoElement>('video')
    if (video && !Number.isNaN(video.duration)) {
      iframe.send({
        duration: video.duration,
        currentTime: video.currentTime,
        paused: video.paused,
      })
    }
  }
})
