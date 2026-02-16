import { Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1103003257795793018',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.ibb.co/W4j6Q3Tf/favicon-0.png',
  DefaultCover = 'https://anime-365.ru/images/no-image.jpg',
  Home = 'https://anime-365.ru/favicon.ico',
  Catalog = 'https://anime-365.ru/favicon.ico',
}

interface VideoData {
  exists: boolean
  duration?: number
  currentTime?: number
  paused?: boolean
}

interface PageData {
  type: 'home' | 'catalog' | 'anime' | 'watching' | 'search' | 'profile' | 'other'
  animeName?: string
  animeNameEn?: string
  episode?: string
  episodeId?: string
  translationId?: string
  seriesId?: string
  coverUrl?: string
  searchQuery?: string
}

// Переменная для хранения данных из iframe
let iframeVideo: VideoData = { exists: false }

// Слушаем данные из iframe
presence.on('iFrameData', (data: VideoData) => {
  iframeVideo = data
})

/**
 * Парсит информацию о текущей странице на основе URL и содержимого
 */
function getPageData(): PageData {
  const url = document.location.pathname
  const data: PageData = { type: 'other' }
  
  // Анализируем URL для определения типа страницы
  if (url === '/' || url === '/index') {
    data.type = 'home'
  }
  else if (url.includes('/catalog/')) {
    // Проверяем, является ли это страницей просмотра (содержит /1-seriya/ в URL)
    if (url.match(/\/\d+-seriya-\d+\//)) {
      data.type = 'watching'
      
      // Извлекаем ID из URL
      const seriesMatch = url.match(/\/catalog\/([^/]+)/)
      const episodeMatch = url.match(/\/(\d+-seriya-\d+)\//)
      const translationMatch = url.match(/\/ozvuchka-(\d+)/)
      
      if (seriesMatch) data.seriesId = seriesMatch[1]
      if (episodeMatch) data.episodeId = episodeMatch[1]
      if (translationMatch) data.translationId = translationMatch[1]
      
      // Получаем название аниме из заголовка страницы
      const titleElementRu = document.querySelector('h2.line-1 a')
      const titleElementEn = document.querySelector('h2.line-2 a')
      
      if (titleElementRu?.textContent) {
        data.animeName = titleElementRu.textContent.trim()
      }
      if (titleElementEn?.textContent) {
        data.animeNameEn = titleElementEn.textContent.trim()
      }
      
      // Получаем номер серии из заголовка
      const episodeTitle = document.querySelector('.m-translation-view-title h2')
      if (episodeTitle?.textContent) {
        const episodeMatch = episodeTitle.textContent.match(/(\d+)/)
        if (episodeMatch) data.episode = episodeMatch[1]
      }
      
      // Получаем обложку из meta-тега og:image
      const ogImage = document.querySelector('meta[property="og:image"]')
      if (ogImage instanceof HTMLMetaElement) {
        data.coverUrl = ogImage.content
      }
    }
    else {
      // Это страница информации об аниме (не просмотр)
      data.type = 'anime'
      
      // Получаем название аниме
      const titleElementRu = document.querySelector('h2.line-1 a')
      if (titleElementRu?.textContent) {
        data.animeName = titleElementRu.textContent.trim()
      }
      
      // Получаем обложку
      const poster = document.querySelector('.m-catalog-item__poster img')
      if (poster instanceof HTMLImageElement) {
        data.coverUrl = poster.src
      }
    }
  }
  else if (url.includes('/catalog/search')) {
    data.type = 'search'
    
    // Пытаемся найти поисковый запрос
    const searchInput = document.querySelector('input[name="q"]') as HTMLInputElement
    if (searchInput?.value) {
      data.searchQuery = searchInput.value
    }
  }
  else if (url.includes('/users/') && url.includes('/list')) {
    data.type = 'profile'
  }
  
  return data
}

presence.on('UpdateData', async () => {
  // Получаем настройки пользователя
  const [showButtons, showTimestamp, showCover] = await Promise.all([
    presence.getSetting<boolean>('showButtons').catch(() => true),
    presence.getSetting<boolean>('showTimestamp').catch(() => true),
    presence.getSetting<boolean>('showCover').catch(() => true)
  ])
  
  const pageData = getPageData()
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    type: 3, // Watching
  }
  
  // Логика для разных типов страниц
  switch (pageData.type) {
    case 'home':
      presenceData.details = 'На главной странице'
      presenceData.largeImageKey = ActivityAssets.Logo // Добавляем логотип
      presenceData.smallImageKey = Assets.Search
      presenceData.smallImageText = 'Главная'
      if (showTimestamp) presenceData.startTimestamp = browsingTimestamp
      break
      
    case 'catalog':
      presenceData.details = 'Просматривает каталог'
      presenceData.state = 'Ищет аниме'
      presenceData.smallImageKey = Assets.Search // Search есть в Assets
      presenceData.smallImageText = 'Каталог'
      if (showTimestamp) {
        presenceData.startTimestamp = browsingTimestamp
      }
      break
      
    case 'anime':
      presenceData.details = pageData.animeName || 'Страница аниме'
      presenceData.state = 'Читает описание'
      
      if (showCover && pageData.coverUrl) {
        presenceData.largeImageKey = pageData.coverUrl
      }
      
      presenceData.smallImageKey = Assets.Reading // Reading есть в Assets
      presenceData.smallImageText = 'Читает описание'
      
      if (showTimestamp) {
        presenceData.startTimestamp = browsingTimestamp
      }
      
      if (showButtons) {
        presenceData.buttons = [{
          label: 'Смотреть серии',
          url: document.location.href
        }]
      }
      break
      
    case 'watching':
      // Основная информация
      presenceData.details = pageData.animeName || pageData.animeNameEn || 'Смотрит аниме'
      
      if (pageData.episode) {
        presenceData.state = `Серия ${pageData.episode}`
      }
      
      if (showCover && pageData.coverUrl) {
        presenceData.largeImageKey = pageData.coverUrl
      }
      
      // Используем данные из iframe для видео
      if (iframeVideo.exists) {
        if (iframeVideo.paused) {
          presenceData.smallImageKey = Assets.Pause // Pause есть в Assets
          presenceData.smallImageText = 'На паузе'
          // Убираем таймер на паузе
          delete presenceData.startTimestamp
          delete presenceData.endTimestamp
        } else {
          presenceData.smallImageKey = Assets.Play // Play есть в Assets
          presenceData.smallImageText = 'Смотрит'
          
          // Добавляем таймер просмотра, если включено в настройках
          if (showTimestamp && iframeVideo.currentTime && iframeVideo.duration) {
            [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(
              Math.floor(iframeVideo.currentTime),
              Math.floor(iframeVideo.duration)
            )
          }
        }
      } else {
        // Если iframe не дал данных, показываем статику
        presenceData.smallImageKey = Assets.Play // Play есть в Assets
        presenceData.smallImageText = 'Смотрит'
        // Убираем таймер, так как нет данных
        delete presenceData.startTimestamp
        delete presenceData.endTimestamp
      }
      
      // Кнопка для просмотра
      if (showButtons) {
        presenceData.buttons = [{
          label: 'Смотреть',
          url: document.location.href
        }]
      }
      break
      
    case 'search':
      presenceData.details = 'Ищет аниме'
      if (pageData.searchQuery) {
        presenceData.state = `"${pageData.searchQuery}"`
      } else {
        presenceData.state = 'Вводит запрос'
      }
      presenceData.smallImageKey = Assets.Search // Search есть в Assets
      presenceData.smallImageText = 'Поиск'
      if (showTimestamp) {
        presenceData.startTimestamp = browsingTimestamp
      }
      break
      
    case 'profile':
      presenceData.details = 'Просматривает профиль'
      presenceData.state = 'Свой список аниме'
      presenceData.smallImageKey = Assets.Reading // Reading есть в Assets
      presenceData.smallImageText = 'Список'
      if (showTimestamp) {
        presenceData.startTimestamp = browsingTimestamp
      }
      break
      
    default:
      presenceData.details = 'На сайте anime-365'
      presenceData.smallImageKey = ActivityAssets.Logo // используем логотип
      presenceData.smallImageText = 'На сайте'
      if (showTimestamp) {
        presenceData.startTimestamp = browsingTimestamp
      }
  }
  
  // Устанавливаем активность
  presence.setActivity(presenceData)
})