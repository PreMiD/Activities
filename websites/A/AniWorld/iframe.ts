const iframe = new iFrame()

iframe.on('UpdateData', () => {
  //* AniWorld embeds third-party hosters (VOE, Doodstream, Filemoon, Vidmoly,
  //* ...) that each ship their own player, so instead of matching a
  //* hoster-specific selector take the first video that reports a playable
  //* duration. This also skips the placeholder players some hosters render
  //* before the stream is resolved.
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
