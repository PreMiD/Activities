const iframe = new iFrame()

function getVideosFromOpenShadowRoots(root: Document | ShadowRoot): HTMLVideoElement[] {
  const directVideos = Array.from(root.querySelectorAll<HTMLVideoElement>('video'))
  if (directVideos.length)
    return directVideos

  const videos: HTMLVideoElement[] = []
  for (const element of Array.from(root.querySelectorAll<HTMLElement>('*'))) {
    if (element.shadowRoot)
      videos.push(...getVideosFromOpenShadowRoots(element.shadowRoot))
  }

  return videos
}

function getVideoScore(video: HTMLVideoElement): number {
  let score = 0

  if (!video.ended)
    score += 20
  if (!video.paused)
    score += 100
  if (Number.isFinite(video.duration) && video.duration > 0)
    score += 40
  if (Number.isFinite(video.currentTime) && video.currentTime > 0)
    score += 20

  score += Math.max(0, video.readyState) * 5

  if (video.clientWidth > 0 && video.clientHeight > 0)
    score += 10

  return score
}

iframe.on('UpdateData', async () => {
  const frameUrl = await iframe.getUrl()
  const videos = getVideosFromOpenShadowRoots(document)
  const video = videos.sort((a, b) => getVideoScore(b) - getVideoScore(a))[0]

  if (!video) {
    iframe.send({
      frameUrl,
      video: {
        found: false,
      },
    })
    return
  }

  iframe.send({
    frameUrl,
    video: {
      found: true,
      paused: video.paused,
      ended: video.ended,
      currentTime: video.currentTime,
      duration: video.duration,
      readyState: video.readyState,
    },
  })
})
