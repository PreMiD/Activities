const iframe = new iFrame()
iframe.on('UpdateData', async () => {
  if (document.querySelector('#dogevideo_html5_api')) {
    const video = document.querySelector<HTMLVideoElement>('#dogevideo_html5_api')

    if (video && !Number.isNaN(video.duration)) {
      iframe.send({
        iframeVideo: {
          iFrameVideo: true,
          currTime: video.currentTime,
          dur: video.duration,
          paused: video.paused,
        },
      })
    }
  }
  else if (
    document.querySelector(
      '#player > div > div.container.pointer-enabled > video',
    )
  ) {
    const video = document.querySelector<HTMLVideoElement>(
      '#player > div > div.container.pointer-enabled > video',
    )

    if (video && !Number.isNaN(video.duration)) {
      iframe.send({
        iframeVideo: {
          iFrameVideo: true,
          currTime: video.currentTime,
          dur: video.duration,
          paused: video.paused,
        },
      })
    }
  }
  else if (
    document.querySelector(
      '#mediaplayer > div.jw-wrapper.jw-reset > div.jw-media.jw-reset > video',
    )
  ) {
    const video = document.querySelector<HTMLVideoElement> (
      '#mediaplayer > div.jw-wrapper.jw-reset > div.jw-media.jw-reset > video',
    )

    if (video && !Number.isNaN(video.duration)) {
      iframe.send({
        iframeVideo: {
          iFrameVideo: true,
          currTime: video.currentTime,
          dur: video.duration,
          paused: video.paused,
        },
      })
    }
  }
  else if (document.querySelector('#vid_html5_api')) {
    const video = document.querySelector<HTMLVideoElement>('#vid_html5_api')

    if (video && !Number.isNaN(video.duration)) {
      iframe.send({
        iframeVideo: {
          iFrameVideo: true,
          currTime: video.currentTime,
          dur: video.duration,
          paused: video.paused,
        },
      })
    }
  }
  else if (
    document.querySelector('#myElement > div.jw-media.jw-reset > video')
    !== null
  ) {
    const video = document.querySelector<HTMLVideoElement>(
      '#myElement > div.jw-media.jw-reset > video',
    )

    if (video && !Number.isNaN(video.duration)) {
      iframe.send({
        iframeVideo: {
          iFrameVideo: true,
          currTime: video.currentTime,
          dur: video.duration,
          paused: video.paused,
        },
      })
    }
  }
  else if (document.querySelector('#mgvideo > div.vjs-poster')) {
    const video = document.querySelector<HTMLVideoElement>('#mgvideo > div.vjs-poster')

    if (video && !Number.isNaN(video.duration)) {
      iframe.send({
        iframeVideo: {
          iFrameVideo: true,
          currTime: video.currentTime,
          dur: video.duration,
          paused: video.paused,
        },
      })
    }
  }
  else if (document.querySelector('#olvideo_html5_api')) {
    const video = document.querySelector<HTMLVideoElement>('#olvideo_html5_api')

    if (video && !Number.isNaN(video.duration)) {
      iframe.send({
        iframeVideo: {
          iFrameVideo: true,
          currTime: video.currentTime,
          dur: video.duration,
          paused: video.paused,
        },
      })
    }
  }
  else if (document.querySelector('#videojs_html5_api')) {
    const video = document.querySelector<HTMLVideoElement>('#videojs_html5_api')

    if (video && !Number.isNaN(video.duration)) {
      iframe.send({
        iframeVideo: {
          iFrameVideo: true,
          currTime: video.currentTime,
          dur: video.duration,
          paused: video.paused,
        },
      })
    }
  }
  else if (
    document.querySelector(
      '#myVideo > div.jw-wrapper.jw-reset > div.jw-media.jw-reset > video',
    )
  ) {
    const video = document.querySelector<HTMLVideoElement>(
      '#myVideo > div.jw-wrapper.jw-reset > div.jw-media.jw-reset > video',
    )

    if (video && !Number.isNaN(video.duration)) {
      iframe.send({
        iframeVideo: {
          iFrameVideo: true,
          currTime: video.currentTime,
          dur: video.duration,
          paused: video.paused,
        },
      })
    }
  }
  else if (document.querySelector('#mgvideo_html5_api')) {
    const video = document.querySelector<HTMLVideoElement>('#mgvideo_html5_api')

    if (video && !Number.isNaN(video.duration)) {
      iframe.send({
        iframeVideo: {
          iFrameVideo: true,
          currTime: video.currentTime,
          dur: video.duration,
          paused: video.paused,
        },
      })
    }
  }
  else if (
    document.querySelector('#player > div.jw-media.jw-reset > video')
  ) {
    const video = document.querySelector<HTMLVideoElement>(
      '#player > div.jw-media.jw-reset > video',
    )

    if (video && !Number.isNaN(video.duration)) {
      iframe.send({
        iframeVideo: {
          iFrameVideo: true,
          currTime: video.currentTime,
          dur: video.duration,
          paused: video.paused,
        },
      })
    }
  }
  else if (
    document.querySelector(
      '#vstr > div.jw-wrapper.jw-reset > div.jw-media.jw-reset > video',
    )
  ) {
    const video = document.querySelector<HTMLVideoElement>(
      '#vstr > div.jw-wrapper.jw-reset > div.jw-media.jw-reset > video',
    )

    if (video && !Number.isNaN(video.duration)) {
      iframe.send({
        iframeVideo: {
          iFrameVideo: true,
          currTime: video.currentTime,
          dur: video.duration,
          paused: video.paused,
        },
      })
    }
  }
  else if (
    document.querySelector(
      '#player > div.jw-wrapper.jw-reset > div.jw-media.jw-reset > video',
    )
  ) {
    const video = document.querySelector<HTMLVideoElement>(
      '#player > div.jw-wrapper.jw-reset > div.jw-media.jw-reset > video',
    )

    if (video && !Number.isNaN(video.duration)) {
      iframe.send({
        iframeVideo: {
          iFrameVideo: true,
          currTime: video.currentTime,
          dur: video.duration,
          paused: video.paused,
        },
      })
    }
  }
  else if (document.querySelector('video')) {
    const video = document.querySelector<HTMLVideoElement>('video')

    if (video && !Number.isNaN(video.duration)) {
      iframe.send({
        iframeVideo: {
          iFrameVideo: true,
          currTime: video.currentTime,
          dur: video.duration,
          paused: video.paused,
        },
      })
    }
  }
  else if (document.querySelector('.video')) {
    const video = document.querySelector<HTMLVideoElement>('.video')

    if (video && !Number.isNaN(video.duration)) {
      iframe.send({
        iframeVideo: {
          iFrameVideo: true,
          currTime: video.currentTime,
          dur: video.duration,
          paused: video.paused,
        },
      })
    }
  }
})
