const iframe = new iFrame()

iframe.on('UpdateData', async () => {
  const video = document.querySelector('video')
  const audio = document.querySelector('audio')

  if (video && !Number.isNaN(video.duration)) {
    iframe.send({
      iFrameVideoData: {
        currTime: video.currentTime,
        dur: video.duration,
        paused: video.paused,
      },
    })
  }
  else if (audio && !Number.isNaN(audio.duration)) {
    iframe.send({
      iFrameAudioData: {
        currTime: audio.currentTime,
        dur: audio.duration,
        paused: audio.paused,
      },
    })
  }
})
