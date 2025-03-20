// Note: Alternate hosts (openload, streammango) are currently disabled on the site (can't switch to them),
//       if this changes or they switch their main host, this will need to be updated.

const iframe = new iFrame()

let sendback: {
  currentTime: number
  duration: number
  paused: boolean
}

function send(): void {
  iframe.send(sendback)
}

iframe.on('UpdateData', () => {
  if (document.querySelector('#kwikPlayer')) {
    const video = document.querySelector<HTMLVideoElement>('#kwikPlayer')
    if (video) {
      sendback = {
        currentTime: video.currentTime,
        duration: video.duration,
        paused: video.paused,
      }
      send()
    }
  }
})
