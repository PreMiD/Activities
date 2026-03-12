const sezonlukDiziIframe = new iFrame()

sezonlukDiziIframe.on('UpdateData', () => {
  const video = document.querySelector('video')

  if (video && !Number.isNaN(video.duration)) {
    sezonlukDiziIframe.send({
      duration: video.duration,
      currentTime: video.currentTime,
      paused: video.paused,
    })
  }
})
