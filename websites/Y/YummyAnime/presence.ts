import { ActivityType } from 'premid'

const presence = new Presence({
  clientId: '1045800378228281345',
})

let videoData = {
  duration: 0,
  currentTime: 0,
  paused: true,
  hasData: false,
}

presence.on('iFrameData', (data: any) => {
  videoData = { ...data, hasData: true }
})

presence.on('UpdateData', async () => {
  const { pathname } = document.location

  const presenceData: any = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/Y/YummyAnime/assets/logo.jpeg',
    largeImageText: 'YummyAnime',
    type: ActivityType.Watching,
  }

  if (pathname === '/' || pathname === '/index.html') {
    presenceData.details = 'На главной странице'
    presenceData.state = 'Выбирает аниме'
    presence.setActivity(presenceData)
    return
  }

  const isAnimePage = document.querySelector('.poster-block')

  if (!isAnimePage) {
    presenceData.details = 'На сайте YummyAnime'

    const pageTitle = document.querySelector('h1')?.textContent?.trim()

    if (pageTitle) {
      presenceData.state = pageTitle
    }
    else {
      delete presenceData.state
    }

    delete presenceData.startTimestamp
    delete presenceData.endTimestamp

    presence.setActivity(presenceData)
    return
  }

  const titleHeader = document.querySelector('h1')
  if (titleHeader) {
    presenceData.details = titleHeader.textContent?.trim()
  }
  else {
    presenceData.details = 'Смотрит аниме'
  }

  const posterImg = document.querySelector(
    'div.poster-block img',
  ) as HTMLImageElement
  if (posterImg && posterImg.src) {
    if (posterImg.src.startsWith('//')) {
      presenceData.largeImageKey = `https:${posterImg.getAttribute('src')}`
    }
    else if (posterImg.src.startsWith('/')) {
      presenceData.largeImageKey = `https://site.yummyani.me${posterImg.getAttribute('src')}`
    }
    else {
      presenceData.largeImageKey = posterImg.src
    }
  }

  const activeBtn = document.querySelector('div[class*="pQCG"]')
  let currentEpisode = ''
  if (activeBtn) {
    const text = activeBtn.textContent?.trim()
    if (text && !Number.isNaN(Number(text)))
      currentEpisode = text
  }

  if (videoData.hasData) {
    if (!videoData.paused) {
      // === PLAY ===
      presenceData.state = currentEpisode
        ? `Смотрит серию: ${currentEpisode}`
        : 'Смотрит видео'

      const now = Date.now()
      const remainingMs = (videoData.duration - videoData.currentTime) * 1000

      presenceData.endTimestamp = now + remainingMs

      delete presenceData.startTimestamp
    }
    else {
      presenceData.state = currentEpisode
        ? `Серия ${currentEpisode} (Пауза)`
        : 'На паузе'

      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
    }
  }
  else {
    const videoElement = document.querySelector('#video')
    let isWatchingBlock = false

    if (videoElement) {
      const rect = videoElement.getBoundingClientRect()
      const viewHeight = Math.max(
        document.documentElement.clientHeight,
        window.innerHeight,
      )
      if (!(rect.bottom < 0 || rect.top - viewHeight >= 0))
        isWatchingBlock = true
    }

    if (currentEpisode && isWatchingBlock) {
      presenceData.state = `Готовится к просмотру: ${currentEpisode}`
    }
    else {
      presenceData.state = 'Читает описание'
    }

    delete presenceData.startTimestamp
    delete presenceData.endTimestamp
  }

  presence.setActivity(presenceData)
})
