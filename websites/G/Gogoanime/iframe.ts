const iframe = new iFrame()

iframe.on('UpdateData', async () => {
  const videoInfos = document.querySelector<HTMLVideoElement>('video')
    ?? document.querySelector<HTMLVideoElement>('[class*="jw-video]')
  const dur = document.querySelector('[jw-text-duration]')
  if (videoInfos && !Number.isNaN(videoInfos.duration)) {
    iframe.send({
      iframeVideo: {
        version: 0,
        currentTime: videoInfos.currentTime,
        duration: videoInfos.duration,
        paused: videoInfos.paused,
      },
    })
  }
  else if (!videoInfos && dur) {
    iframe.send({
      iframeVideo: {
        version: 1,
        currentTime2: document.querySelector('[class*=\'jw-text-elapsed\']')
          ?.textContent,
        duration2: dur.textContent,
        paused: !!document
          .querySelector('[id="mediaplayer"]')
          ?.className
          ?.toLowerCase()
          .includes('-paused'),
      },
    })
  }
})
