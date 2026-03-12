const iframe = new iFrame()
iframe.on('UpdateData', async () => {
  const paths: string[] = document.location.pathname.split('/')
  if (!paths[0])
    paths.shift()
  if (paths[0] !== 'anime' && paths[1] && paths[2])
    return
  const video = document.querySelector<HTMLVideoElement>('#html5player')
  if (video && !Number.isNaN(video.duration)) {
    iframe.send({
      duration: video.duration,
      currentTime: video.currentTime,
      paused: video.paused,
    })
  }
})
