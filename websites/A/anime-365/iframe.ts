const iframe = new iFrame()

// Video data structure sent to presence.ts
interface VideoData {
  exists: boolean
  duration?: number
  currentTime?: number
  paused?: boolean
}

// Update data every tick (approximately every 100ms)
iframe.on('UpdateData', async () => {
  // Find video element in the iframe
  const video = document.querySelector('video')
  const videoData: VideoData = { exists: false }

  // Check if video exists and has metadata loaded
  if (video && video.readyState >= 1) {
    videoData.exists = true
    videoData.duration = video.duration
    videoData.currentTime = video.currentTime
    videoData.paused = video.paused

    // Send data to main presence
    iframe.send(videoData)
  }
  else {
    // No video or not ready
    iframe.send({ exists: false })
  }
})
