import { getTimestampsFromMedia } from 'premid'

const iframe = new iFrame()

export interface FrameData {
  paused: boolean
  startTimestamp: number
  endTimestamp: number
}

iframe.on('UpdateData', () => {
  const video = document.querySelector('video')
  if (video) {
    const [startTimestamp, endTimestamp] = getTimestampsFromMedia(video)
    iframe.send({
      paused: video.paused,
      startTimestamp,
      endTimestamp,
    })
  }
  else {
    iframe.send(null)
  }
})
