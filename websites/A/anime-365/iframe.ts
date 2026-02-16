const iframe = new iFrame()

interface VideoData {
  exists: boolean
  duration?: number
  currentTime?: number
  paused?: boolean
}

iframe.on('UpdateData', async () => {
  // Пробуем найти видео в разных плеерах
  const video = document.querySelector('video')
  const videoData: VideoData = { exists: false }
  
  if (video && video.readyState >= 1) {
    videoData.exists = true
    videoData.duration = video.duration
    videoData.currentTime = video.currentTime
    videoData.paused = video.paused
    
    // Отправляем данные в основной скрипт
    iframe.send(videoData)
  } else {
    // Если видео нет, отправляем пустые данные
    iframe.send({ exists: false })
  }
})