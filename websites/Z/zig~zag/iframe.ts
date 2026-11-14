// Runs inside zig~zag's YouTube player (an embedded youtube.com/embed frame) and passes what's playing to presence.ts.
const iframe = new iFrame()

iframe.on('UpdateData', async () => {
  const video = document.querySelector<HTMLVideoElement>('video')
  if (!video || !Number.isFinite(video.duration) || video.duration <= 0)
    return

  const link = document.querySelector<HTMLAnchorElement>('.ytp-title-link')
  const title = link?.textContent?.trim() || document.title.replace(/\s*-\s*YouTube$/, '').trim()
  const videoId = link?.href.match(/[?&]v=([\w-]{11})/)?.[1]
    ?? document.location.pathname.match(/\/embed\/([\w-]{11})/)?.[1]
    ?? ''

  iframe.send({
    title,
    videoId,
    currentTime: video.currentTime,
    duration: video.duration,
    paused: video.paused,
  })
})
