const presence = new Presence({
  clientId: '1436302398518984774',
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    details: 'Где-то на сайте',
    largeImageKey: 'https://i.imgur.com/NfCVjvl.png',
  }
  
  const path = document.location.pathname
  const host = document.location.hostname

  if (path === '/' || path === '/index.html') {
    presenceData.details = 'На главной странице'
    presence.setActivity(presenceData)
    return
  }

  if (path === '/filmy/' || path === '/filmy') {
    presenceData.details = 'Просматривает каталог'
    presenceData.state = 'Фильмы'
    presence.setActivity(presenceData)
    return
  }
  if (path === '/serialy/' || path === '/serialy') {
    presenceData.details = 'Просматривает каталог'
    presenceData.state = 'Сериалы'
    presence.setActivity(presenceData)
    return
  }
  if (path === '/anime/' || path === '/anime') {
    presenceData.details = 'Просматривает каталог'
    presenceData.state = 'Аниме'
    presence.setActivity(presenceData)
    return
  }
  if (path === '/recommended/' || path === '/recommended') {
    presenceData.details = 'Просматривает рекомендации'
    presence.setActivity(presenceData)
    return
  }
  if (path === '/top-filmy/' || path === '/top-filmy') {
    presenceData.details = 'Просматривает топ фильмов'
    presence.setActivity(presenceData)
    return
  }
  if (path === '/v1new/' || path === '/v1new') {
    presenceData.details = 'Просматривает новинки'
    presence.setActivity(presenceData)
    return
  }

  if (path.includes('/search') || document.location.search.includes('do=search')) {
    presenceData.details = 'Использует поиск'
    const searchQuery = new URLSearchParams(document.location.search).get('story')
    if (searchQuery)
      presenceData.state = `Ищет: ${searchQuery}`
    presence.setActivity(presenceData)
    return
  }

  if (path.match(/\/\d+-.*\.html/)) {
    const title = document.querySelector('h1')?.textContent?.trim() || ''
    
    const posterImg = document.querySelector<HTMLImageElement>('img[src*="/uploads/mini/minifull/"]')
    const poster = posterImg?.src || ''
    
    let currentType = 'фильм'
    const metaKeywords = document.querySelector('meta[name="keywords"]')?.getAttribute('content')?.toLowerCase() || ''
    
    if (metaKeywords.includes('сериал'))
      currentType = 'сериал'
    else if (metaKeywords.includes('аниме'))
      currentType = 'аниме'
    else if (metaKeywords.includes('мультфильм'))
      currentType = 'мультфильм'
    
    const videoPlayer = document.querySelector('iframe[src*="embed"], .video-container')
    const videoElement = document.querySelector('video')
    const isWatching = !!videoPlayer
    
    if (title) {
      presenceData.details = isWatching ? `Смотрит ${currentType}` : `Просматривает ${currentType}`
      presenceData.state = title
      
      if (videoElement && !videoElement.paused && videoElement.duration > 0) {
        const currentTime = videoElement.currentTime
        const duration = videoElement.duration
        const timestamps = presence.getTimestampsfromMedia(videoElement)
        
        presenceData.startTimestamp = timestamps[0]
        presenceData.endTimestamp = timestamps[1]
        
        const progress = Math.floor((currentTime / duration) * 100)
        presenceData.state = `${title} (${progress}%)`
        
        presenceData.smallImageKey = 'https://i.imgur.com/urD5Yy3.png'
        presenceData.smallImageText = 'Воспроизведение'
      }
      else if (videoElement && videoElement.paused) {
        presenceData.smallImageKey = 'https://i.imgur.com/IPENKSv.png'
        presenceData.smallImageText = 'На паузе'
      }
      
      if (poster)
        presenceData.largeImageKey = poster
      
      presenceData.buttons = [
        {
          label: 'Открыть страницу',
          url: document.location.href,
        },
      ]
    }
  }

  presence.setActivity(presenceData)
})
