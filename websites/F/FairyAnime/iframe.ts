const iframe = new iFrame()

iframe.on('UpdateData', async () => {
  let video: HTMLVideoElement | null | undefined

  if (document.querySelector('.jw-video'))
    video = document.querySelector<HTMLVideoElement>('.jw-video')
  else if (document.querySelector('.html5-video-container'))
    video = document.querySelector<HTMLVideoElement>('.html5-video-container > video')

  if (video && !Number.isNaN(video.duration)) {
    iframe.send({
      current: video.currentTime,
      duration: video.duration,
      paused: video.paused,
    })
  }
})
