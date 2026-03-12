const iframe = new iFrame()
let video: HTMLVideoElement | null = null

iframe.on('UpdateData', async () => {
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
          reproductor: 'Streamtape',
        },
      })
    }
  }
  if (document.querySelector('.jw-media > video')) {
    // Generic
    video = document.querySelector('.jw-media > video')
    if (video && !Number.isNaN(video.duration)) {
      iframe.send({
        iframeVideo: {
          iFrameVideo: true,
          currTime: video.currentTime,
          duration: video.duration,
          paused: video.paused,
          reproductor: 'un reproductor genérico',
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
          reproductor: 'Drive',
        },
      })
    }
  }
})
