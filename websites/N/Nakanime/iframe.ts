import { getTimestampsFromMedia } from 'premid'

const iframe = new iFrame()

iframe.on('UpdateData', () => {
  const video = document.querySelector('video')

  if (!video || !Number.isFinite(video.duration) || video.duration <= 0) {
    iframe.send({
      video: null,
    })
    return
  }

  const [startTimestamp, endTimestamp] = getTimestampsFromMedia(video)

  iframe.send({
    video: {
      paused: video.paused,
      startTimestamp,
      endTimestamp,
    },
  })
})
