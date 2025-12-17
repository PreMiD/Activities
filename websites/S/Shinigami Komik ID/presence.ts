/**
 * Shinigami Komik ID Presence
 * Displays user activity when browsing Shinigami Komik ID manga website
 */

import { ActivityType, StatusDisplayType } from 'premid'

// Initialize presence with client ID
const presence = new Presence({
  clientId: '503557087041683458',
})

// Store browsing start timestamp
const browsingTimestamp = Math.floor(Date.now() / 1000)

// Default logo URL for Shinigami Komik ID
const SHINIGAMI_KOMIK_ID_LOGO = 'https://i.postimg.cc/4ySd7DXp/unnamed.jpg'

/**
 * Interface for Manga API response from api.shngm.io
 * Contains manga details including title, cover images, taxonomy, and chapter info
 */
interface MangaApiResponse {
  retcode: number
  message: string
  data: {
    manga_id: string
    title: string
    description: string
    cover_image_url: string
    cover_portrait_url: string
    taxonomy: {
      Format: Array<{
        slug: string
        name: string
      }>
      Genre: Array<{
        slug: string
        name: string
      }>
    }
    latest_chapter_number: number
  }
}

/**
 * Interface for Chapter API response from api.shngm.io
 * Contains chapter details including chapter number, images, and navigation info
 */
interface ChapterApiResponse {
  retcode: number
  message: string
  data: {
    chapter_id: string
    manga_id: string
    chapter_number: number
    chapter_title: string
    base_url: string
    base_url_low: string
    chapter: {
      path: string
      data: string[]
    }
    thumbnail_image_url: string
    view_count: number
    prev_chapter_id: string | null
    prev_chapter_number: number | null
    next_chapter_id: string | null
    next_chapter_number: number | null
    release_date: string
    created_at: string
    updated_at: string
  }
}

// Cache for manga and chapter data to avoid repeated API calls
const mangaCache = new Map<string, MangaApiResponse['data']>()
const chapterCache = new Map<string, ChapterApiResponse['data']>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const mangaCacheTimestamps = new Map<string, number>()
const chapterCacheTimestamps = new Map<string, number>()

/**
 * Main UpdateData event handler
 * Called periodically by PreMiD to update user's presence status
 */
presence.on('UpdateData', async () => {
  // Get current page pathname and full URL
  const { pathname, href } = document.location

  // Initialize default presence data
  const presenceData: PresenceData = {
    largeImageKey: SHINIGAMI_KOMIK_ID_LOGO,
    largeImageText: 'Shinigami Komik ID',
    startTimestamp: browsingTimestamp,
    smallImageKey: 'https://i.postimg.cc/D0HQNv6q/shinigami-logo.png',
    smallImageText: 'shinigami.bio',
    type: ActivityType.Watching,
    name: 'Shinigami Komik ID',
    details: 'Shinigami Komik ID',
    detailsUrl: href,
    statusDisplayType: StatusDisplayType.Name,
  }

  // Fetch user settings in parallel for better performance
  const [
    privacyMode,
    displayProgress,
    displayReading,
    displayCover,
  ] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('displayProgress'),
    presence.getSetting<boolean>('displayReading'),
    presence.getSetting<boolean>('showCover'),
  ])

  // Privacy Mode: Hide user activity details
  if (privacyMode) {
    presenceData.details = 'Browsing Shinigami Komik ID'
    presenceData.detailsUrl = undefined
    presenceData.state = 'Privacy Mode 🕵️'
    presenceData.stateUrl = undefined
    presence.setActivity(presenceData)
    return
  }

  // Home Page
  if (pathname === '/') {
    presenceData.details = 'Shinigami Komik ID'
    presenceData.largeImageKey = SHINIGAMI_KOMIK_ID_LOGO
    presenceData.state = 'Viewing Home Page'
  }

  // Explore Page - Browse available manga
  if (pathname === '/explore') {
    presenceData.details = 'Exploring Comics'
    presenceData.largeImageKey = SHINIGAMI_KOMIK_ID_LOGO
    presenceData.state = 'Browsing Explore Page'
  }

  // Library Page - User's saved manga
  if (pathname === '/library') {
    presenceData.details = 'Viewing Library'
    presenceData.largeImageKey = SHINIGAMI_KOMIK_ID_LOGO
    presenceData.state = 'Browsing Library'
  }

  // Search Page - Search for manga
  if (pathname === '/search') {
    presenceData.details = 'Searching Comics'
    presenceData.largeImageKey = SHINIGAMI_KOMIK_ID_LOGO
    presenceData.state = 'Browsing Search Page'
  }

  // Comic/Series Page - Viewing manga details
  if (onComicPage(pathname)) {
    // Extract manga ID from URL path
    const mangaId = pathname.split('/series/')[1]?.split('/')[0]

    if (mangaId) {
      // Fetch manga data from API (uses cache if available)
      const mangaData = await getMangaData(mangaId)
      if (mangaData) {
        presenceData.details = displayReading ? `looking at ${mangaData.title}` : 'looking at something'
        presenceData.detailsUrl = displayReading ? href : undefined

        // Build state string for comic page based on user settings
        const comicStateComponents: string[] = []

        // Add format info if displayReading is enabled
        if (displayReading) {
          const formatText = mangaData.taxonomy.Format.map(f => f.name).join(', ')
          if (formatText)
            comicStateComponents.push(formatText)
        }

        // Add chapter count if displayProgress is enabled
        if (displayProgress) {
          comicStateComponents.push(`max ${mangaData.latest_chapter_number}ch`)
        }

        // Add genre info if displayReading is enabled
        if (displayReading) {
          const genreText = mangaData.taxonomy.Genre.map(g => g.name).join(', ')
          if (genreText)
            comicStateComponents.push(genreText)
        }

        presenceData.state = comicStateComponents.join(' | ') || 'on viewing something'

        // Set cover image if user has enabled the setting
        if (displayCover && mangaData.cover_portrait_url) {
          presenceData.largeImageKey = mangaData.cover_portrait_url
        }
        if (displayCover && mangaData.cover_image_url) {
          presenceData.largeImageKey = mangaData.cover_image_url
        }
        presenceData.largeImageText = displayReading ? mangaData.title : 'Viewing a something'
      }
    }
  }

  // Chapter Page - Reading manga chapter
  if (onChapterPage(pathname)) {
    // Extract chapter ID from URL path
    const chapterId = pathname.split('/chapter/')[1]?.split('/')[0]

    if (chapterId) {
      // Fetch chapter data from API (uses cache if available)
      const chapterData = await getChapterData(chapterId)
      if (chapterData) {
        // Check if manga data is cached, if not fetch it
        const chapterMangaData = mangaCache.get(chapterData?.manga_id)
        if (!chapterMangaData) {
          getMangaData(chapterData.manga_id)
        }

        // Display reading status with format type
        presenceData.details = displayReading ? `Reading ${mangaCache.get(chapterData.manga_id)?.title}` : `Reading a something`
        presenceData.detailsUrl = displayReading ? href : undefined
        // Build state string based on user settings
        const mangaInfo = mangaCache.get(chapterData.manga_id)
        const formatText = mangaInfo?.taxonomy.Format.map(f => f.name).join(', ') || ''
        const genreText = mangaInfo?.taxonomy.Genre.map(g => g.name).join(', ') || ''

        const stateComponents: string[] = []

        // Add chapter progress if enabled
        if (displayProgress) {
          stateComponents.push(`Chapter ${chapterData.chapter_number} of ${mangaInfo?.latest_chapter_number || 'Unknown'}`)
        }

        // Add format info
        if (displayReading && formatText) {
          stateComponents.push(formatText)
        }

        // Add genre info if displayReading is enabled
        if (displayReading && genreText) {
          stateComponents.push(genreText)
        }

        presenceData.state = stateComponents.join(' | ') || 'on reading something'

        // Use chapter thumbnail or fallback to manga cover
        if (displayCover && chapterData.thumbnail_image_url) {
          presenceData.largeImageKey = chapterData.thumbnail_image_url.includes('/thumbnail/image/default.jpg')
            ? mangaCache.get(chapterData.manga_id)?.cover_portrait_url || mangaCache.get(chapterData.manga_id)?.cover_image_url || SHINIGAMI_KOMIK_ID_LOGO
            : chapterData.thumbnail_image_url
        }
        presenceData.largeImageText = displayReading ? chapterData.chapter_title || mangaCache.get(chapterData.manga_id)?.title : `Reading a ${mangaCache.get(chapterData.manga_id)?.taxonomy.Format.map(f => f.slug).join(', ')}`
        presenceData.statusDisplayType = displayReading ? StatusDisplayType.State : StatusDisplayType.Details
      }
    }
  }

  // Update Discord Rich Presence with the prepared data
  presence.setActivity(presenceData)
})

/**
 * Check if current path is a comic/series page
 * @param path - URL pathname to check
 * @returns true if path matches /series/[id] pattern
 */
function onComicPage(path: string) {
  return /\/series\/[a-z0-9-].*$/i.test(path)
}

/**
 * Check if current path is a chapter reading page
 * @param path - URL pathname to check
 * @returns true if path matches /chapter/[id] pattern
 */
function onChapterPage(path: string) {
  return /\/chapter\/[a-z0-9-].*$/i.test(path)
}

/**
 * Fetch manga data from API with caching
 * @param mangaId - Unique identifier for the manga
 * @returns Manga data object or undefined if request fails
 */
async function getMangaData(mangaId: string): Promise<MangaApiResponse['data'] | undefined> {
  // Check if data is in cache and still valid (within CACHE_DURATION)
  const cachedData = mangaCache.get(mangaId)
  const cacheTime = mangaCacheTimestamps.get(mangaId)

  // Return cached data if it exists and hasn't expired
  if (cachedData && cacheTime && Date.now() - cacheTime < CACHE_DURATION) {
    return cachedData
  }

  try {
    // Fetch manga details from Shinigami API
    const response = await fetch(`https://api.shngm.io/v1/manga/detail/${mangaId}`, {
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
      },
    })
    const data: MangaApiResponse = await response.json()

    // Check if API returned successful response
    if (data.retcode === 0) {
      // Store in cache for future requests
      mangaCache.set(mangaId, data.data)
      mangaCacheTimestamps.set(mangaId, Date.now())
      return data.data
    }

    return undefined
  }
  catch {
    // Return undefined if fetch fails
    return undefined
  }
}

/**
 * Fetch chapter data from API with caching
 * @param chapterId - Unique identifier for the chapter
 * @returns Chapter data object or undefined if request fails
 */
async function getChapterData(chapterId: string): Promise<ChapterApiResponse['data'] | undefined> {
  // Check if data is in cache and still valid (within CACHE_DURATION)
  const cachedData = chapterCache.get(chapterId)
  const cacheTime = chapterCacheTimestamps.get(chapterId)

  // Return cached data if it exists and hasn't expired
  if (cachedData && cacheTime && Date.now() - cacheTime < CACHE_DURATION) {
    return cachedData
  }

  try {
    // Fetch chapter details from Shinigami API
    const response = await fetch(`https://api.shngm.io/v1/chapter/detail/${chapterId}`, {
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
      },
    })
    const data: ChapterApiResponse = await response.json()

    // Check if API returned successful response
    if (data.retcode === 0) {
      // Store in cache for future requests
      chapterCache.set(chapterId, data.data)
      chapterCacheTimestamps.set(chapterId, Date.now())
      return data.data
    }

    return undefined
  }
  catch {
    // Return undefined if fetch fails
    return undefined
  }
}
