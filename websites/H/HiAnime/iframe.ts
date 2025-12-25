import { getTimestamps } from 'premid'

const iframe = new iFrame()

iframe.on('UpdateData', async () => {
  // Get the video element
  const video = document.querySelector('video')

  if (video) {
    // Send video information to the presence script
    iframe.send({
      video: {
        paused: video.paused,
        currentTime: video.currentTime,
        duration: video.duration,
        title: document.querySelector('.video-title')?.textContent
      }
    })
  }
})