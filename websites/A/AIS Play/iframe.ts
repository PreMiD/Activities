const iframe = new iFrame()

iframe.on('UpdateData', async () => {
  const video = document.querySelector<HTMLVideoElement>(
    '#vimmi_video_player_html5_api',
  )

  if (video && !Number.isNaN(video.duration)) {
    iframe.send({
      current: video.currentTime,
      duration: video.duration,
      paused: video.paused,
      isLive: !document
        .querySelector('.vjs-live-control')
        ?.classList
        ?.contains('vjs-hidden'),
    })
  }
})
