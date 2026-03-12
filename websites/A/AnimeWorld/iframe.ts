const iframe = new iFrame()
let video: HTMLVideoElement | null = null

iframe.on('UpdateData', async () => {
  if (document.querySelector('#video-player')) {
    // AW Server
    video = document.querySelector('#video-player')
    if (video && !Number.isNaN(video.duration)) {
      iframe.send({
        iframeVideo: {
          iFrameVideo: true,
          currTime: video.currentTime,
          duration: video.duration,
          paused: video.paused,
        },
      })
    }
  }

  if (document.querySelector('.jw-media > video')) {
    // Alternative Player or Beta Server & AnaVids
    video = document.querySelector('.jw-media > video')
    if (video && !Number.isNaN(video.duration)) {
      iframe.send({
        iframeVideo: {
          iFrameVideo: true,
          currTime: video.currentTime,
          duration: video.duration,
          paused: video.paused,
        },
      })
    }
  }

  if (document.querySelector('#mainvideo')) {
    // Streamtape
    video = document.querySelector('#mainvideo')
    if (video && !Number.isNaN(video.duration)) {
      iframe.send({
        iframeVideo: {
          iFrameVideo: true,
          currTime: video.currentTime,
          duration: video.duration,
          paused: video.paused,
        },
      })
    }
  }

  if (document.querySelector('#video_player_html5_api')) {
    // DoodStream
    video = document.querySelector('#video_player_html5_api')
    if (video && !Number.isNaN(video.duration)) {
      iframe.send({
        iframeVideo: {
          iFrameVideo: true,
          currTime: video.currentTime,
          duration: video.duration,
          paused: video.paused,
        },
      })
    }
  }

  if (document.querySelector('#videojs_html5_api')) {
    // MixDrop
    video = document.querySelector('#videojs_html5_api')
    if (video && !Number.isNaN(video.duration)) {
      iframe.send({
        iframeVideo: {
          iFrameVideo: true,
          currTime: video.currentTime,
          duration: video.duration,
          paused: video.paused,
        },
      })
    }
  }

  if (document.querySelector('#video_1_html5_api')) {
    // Alpha Server
    video = document.querySelector('#video_1_html5_api')
    if (video && !Number.isNaN(video.duration)) {
      iframe.send({
        iframeVideo: {
          iFrameVideo: true,
          currTime: video.currentTime,
          duration: video.duration,
          paused: video.paused,
        },
      })
    }
  }

  if (document.querySelector('#playerBurdo_html5_api')) {
    // AW Server Alternative
    video = document.querySelector('#playerBurdo_html5_api')
    if (video && !Number.isNaN(video.duration)) {
      iframe.send({
        iframeVideo: {
          iFrameVideo: true,
          currTime: video.currentTime,
          duration: video.duration,
          paused: video.paused,
        },
      })
    }
  }

  if (document.querySelector('#olvideo_html5_api')) {
    // OkStream
    video = document.querySelector('#olvideo_html5_api')
    if (video && !Number.isNaN(video.duration)) {
      iframe.send({
        iframeVideo: {
          iFrameVideo: true,
          currTime: video.currentTime,
          duration: video.duration,
          paused: video.paused,
        },
      })
    }
  }

  if (document.querySelector('.html5-video-container > video')) {
    // YouTube
    video = document.querySelector('.html5-video-container > video')
    if (video && !Number.isNaN(video.duration)) {
      iframe.send({
        iframeVideo: {
          iFrameVideo: true,
          currTime: video.currentTime,
          duration: video.duration,
          paused: video.paused,
        },
      })
    }
  }
})
