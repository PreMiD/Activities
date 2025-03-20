const iframe = new iFrame()

iframe.on('UpdateData', async () => {
  const video = document.querySelector<HTMLVideoElement>('video')
  const audio = document.querySelector<HTMLAudioElement>('audio')
  if (video && !Number.isNaN(video.duration)) {
    iframe.send({
      duration: video.duration,
      currentTime: video.currentTime,
      paused: video.paused,
    })
  }
  else if (audio && !Number.isNaN(audio.duration)) {
    iframe.send({
      duration: audio.duration,
      currentTime: audio.currentTime,
      paused: audio.paused,
    })
  }
  else if (document.location.pathname.startsWith('https://w.soundcloud.com')) {
    iframe.send({
      duration: 0,
      currentTime: 0,
      paused: navigator.mediaSession?.playbackState === 'paused' || navigator.mediaSession?.playbackState === 'none',
    })
  }
})
