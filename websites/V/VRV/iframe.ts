const iframe = new iFrame()
iframe.on('UpdateData', async () => {
  const video = document.querySelector<HTMLVideoElement>('#dogevideo_html5_api')
    ?? document.querySelector<HTMLVideoElement>('#video-player')
    ?? document.querySelector<HTMLVideoElement>(
      '#player > div > div.container.pointer-enabled > video',
    )
    ?? document.querySelector<HTMLVideoElement>('#player_html5_api')
    ?? document.querySelector<HTMLVideoElement>(
      '#mediaplayer > div.jw-wrapper.jw-reset > div.jw-media.jw-reset > video',
    )
    ?? document.querySelector<HTMLVideoElement>('#vid_html5_api')
    ?? document.querySelector<HTMLVideoElement>('#myElement > div.jw-media.jw-reset > video')
    ?? document.querySelector<HTMLVideoElement>('#mgvideo > div.vjs-poster')
    ?? document.querySelector<HTMLVideoElement>('#olvideo_html5_api')
    ?? document.querySelector<HTMLVideoElement>('#videojs_html5_api')
    ?? document.querySelector<HTMLVideoElement>(
      '#myVideo > div.jw-wrapper.jw-reset > div.jw-media.jw-reset > video',
    )
    ?? document.querySelector<HTMLVideoElement>('#mgvideo_html5_api')
    ?? document.querySelector<HTMLVideoElement>('#player > div.jw-media.jw-reset > video')
    ?? document.querySelector<HTMLVideoElement>(
      '#vstr > div.jw-wrapper.jw-reset > div.jw-media.jw-reset > video',
    )
    ?? document.querySelector<HTMLVideoElement>('.video')
    ?? document.querySelector<HTMLVideoElement>('video')

  if (video && !Number.isNaN(video.duration)) {
    iframe.send({
      iframeVideo: {
        iFrameVideo: true,
        currentTime: video.currentTime,
        duration: video.duration,
        paused: video.paused,
      },
    })
  }
})
