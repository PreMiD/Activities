const iframe = new iFrame()
iframe.on('UpdateData', async () => {
  const { hostname } = window.location
  if (
    hostname === 'voe.sx'
    || hostname === 'streamtape.com'
    || hostname === 'playtube.ws'
    || hostname === 'vidoza.net'
    || hostname === 'strcloud.link'
    || hostname === 'ninjastream.to'
  ) {
    const video = document.querySelector('video')
    if (video) {
      iframe.send({
        currentTime: video.currentTime,
        timeEnd: video.duration,
        paused: video.paused,
        played: video.currentTime !== 0,
      })
    }
  }
})
