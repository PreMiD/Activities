const iframe = new iFrame()

iframe.on('UpdateData', () => {
  //* Every hoster ships its own player, so match on a playable duration rather
  //* than a selector. This also skips the placeholders rendered before the
  //* stream resolves.
  const video = Array.from(document.querySelectorAll('video'))
    .find(({ duration }) => Number.isFinite(duration) && duration > 0)

  if (!video)
    return

  iframe.send({
    currentTime: video.currentTime,
    duration: video.duration,
    paused: video.paused || video.ended,
  })
})
