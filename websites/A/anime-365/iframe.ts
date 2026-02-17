const iframe = new iFrame()

interface VideoData {
  exists: boolean
  duration?: number
  currentTime?: number
  paused?: boolean
}

iframe.on('UpdateData', async () => {
  // Try to find video in various players
  const video = document.querySelector('video')
  const videoData: VideoData = { exists: false }

  if (video && video.readyState >= 1) {
    videoData.exists = true
    videoData.duration = video.duration
    videoData.currentTime = video.currentTime
    videoData.paused = video.paused

    // Send data to main script
    iframe.send(videoData)
  } else {
    // No video found
    iframe.send({ exists: false })
  }
})
