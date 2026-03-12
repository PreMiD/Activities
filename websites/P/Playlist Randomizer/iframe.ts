import { getTimestampsFromMedia } from 'premid'

const iframe = new iFrame()

iframe.on('UpdateData', async () => {
  const video = document.querySelector('video')
  if (video) {
    const [startTimestamp, endTimestamp] = getTimestampsFromMedia(video)
    const data: VideoData = {
      startTimestamp,
      endTimestamp,
      paused: video.paused,
      id: document.location.pathname.split('/').filter(Boolean).pop() ?? '',
    }
    iframe.send(data)
  }
})

export interface VideoData {
  startTimestamp: number
  endTimestamp: number
  paused: boolean
  id: string
}
