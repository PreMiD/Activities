const iframe = new iFrame()

/** Sends the playback state of the embedded player to the presence script. */
iframe.on('UpdateData', async () => {
  const video = Array.from(
    document.querySelectorAll<HTMLVideoElement>('video'),
  ).find(element => !element.ended && element.readyState > 0)

  if (!video) {
    return
  }

  await iframe.send({
    paused: video.paused,
    currentTime: video.currentTime,
    duration: video.duration,
  })
})
