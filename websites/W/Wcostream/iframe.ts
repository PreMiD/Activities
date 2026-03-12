const iframe = new iFrame()

iframe.on('UpdateData', async () => {
  const video = document.querySelector<HTMLVideoElement>('video')
  if (video) {
    iframe.send({
      paused: video?.paused,
      timeLeft: document.querySelectorAll('[role="timer"]')?.[1]?.textContent
        ?? document.querySelector('.vjs-remaining-time-display')?.textContent,
    })
  }
  else {
    iframe.send({
      titleV: document.querySelector('.video-title')?.textContent
        ?? document.querySelector('[property="og:title"]')?.textContent,
    })
  }
})
