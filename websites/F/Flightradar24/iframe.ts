const iframe = new iFrame()

if (document.location.hostname === 'player.blubrry.com') {
  iframe.on('UpdateData', async () => {
    iframe.send({
      elapsed: document.querySelector('.time-elapsed')?.textContent,
      total: document.querySelector('.sm2-inline-duration.time-total')
        ?.textContent,
      isPlaying: Boolean(document.querySelector('i.is-playing')),
    })
  })
}

if (document.location.hostname === 'www.youtube.com') {
  iframe.on('UpdateData', async () => {
    const { currentTime, duration, paused } = document.querySelector<HTMLVideoElement>(
      'video.video-stream.html5-main-video',
    )!

    iframe.send({
      currentTime,
      duration,
      paused,
    })
  })
}
