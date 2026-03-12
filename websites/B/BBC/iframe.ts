const iframe = new iFrame()

iframe.on('UpdateData', async () => {
  const video = document.querySelector<HTMLVideoElement>('#p_v_player_0')
  const audio = document.querySelector<HTMLAudioElement>('#p_a_player_0')

  if (video && !Number.isNaN(video.duration)) {
    iframe.send({
      video: {
        currentTime: video.currentTime,
        duration: video.duration,
        paused: video.paused,
      },
    })
  }
  else if (audio && !Number.isNaN(audio.duration)) {
    iframe.send({
      audio: {
        currentTime: audio.currentTime,
        duration: audio.duration,
        paused: audio.paused,
        title: audio.title,
      },
    })
  }
})
