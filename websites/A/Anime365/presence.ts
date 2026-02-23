import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1103003257795793018',
})

// Timestamp when user started browsing (used for non-video pages)
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/A/Anime365/assets/logo.png',
}

// Video data received from iframe (embedded player)
interface VideoData {
  exists: boolean
  duration?: number
  currentTime?: number
  paused?: boolean
}

// Page data parsed from URL and DOM
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

// Store latest video data from iframe
let iframeVideo: VideoData = { exists: false }

// Listen for data from iframe.ts (video player)
presence.on('iFrameData', (data: VideoData) => {
  iframeVideo = data
})

/**
 * Removes "watch online" span from anime title
 * Site adds <span class="online-h">смотреть онлайн</span> to titles
 */
function getCleanAnimeTitle(): string | undefined {
  const titleElement = document.querySelector('h2.line-1')
  if (!titleElement)
    return undefined

  // Clone to avoid modifying actual DOM
  const clone = titleElement.cloneNode(true) as HTMLElement
  // Remove all "watch online" spans
  clone.querySelectorAll('.online-h').forEach(el => el.remove())

  return clone.textContent?.trim() || undefined
}

/**
 * Gets the anime cover URL from the poster element - ONLY for anime pages
 */
function getAnimeCoverUrl(): string | undefined {
  // Only try to get cover if we're on an anime-related page
  const url = document.location.pathname
  if (!url.includes('/catalog/'))
    return undefined

  const poster = document.querySelector<HTMLImageElement>('.m-catalog-item__poster img')
  if (poster?.src)
    return poster.src

  // Fallback to og:image if poster not found (only on anime pages)
  const ogImage = document.querySelector<HTMLMetaElement>('meta[property="og:image"]')
  if (ogImage?.content && url.includes('/catalog/'))
    return ogImage.content

  return undefined
}

/**
 * Determines page type and extracts relevant data from URL and DOM
 */
function getPageData(): PageData {
  const url = document.location.pathname
  const data: PageData = { type: 'other' }

  // Homepage
  if (url === '/' || url === '/index') {
    data.type = 'home'
  }
  // All anime-related pages are under /catalog/
  else if (url.includes('/catalog/')) {
    // Try to get anime cover (only for anime pages)
    const coverUrl = getAnimeCoverUrl()
    if (coverUrl)
      data.coverUrl = coverUrl

    // Check if this is a video watching page (contains pattern like /1-seriya-9604/)
    if (url.match(/\/\d+-seriya-\d+\//)) {
      data.type = 'watching'

      // Extract IDs from URL for potential future use
      const seriesMatch = url.match(/\/catalog\/([^/]+)/)
      const episodeMatch = url.match(/\/(\d+-seriya-\d+)\//)
      const translationMatch = url.match(/\/ozvuchka-(\d+)/)

      if (seriesMatch)
        data.seriesId = seriesMatch[1]
      if (episodeMatch)
        data.episodeId = episodeMatch[1]
      if (translationMatch)
        data.translationId = translationMatch[1]

      // Get clean anime title (without "watch online")
      data.animeName = getCleanAnimeTitle()

      // Get English/original title if available
      const titleElementEn = document.querySelector<HTMLAnchorElement>('h2.line-2 a')
      if (titleElementEn?.textContent) {
        data.animeNameEn = titleElementEn.textContent.trim()
      }

      // Extract episode number from episode title
      const episodeTitle = document.querySelector<HTMLHeadingElement>('.m-translation-view-title h2')
      if (episodeTitle?.textContent) {
        const episodeMatch = episodeTitle.textContent.match(/(\d+)/)
        if (episodeMatch)
          data.episode = episodeMatch[1]
      }
    }
    else {
      // This is an anime information page (not watching)
      data.type = 'anime'

      // Get anime title
      data.animeName = getCleanAnimeTitle()
    }
  }
  // Search page
  else if (url.includes('/catalog/search')) {
    data.type = 'search'

    // Get current search query from input field
    const searchInput = document.querySelector<HTMLInputElement>('input[name="q"]')
    if (searchInput?.value) {
      data.searchQuery = searchInput.value
    }
  }
  // User profile page with anime list
  else if (url.includes('/users/') && url.includes('/list')) {
    data.type = 'profile'
  }

  return data
}

// Main update loop - runs every few seconds
presence.on('UpdateData', async () => {
  // Get user settings from metadata.json
  const [showButtons, showTimestamp, showCover] = await Promise.all([
    presence.getSetting<boolean>('showButtons').catch(() => true),
    presence.getSetting<boolean>('showTimestamp').catch(() => true),
    presence.getSetting<boolean>('showCover').catch(() => true),
  ])

  const pageData = getPageData()
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo, // Default to logo
    type: ActivityType.Watching,
  }

  // Use anime cover ONLY on anime-related pages and if enabled
  if (showCover && (pageData.type === 'anime' || pageData.type === 'watching')) {
    if (pageData.coverUrl && pageData.coverUrl !== ActivityAssets.Logo) {
      presenceData.largeImageKey = pageData.coverUrl
    }
  }

  // Set presence data based on page type
  switch (pageData.type) {
    case 'home':
      presenceData.details = 'On the homepage'
      presenceData.state = 'Browsing new releases'
      presenceData.smallImageKey = Assets.Search
      presenceData.smallImageText = 'Homepage'
      if (showTimestamp)
        presenceData.startTimestamp = browsingTimestamp
      break

    case 'catalog':
      presenceData.details = 'Browsing catalog'
      presenceData.state = 'Looking for anime'
      presenceData.smallImageKey = Assets.Search
      presenceData.smallImageText = 'Catalog'
      if (showTimestamp)
        presenceData.startTimestamp = browsingTimestamp
      break

    case 'anime':
      presenceData.details = pageData.animeName || 'Anime page'
      presenceData.state = 'Reading description'

      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = 'Reading description'

      if (showTimestamp)
        presenceData.startTimestamp = browsingTimestamp

      if (showButtons) {
        presenceData.buttons = [{
          label: 'Watch episodes',
          url: document.location.href,
        }]
      }
      break

    case 'watching':
      // Main video watching page
      presenceData.details = pageData.animeName || pageData.animeNameEn || 'Watching anime'

      if (pageData.episode) {
        presenceData.state = `Episode ${pageData.episode}`
      }

      // Use iframe data for play/pause and timestamps
      if (iframeVideo.exists) {
        if (iframeVideo.paused) {
          presenceData.smallImageKey = Assets.Pause
          presenceData.smallImageText = 'Paused'
          // Remove timestamps when paused
          delete presenceData.startTimestamp
          delete presenceData.endTimestamp
        }
        else {
          presenceData.smallImageKey = Assets.Play
          presenceData.smallImageText = 'Watching'

          // Add timestamps if enabled
          if (showTimestamp && iframeVideo.currentTime && iframeVideo.duration) {
            [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(
              Math.floor(iframeVideo.currentTime),
              Math.floor(iframeVideo.duration),
            )
          }
        }
      }
      else {
        // Fallback if iframe data not available
        presenceData.smallImageKey = Assets.Play
        presenceData.smallImageText = 'Watching'
        delete presenceData.startTimestamp
        delete presenceData.endTimestamp
      }

      if (showButtons) {
        presenceData.buttons = [{
          label: 'Watch',
          url: document.location.href,
        }]
      }
      break

    case 'search':
      presenceData.details = 'Searching for anime'
      if (pageData.searchQuery) {
        presenceData.state = `"${pageData.searchQuery}"`
      }
      else {
        presenceData.state = 'Entering query'
      }
      presenceData.smallImageKey = Assets.Search
      presenceData.smallImageText = 'Search'
      if (showTimestamp)
        presenceData.startTimestamp = browsingTimestamp
      break

    case 'profile':
      presenceData.details = 'Viewing profile'
      presenceData.state = 'Their anime list'
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = 'List'
      if (showTimestamp)
        presenceData.startTimestamp = browsingTimestamp
      break

    default:
      // Unknown/other pages
      presenceData.details = 'On website'
      presenceData.state = 'Exploring content'
      presenceData.smallImageKey = ActivityAssets.Logo
      presenceData.smallImageText = 'On website'
      if (showTimestamp)
        presenceData.startTimestamp = browsingTimestamp
  }

  presence.setActivity(presenceData)
})
