const iframe = new iFrame()

iframe.on('UpdateData', () => {
  //* AniWorld embeds third-party hosters (VOE, Doodstream, Filemoon, Vidmoly,
  //* ...) that each ship their own player, and Filemoon nests its player in yet
  //* another frame. Both the domains and the embed paths rotate, so the frame
  //* cannot be recognised by its URL - hence the wide iFrameRegExp. Keep this
  //* handler cheap and only report a video that actually has a playable
  //* duration, which also skips the placeholder players some hosters render
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
