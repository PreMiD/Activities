const ytplrIframe = new iFrame()
ytplrIframe.on('UpdateData', async () => {
  const videoElement = document.querySelector<HTMLVideoElement>('.video-stream')
  if (!videoElement)
    return

  ytplrIframe.send({
    title: document.querySelector<HTMLAnchorElement>('div.ytp-title-text > a')
      ?.textContent,
    duration: videoElement.duration,
    currentTime: videoElement.currentTime,
    paused: videoElement.paused,
  })
})
