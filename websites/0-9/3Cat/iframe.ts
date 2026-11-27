const iframe = new iFrame()

iframe.on('UpdateData', async () => {
  const media = document.querySelector<HTMLMediaElement>('video, audio')
  if (!media || media.readyState < 1)
    return

  iframe.send({
    currentTime: media.currentTime,
    duration: media.duration,
    paused: media.paused,
    live: !Number.isFinite(media.duration),
  })
})
