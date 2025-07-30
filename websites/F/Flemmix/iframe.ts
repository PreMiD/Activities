declare const iFrame: any

const iFrameHandler = new iFrame()

iFrameHandler.on('UpdateData', async () => {
  const video = document.querySelector<HTMLVideoElement>('video')
  if (video && !Number.isNaN(video.duration)) {
    // On utilise notre nouvelle variable ici
    iFrameHandler.send({
      currentTime: video.currentTime,
      duration: video.duration,
      paused: video.paused,
    })
  }
})
