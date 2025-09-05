const iframe = new iFrame()

function findVideo(): HTMLVideoElement | null {
  let video = document.querySelector<HTMLVideoElement>('video')
  if (video)
    return video

  const shadowHost = document.querySelector('#embedVideoE > div > div > vk-video-player > div > div')
  if (shadowHost?.shadowRoot) {
    video = shadowHost.shadowRoot.querySelector<HTMLVideoElement>('div > div > div > div.keyboard-controls.svelte-10kkmxz > div.video-wrapper.svelte-cy741x > div > video')
    if (video)
      return video
  }

  const allElements = document.querySelectorAll('*')
  for (const element of allElements) {
    if (element.shadowRoot) {
      video = element.shadowRoot.querySelector<HTMLVideoElement>('video')
      if (video)
        return video
    }
  }

  return null
}

iframe.on('UpdateData', () => {
  const video = findVideo()
  if (!video || Number.isNaN(video.duration))
    return

  iframe.send({
    iFrameVideoData: {
      currTime: video.currentTime,
      dur: video.duration,
      paused: video.paused || video.ended,
    },
  })
})
