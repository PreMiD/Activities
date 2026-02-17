import { Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1103003257795793018',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://ltdfoto.ru/images/2026/02/17/anime-365.png',
  DefaultCover = 'https://ltdfoto.ru/images/2026/02/17/anime-365.png',
}

enum ActivityType {
  Watching = 3,
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

// Variable to store data from iframe
let iframeVideo: VideoData = { exists: false }

// Listen for data from iframe
presence.on('iFrameData', (data: VideoData) => {
  iframeVideo = data
})

/**
 * Gets clean anime title without "watch online" text
 */
function getCleanAnimeTitle(): string | undefined {
  const titleElement = document.querySelector('h2.line-1')
  if (!titleElement) return undefined
  
  // Clone to avoid modifying the actual DOM
  const clone = titleElement.cloneNode(true) as HTMLElement
  // Remove all elements with class 'online-h'
  clone.querySelectorAll('.online-h').forEach(el => el.remove())
  
  return clone.textContent?.trim() || undefined
}

/**
 * Parses page information based on URL and content
 */
function getPageData(): PageData {
  const url = document.location.pathname
  const data: PageData = { type: 'other' }
  
  // Analyze URL to determine page type
  if (url === '/' || url === '/index') {
    data.type = 'home'
  }
  else if (url.includes('/catalog/')) {
    // Check if this is a video watching page (contains /1-seriya/ in URL)
    if (url.match(/\/\d+-seriya-\d+\//)) {
      data.type = 'watching'
      
      // Extract IDs from URL
      const seriesMatch = url.match(/\/catalog\/([^/]+)/)
      const episodeMatch = url.match(/\/(\d+-seriya-\d+)\//)
      const translationMatch = url.match(/\/ozvuchka-(\d+)/)
      
      if (seriesMatch) data.seriesId = seriesMatch[1]
      if (episodeMatch) data.episodeId = episodeMatch[1]
      if (translationMatch) data.translationId = translationMatch[1]
      
      // Get clean anime title
      data.animeName = getCleanAnimeTitle()
      
      // Get English title if available
      const titleElementEn = document.querySelector<HTMLAnchorElement>('h2.line-2 a')
      if (titleElementEn?.textContent) {
        data.animeNameEn = titleElementEn.textContent.trim()
      }
      
      // Get episode number from title
      const episodeTitle = document.querySelector<HTMLHeadingElement>('.m-translation-view-title h2')
      if (episodeTitle?.textContent) {
        const episodeMatch = episodeTitle.textContent.match(/(\d+)/)
        if (episodeMatch) data.episode = episodeMatch[1]
      }
      
      // Get cover image from og:image meta tag
      const ogImage = document.querySelector<HTMLMetaElement>('meta[property="og:image"]')
      if (ogImage) {
        data.coverUrl = ogImage.content
      }
    }
    else {
      // This is an anime information page (not watching)
      data.type = 'anime'
      
      // Get clean anime title
      data.animeName = getCleanAnimeTitle()
      
      // Get cover image
      const poster = document.querySelector<HTMLImageElement>('.m-catalog-item__poster img')
      if (poster) {
        data.coverUrl = poster.src
      }
    }
  }
  else if (url.includes('/catalog/search')) {
    data.type = 'search'
    
    // Try to find search query
    const searchInput = document.querySelector<HTMLInputElement>('input[name="q"]')
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
  // Get user settings
  const [showButtons, showTimestamp, showCover] = await Promise.all([
    presence.getSetting<boolean>('showButtons').catch(() => true),
    presence.getSetting<boolean>('showTimestamp').catch(() => true),
    presence.getSetting<boolean>('showCover').catch(() => true)
  ])
  
  const pageData = getPageData()
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    type: ActivityType.Watching,
  }
  
  // Logic for different page types
  switch (pageData.type) {
    case 'home':
      presenceData.details = 'On the homepage'
      presenceData.state = 'Browsing new releases'
      presenceData.largeImageKey = ActivityAssets.Logo
      presenceData.smallImageKey = Assets.Search
      presenceData.smallImageText = 'Homepage'
      if (showTimestamp) presenceData.startTimestamp = browsingTimestamp
      break
      
    case 'catalog':
      presenceData.details = 'Browsing catalog'
      presenceData.state = 'Looking for anime'
      presenceData.smallImageKey = Assets.Search
      presenceData.smallImageText = 'Catalog'
      if (showTimestamp) {
        presenceData.startTimestamp = browsingTimestamp
      }
      break
      
    case 'anime':
      presenceData.details = pageData.animeName || 'Anime page'
      presenceData.state = 'Reading description'
      
      if (showCover && pageData.coverUrl && pageData.coverUrl !== ActivityAssets.DefaultCover) {
        presenceData.largeImageKey = pageData.coverUrl
      }
      
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = 'Reading description'
      
      if (showTimestamp) {
        presenceData.startTimestamp = browsingTimestamp
      }
      
      if (showButtons) {
        presenceData.buttons = [{
          label: 'Watch episodes',
          url: document.location.href
        }]
      }
      break
      
    case 'watching':
      // Main information
      presenceData.details = pageData.animeName || pageData.animeNameEn || 'Watching anime'
      
      if (pageData.episode) {
        presenceData.state = `Episode ${pageData.episode}`
      }
      
      if (showCover && pageData.coverUrl && pageData.coverUrl !== ActivityAssets.DefaultCover) {
        presenceData.largeImageKey = pageData.coverUrl
      }
      
      // Use data from iframe for video
      if (iframeVideo.exists) {
        if (iframeVideo.paused) {
          presenceData.smallImageKey = Assets.Pause
          presenceData.smallImageText = 'Paused'
          // Remove timer on pause
          delete presenceData.startTimestamp
          delete presenceData.endTimestamp
        } else {
          presenceData.smallImageKey = Assets.Play
          presenceData.smallImageText = 'Watching'
          
          // Add timer if enabled in settings
          if (showTimestamp && iframeVideo.currentTime && iframeVideo.duration) {
            [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(
              Math.floor(iframeVideo.currentTime),
              Math.floor(iframeVideo.duration)
            )
          }
        }
      } else {
        // If no iframe data, show static
        presenceData.smallImageKey = Assets.Play
        presenceData.smallImageText = 'Watching'
        // Remove timer as no data
        delete presenceData.startTimestamp
        delete presenceData.endTimestamp
      }
      
      // Watch button
      if (showButtons) {
        presenceData.buttons = [{
          label: 'Watch',
          url: document.location.href
        }]
      }
      break
      
    case 'search':
      presenceData.details = 'Searching for anime'
      if (pageData.searchQuery) {
        presenceData.state = `"${pageData.searchQuery}"`
      } else {
        presenceData.state = 'Entering query'
      }
      presenceData.smallImageKey = Assets.Search
      presenceData.smallImageText = 'Search'
      if (showTimestamp) {
        presenceData.startTimestamp = browsingTimestamp
      }
      break
      
    case 'profile':
      presenceData.details = 'Viewing profile'
      presenceData.state = 'Their anime list'
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = 'List'
      if (showTimestamp) {
        presenceData.startTimestamp = browsingTimestamp
      }
      break
      
    default:
      presenceData.details = 'On anime-365 website'
      presenceData.state = 'Exploring content'
      presenceData.smallImageKey = ActivityAssets.Logo
      presenceData.smallImageText = 'On website'
      if (showTimestamp) {
        presenceData.startTimestamp = browsingTimestamp
      }
  }
  
  // Set activity
  presence.setActivity(presenceData)
})