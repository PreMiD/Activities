const iframe = new iFrame()

let sendback: {
  audio: boolean
  currentTime: number
  duration: number
  paused: boolean
  site: string
}

function send(): void {
  iframe.send(sendback)
}

iframe.on('UpdateData', () => {
  const video = document.querySelector('video')
  if (video) {
    sendback = {
      audio: false,
      currentTime: video.currentTime,
      duration: video.duration,
      paused: video.paused,
      site: document.location.href,
    }
  }
  send()
})
