import { ActivityType, Assets, getTimestampsFromMedia, StatusDisplayType } from 'premid'

const presence = new Presence({
  clientId: '1433154103697084456',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.imgur.com/rxviDsu.png',
}

// localStorage keys for mature content tracking and image caching
const STORAGE_KEYS = {
  MATURE_ANIME: 'PMD_GL_MA_CACHE',
  IMAGE_CACHE: 'PMD_GL_IMG_CACHE',
}

/**
 * Retrieves the list of anime IDs marked as mature content from localStorage
 * @returns Set of anime IDs that contain mature content
 */
function getMatureAnimeList(): Set<string> {
  const data = localStorage.getItem(STORAGE_KEYS.MATURE_ANIME)
  return data ? new Set(JSON.parse(data)) : new Set()
}

/**
 * Adds an anime ID to the mature content list in localStorage
 * @param animeId - The unique identifier of the anime to mark as mature
 */
function setMatureAnime(animeId: string): void {
  const matureList = getMatureAnimeList()
  matureList.add(animeId)
  localStorage.setItem(STORAGE_KEYS.MATURE_ANIME, JSON.stringify([...matureList]))
}

/**
 * Checks if an anime is marked as mature content
 * @param animeId - The unique identifier of the anime to check
 * @returns true if the anime contains mature content, false otherwise
 */
function isMatureAnime(animeId: string): boolean {
  return getMatureAnimeList().has(animeId)
}

/**
 * Retrieves the cache of blurred/censored images from localStorage
 * @returns Object mapping original image URLs to their blurred data URLs
 */
function getImageCache(): Record<string, string> {
  const data = localStorage.getItem(STORAGE_KEYS.IMAGE_CACHE)
  return data ? JSON.parse(data) : {}
}

/**
 * Stores a blurred image in the localStorage cache
 * @param url - The original image URL (used as the cache key)
 * @param dataURL - The blurred image as a data URL
 */
function setImageCache(url: string, dataURL: string): void {
  const cache = getImageCache()
  cache[url] = dataURL
  localStorage.setItem(STORAGE_KEYS.IMAGE_CACHE, JSON.stringify(cache))
}

/**
 * Applies a blur filter to an image for mature content censoring
 * Loads the image, renders it to a canvas with blur effect, and caches the result
 * @param url - The URL of the image to censor
 * @returns Promise resolving to a data URL of the blurred image
 */
async function applyCensoring(url: string): Promise<string> {
  const cache = getImageCache()
  if (cache[url]) {
    return cache[url]
  }

  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.src = url
  await img.decode()

  const canvas = document.createElement('canvas')
  const MAX = 512
  const ratio = Math.min(MAX / img.naturalWidth, MAX / img.naturalHeight, 1)
  canvas.width = img.naturalWidth * ratio
  canvas.height = img.naturalHeight * ratio

  const ctx = canvas.getContext('2d')!
  ctx.filter = 'blur(20px)'
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

  const dataURL = canvas.toDataURL('image/jpeg', 0.4)
  setImageCache(url, dataURL)
  return dataURL
}

/**
 * Censors anime name by keeping first letter of each word and replacing rest with asterisks
 * @param name - The original anime name
 * @returns Censored version of the name
 */
function censorAnimeName(name: string): string {
  return name
    .split(' ')
    .map((word) => {
      if (word.length <= 1)
        return word

      return word[0] + '*'.repeat(Math.min(word.length - 1, 4))
    })
    .join(' ')
}

presence.on('UpdateData', async () => {
  const [privacyModeEnabled, showVideoTimestamps, matureContentCensoring] = await Promise.all([
    presence.getSetting<boolean>('privacyMode'),
    presence.getSetting<boolean>('showTimestamps'),
    presence.getSetting<boolean>('matureContentCensoring'),
  ])

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    type: ActivityType.Watching,
    statusDisplayType: StatusDisplayType.Details,
  }

  const { href, pathname, search } = document.location
  const urlParams = new URLSearchParams(search)

  switch (true) {
    case pathname === '/':
      presenceData.details = 'Viewing Homepage'
      break
    case pathname.includes('/watch'): {
      if (privacyModeEnabled) {
        presenceData.details = 'Streaming anime'
        presenceData.smallImageKey = Assets.Stop
        presenceData.smallImageText = 'Privacy mode enabled'
        break
      }

      delete presenceData.startTimestamp

      let coverImg = document
        .querySelector<HTMLImageElement>('div.cover span.lazy-load-image-background img.object-cover')
        ?.src

      // Title format: "Episode Title - Anime Name"
      const titleArray = document.title.split('-')
      const [episodeTitle, animeName] = [titleArray[0]?.trim(), titleArray[1]?.trim()]

      // URL params: ep=5&subType=sub (others are ignored)
      const episodeNumber = urlParams.get('ep') || ''
      const subType = urlParams.get('subType') || ''

      // Build state text with episode info
      const statePieces: string[] = []
      if (episodeNumber)
        statePieces.push(`Ep. ${episodeNumber}`)
      if (episodeTitle)
        statePieces.length > 0 ? statePieces.push(`: ${episodeTitle}`) : statePieces.push(episodeTitle)
      if (subType)
        statePieces.length > 0 ? statePieces.push(` (${subType})`) : statePieces.push(`(${subType})`)

      presenceData.state = statePieces.length > 0 ? statePieces.join('') : undefined
      presenceData.stateUrl = presenceData.state ? href : undefined

      // The anime ID is always the last part of the URL path, after a /
      const animeId = pathname.split('/').reverse()[0]
      presenceData.detailsUrl = animeId ? `${document.location.origin}/anime/${animeId}` : undefined

      // Apply censoring if this is a mature anime
      const isMature = animeId && isMatureAnime(animeId)
      if (isMature && coverImg && matureContentCensoring) {
        coverImg = await applyCensoring(coverImg)
      }

      // Censor anime name if mature content censoring is enabled
      let displayName = animeName ?? 'Streaming anime'
      if (isMature && matureContentCensoring) {
        displayName = censorAnimeName(displayName)
      }

      presenceData.details = displayName
      presenceData.largeImageKey = coverImg ?? ActivityAssets.Logo

      const video = document.querySelector<HTMLVideoElement>('video')
      if (video) {
        const isPaused = video.paused
        presenceData.smallImageKey = isPaused ? Assets.Pause : Assets.Play
        presenceData.smallImageText = isPaused ? 'Paused' : 'Playing'

        if (!isPaused && showVideoTimestamps) {
          [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(video)
        }
      }
      break
    }
    case pathname.includes('/anime'): {
      if (privacyModeEnabled) {
        presenceData.details = 'Viewing anime details'
        break
      }

      const animeId = pathname.split('/').reverse()[0]

      // Check if this anime is mature by scanning the genres section
      const genresLabel = Array.from(document.querySelectorAll('span')).find(
        span => span.textContent?.trim() === 'Genres',
      )
      if (genresLabel && animeId) {
        const genresContainer = genresLabel.nextElementSibling
        if (genresContainer) {
          const genres = Array.from(genresContainer.children)
            .map(child => child.textContent?.replace(/[^a-z0-9]/gi, '') || '')

          if (genres.includes('Hentai'))
            setMatureAnime(animeId)
        }
      }

      let coverImg = document
        .querySelector<HTMLImageElement>('div.group span.lazy-load-image-background img.size-full.object-cover.object-center')
        ?.src

      // Apply censoring if this is a mature anime
      const isMature = animeId && isMatureAnime(animeId)
      if (isMature && coverImg && matureContentCensoring) {
        coverImg = await applyCensoring(coverImg)
      }

      // Censor anime name if mature content censoring is enabled
      let displayTitle = document.title
      if (isMature && matureContentCensoring) {
        displayTitle = censorAnimeName(displayTitle)
      }

      presenceData.details = `Viewing ${displayTitle}`
      presenceData.largeImageKey = coverImg ?? ActivityAssets.Logo
      presenceData.smallImageKey = Assets.Viewing

      const tab = urlParams.get('tab')
      presenceData.state = tab ? tab.charAt(0).toUpperCase() + tab.slice(1) : undefined
      break
    }
    case pathname.includes('/search'): {
      if (privacyModeEnabled) {
        presenceData.details = 'Viewing search results'
        break
      }

      let queryValue = ''
      const filters: string[] = []

      // Parse search params: query contains the search term, other params are filters
      queryValue = urlParams.get('query') || ''

      urlParams.forEach((value, key) => {
        if (!(key.toLowerCase() === 'query')) {
          filters.push(value)
        }
      })

      presenceData.details = queryValue ? `Searching for: "${queryValue}"` : 'Viewing search results'
      presenceData.state = filters.length > 0 ? `Filters: ${filters.join(', ')}` : 'No filters applied'
      presenceData.smallImageKey = Assets.Search
      break
    }
    case pathname === '/catalog': {
      if (privacyModeEnabled) {
        presenceData.details = 'Viewing catalog'
        break
      }

      // search term
      const queryInput = document.querySelector<HTMLInputElement>('input#inputt')
      const queryValue = queryInput?.value || ''
      const filters: string[] = []

      urlParams.forEach((value) => {
        filters.push(value)
      })

      presenceData.details = queryValue ? `Searching catalog: "${queryValue}"` : 'Searching catalog'
      presenceData.state = filters.length > 0 ? `Filters: ${filters.join(', ')}` : 'No filters applied'
      presenceData.smallImageKey = Assets.Search
      break
    }
    case pathname.includes('/@me'): {
      if (privacyModeEnabled) {
        presenceData.details = 'Viewing my profile'
        break
      }

      const pfpImg = document
        .querySelector<HTMLImageElement>('div.group span.lazy-load-image-background img.size-full.object-cover.object-center')
        ?.src

      const usernameAnchor = document
        .querySelector<HTMLAnchorElement>('div.group + div a[href^="/user/"]')
      const username = usernameAnchor?.textContent?.trim()

      if (username?.length) {
        presenceData.state = username.startsWith('@') ? username : `@${username}`
      }

      if (usernameAnchor?.href) {
        presenceData.stateUrl = usernameAnchor.href
      }

      presenceData.largeImageKey = pfpImg ?? ActivityAssets.Logo
      presenceData.smallImageKey = Assets.Viewing

      const tab = urlParams.get('tab') || 'profile'
      switch (tab) {
        case 'profile':
          presenceData.details = 'Viewing my profile'
          break
        case 'history':
          presenceData.details = 'Viewing watch history'
          break
        case 'my-list': {
          const listName = urlParams.get('name')
          if (listName) {
            const formattedListName = listName.charAt(0).toUpperCase() + listName.slice(1)
            presenceData.details = `Viewing my ${formattedListName} list`
          }
          else {
            presenceData.details = 'Viewing my lists'
          }
          break
        }
        case 'settings':
          presenceData.details = 'Viewing settings'
          break
        default:
          presenceData.details = 'Viewing my profile'
          break
      }
      break
    }
    case pathname.includes('/user/'): {
      if (privacyModeEnabled) {
        presenceData.details = 'Viewing a user profile'
        break
      }

      const username = pathname.split('/')?.reverse()?.[0]
      presenceData.details = 'Viewing a user profile'
      presenceData.state = username ? `@${username}` : undefined
      presenceData.smallImageKey = Assets.Viewing
      break
    }
    default:
      presenceData.details = 'Browsing Gojo.live'
      break
  }
  presence.setActivity(presenceData)
})
