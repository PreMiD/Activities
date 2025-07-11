import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1391805175035068476',
})

// Get localized strings
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
  browse: 'general.browsing',
  search: 'general.searching',
  live: 'general.live',
  watchingVid: 'general.watchingVid',
  watchingLive: 'general.watchingLive',
  watchingSeries: 'general.watchingSeries',
  watchingMovie: 'general.watchingMovie',
  buffering: 'general.buffering',
  viewingDetails: 'general.viewingDetails',
  season: 'general.season',
  episode: 'general.episode',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

const ActivityAssets = {
  Logo: 'https://cdn.rcd.gg/PreMiD/websites/F/Flixer/assets/logo.jpeg',
}

const currentData: {
  title?: string
  episode?: string
  season?: string
  currentTime?: number
  duration?: number
  paused?: boolean
  poster?: string
  tmdbData?: any
  quality?: string
  buffering?: boolean
} = {}

let lastUpdateTime = 0
let lastCurrentTime = 0
let isPlaying = false

const tmdbCache = new Map<string, { data: any, timestamp: number }>()
const CACHE_DURATION = 30 * 60 * 1000

function getCachedData(id: string) {
  const cached = tmdbCache.get(id)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  tmdbCache.delete(id)
  return null
}

function setCachedData(id: string, data: any) {
  tmdbCache.set(id, { data, timestamp: Date.now() })
}

function getTMDBId(): string | null {
  const urlParams = new URLSearchParams(document.location.search)
  const idFromQuery = urlParams.get('id')
  if (idFromQuery)
    return idFromQuery

  const path = document.location.pathname
  const pathParts = path.split('/')

  if (path.includes('/watch/tv/') || path.includes('/watch/movie/')) {
    const idIndex = pathParts.findIndex(part => part === 'tv' || part === 'movie') + 1
    if (idIndex > 0 && pathParts[idIndex]) {
      return pathParts[idIndex]
    }
  }

  return null
}

async function _fetchTMDBData(id: string, isTV: boolean = false, retries = 3): Promise<any> {
  const cached = getCachedData(id)
  if (cached) {
    return cached
  }

  for (let i = 0; i < retries; i++) {
    try {
      const endpoint = isTV ? 'tv' : 'movie'
      const response = await fetch(`https://tmdb.flixer.su/api/tmdb/${endpoint}/${id}`)
      if (response.ok) {
        const data = await response.json()
        setCachedData(id, data)
        return data
      }
    }
    catch (error) {
      if (i === retries - 1) {
        console.error('TMDB fetch error after retries:', error)
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
  return null
}

function getVideoInfo() {
  try {
    const video = document.querySelector('video')
    if (!video)
      return null

    const duration = video.duration && !Number.isNaN(video.duration) ? video.duration : 0
    const currentTime = video.currentTime && !Number.isNaN(video.currentTime) ? video.currentTime : 0
    const paused = video.paused
    const ended = video.ended

    const now = Date.now()
    const timeDiff = now - lastUpdateTime
    const isTimeProgressing = currentTime > lastCurrentTime && timeDiff > 100

    if (currentTime !== lastCurrentTime || timeDiff > 1000) {
      lastCurrentTime = currentTime
      lastUpdateTime = now
    }

    const buffering = video.readyState < 2 || (video.readyState < 3 && currentTime > 0)

    isPlaying = !paused && !ended && duration > 0 && currentTime < duration && !buffering

    return {
      currentTime: Math.floor(currentTime),
      duration: Math.floor(duration),
      paused,
      buffering,
      ended,
      isPlaying: isPlaying || isTimeProgressing,
      muted: video.muted,
      volume: video.volume,
      quality: getVideoQuality(video),
      readyState: video.readyState,
      networkState: video.networkState,
    }
  }
  catch (error) {
    console.error('getVideoInfo error:', error)
    return null
  }
}

function getVideoQuality(video: HTMLVideoElement): string | null {
  const qualitySelectors = [
    '.text-white\\/60.text-sm',
    '[class*="text-white/60"]',
    '.text-sm',
    '.quality-indicator',
    '.video-quality',
    '[class*="quality"]',
    '.player-controls .text-sm',
    '.video-controls .text-sm',
  ]

  for (const selector of qualitySelectors) {
    const element = document.querySelector(selector)
    if (element) {
      const text = element.textContent?.trim()
      const qualityMatch = text?.match(/\d+p|\d+K|HD|FHD|UHD/i)
      if (qualityMatch) {
        return qualityMatch[0]
      }
    }
  }

  if (video && video.videoHeight) {
    const height = video.videoHeight
    if (height >= 2160)
      return '4K'
    if (height >= 1440)
      return '1440p'
    if (height >= 1080)
      return '1080p'
    if (height >= 720)
      return '720p'
    if (height >= 480)
      return '480p'
    if (height >= 360)
      return '360p'
    if (height >= 240)
      return '240p'
  }

  return null
}

function extractSeasonEpisode(text: string) {
  if (!text)
    return { title: text, season: null, episode: null }

  const patterns = [
    /(\S+(?:\s+\S+)*)\s+S(\d+)\s+E(?:pisode\s+)?(\d+)/i,
    /(\S+(?:\s+\S+)*)\s+S(\d+)E(\d+)/i,
    /(\S+(?:\s+\S+)*)\s+Season\s+(\d+)\s+Episode\s+(\d+)/i,
    /(\S+(?:\s+\S+)*)\s+(\d+)x(\d+)/i,
    /(\S+(?:\s+\S+)*)\s+Ep(?:isode)?\s+(\d+)/i,
    /(\S+(?:\s+\S+)*)\s+S(\d+)\s+Episode\s+(\d+)/i,
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      return {
        title: match[1].trim(),
        season: match[2] ? `S${match[2]}` : null,
        episode: match[3] ? `E${match[3]}` : (match[2] ? `E${match[2]}` : null),
      }
    }
  }

  return { title: text, season: null, episode: null }
}

function getPageInfo() {
  const path = document.location.pathname
  const url = document.location.href
  const urlParams = new URLSearchParams(document.location.search)

  const hasVideo = document.querySelector('video')

  if (urlParams.has('id') && (urlParams.has('movie') || urlParams.has('tv'))) {
    return {
      type: hasVideo ? 'watching' : 'viewing',
      id: urlParams.get('id'),
      isTV: urlParams.has('tv'),
    }
  }

  if (hasVideo && (path.includes('/watch/') || path.includes('/movie/') || path.includes('/tv/') || path.includes('/series/') || path.includes('/shows/'))) {
    const titleSelectors = [
      '.absolute.left-1\\/2.top-1\\/2 .text-white.text-base.font-bold',
      '.absolute .text-white.font-bold',
      '.pointer-events-none .text-white.font-bold',
      '.text-white.text-base.font-bold',
      'div[class*="absolute"][class*="left-1/2"][class*="top-1/2"] .text-white',
      'h1',
      '.movie-title',
      '.show-title',
      '.title',
      '.video-title',
      '.content-title',
      '[class*="title"]',
      '.player-title',
      '.video-info h1',
      '.video-info .title',
    ]

    let fullTitle = ''
    for (const selector of titleSelectors) {
      const element = document.querySelector(selector)
      if (element?.textContent?.trim()) {
        fullTitle = element.textContent.trim()
        break
      }
    }

    let title = fullTitle
    const extracted = extractSeasonEpisode(fullTitle || '')
    title = extracted.title
    let episode = extracted.episode
    let season = extracted.season

    if (!title) {
      const docTitle = document.title
      if (docTitle && docTitle !== 'Flixer') {
        title = docTitle.replace(/\s*-\s*Flixer.*$/i, '').trim()
      }
    }

    if (!episode || !season) {
      const infoSelectors = [
        '.episode-title',
        '.episode-info',
        '.ep-title',
        '[class*="episode"]',
        '.season-info',
        '.season-title',
        '[class*="season"]',
        '.video-info .text-sm',
        '.player-info .text-sm',
        '.text-sm',
        '.text-xs',
      ]

      for (const selector of infoSelectors) {
        const element = document.querySelector(selector)
        if (element?.textContent) {
          const text = element.textContent.trim()
          if (!episode) {
            const epMatch = text.match(/Episode\s*(\d+)|E(\d+)/i)
            if (epMatch)
              episode = `E${epMatch[1] || epMatch[2]}`
          }
          if (!season) {
            const seasonMatch = text.match(/Season\s*(\d+)|S(\d+)/i)
            if (seasonMatch)
              season = `S${seasonMatch[1] || seasonMatch[2]}`
          }
        }
      }
    }

    const poster = document.querySelector('img[alt*="poster"]')?.getAttribute('src')
      || document.querySelector('.poster img')?.getAttribute('src')
      || document.querySelector('.movie-poster img')?.getAttribute('src')
      || document.querySelector('.video-poster img')?.getAttribute('src')
      || document.querySelector('img[src*="poster"]')?.getAttribute('src')
      || document.querySelector('img[src*="thumb"]')?.getAttribute('src')
      || document.querySelector('img[src*="cover"]')?.getAttribute('src')

    return {
      type: 'watching',
      title: title || 'Watching Video',
      episode,
      season,
      poster,
    }
  }

  if (path.includes('/search') || url.includes('search')) {
    const tmdbId = getTMDBId()
    if (tmdbId) {
      return {
        type: 'viewing',
        id: tmdbId,
      }
    }

    let query = new URLSearchParams(document.location.search).get('q')
      || new URLSearchParams(document.location.search).get('query')
      || new URLSearchParams(document.location.search).get('search')

    if (!query) {
      const searchInputs = [
        'input[type="text"][placeholder*="search"]',
        'input[type="text"][placeholder*="Search"]',
        'input[type="text"][placeholder*="suchen"]',
        'input[type="text"][placeholder*="Nach Filmen"]',
        'input[type="search"]',
        'input.search-input',
        'input[type="text"].w-full',
        'input[placeholder*="suchen"]',
      ]

      for (const selector of searchInputs) {
        const input = document.querySelector(selector) as HTMLInputElement
        if (input && input.value && input.value.trim()) {
          query = input.value.trim()
          break
        }
      }
    }

    return {
      type: 'search',
      query: query || 'Unknown',
    }
  }

  if (path === '/movies' || path.startsWith('/movies/')) {
    return { type: 'browse', section: 'Movies' }
  }

  if (path === '/shows' || path.startsWith('/shows/')) {
    return { type: 'browse', section: 'TV Shows' }
  }

  if (path === '/my-list' || path.startsWith('/my-list/')) {
    return { type: 'browse', section: 'My List' }
  }

  if (path.includes('/movie/') || path.includes('/show/') || path.includes('/series/')) {
    const title = document.querySelector('h1')?.textContent?.trim()
      || document.querySelector('.movie-title')?.textContent?.trim()
      || document.querySelector('.show-title')?.textContent?.trim()
      || document.querySelector('.title')?.textContent?.trim()

    return {
      type: 'viewing',
      title: title || 'Viewing Details',
    }
  }

  if (path.includes('/genre/')) {
    const genre = path.split('/genre/')[1]?.split('/')[0]
    return { type: 'browse', section: `${genre} Movies` }
  }

  if (path.includes('/trending') || path.includes('/popular')) {
    return { type: 'browse', section: 'Trending' }
  }

  if (path.includes('/latest') || path.includes('/recent')) {
    return { type: 'browse', section: 'Latest' }
  }

  return { type: 'browse', section: 'Home' }
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

let updateTimeout: ReturnType<typeof setTimeout>
const DEBOUNCE_DELAY = 100

function forceUpdate() {
  clearTimeout(updateTimeout)
  updateTimeout = setTimeout(() => {}, 10)
}

presence.on('UpdateData', async () => {
  clearTimeout(updateTimeout)
  updateTimeout = setTimeout(async () => {
    try {
      const presenceData: PresenceData = {
        largeImageKey: ActivityAssets.Logo,
      }

      const showTimestamp = await presence.getSetting('showTimestamp')
      const showButtons = await presence.getSetting('showButtons')

      if (showTimestamp) {
        presenceData.startTimestamp = browsingTimestamp
      }

      const pageInfo = getPageInfo()
      const videoInfo = getVideoInfo()
      const localizedStrings = await strings

      const tmdbId = getTMDBId()
      let tmdbData = currentData.tmdbData

      if (tmdbId && (!tmdbData || tmdbData.id !== Number.parseInt(tmdbId))) {
        try {
          const urlParams = new URLSearchParams(document.location.search)
          const isTV = urlParams.has('tv')
            || document.location.pathname.includes('/tv/')
            || document.location.pathname.includes('/watch/tv/')
            || pageInfo?.isTV

          tmdbData = getCachedData(tmdbId)
          if (!tmdbData) {
            const response = await fetch(`https://tmdb.flixer.su/api/tmdb/${isTV ? 'tv' : 'movie'}/${tmdbId}`)
            if (response.ok) {
              tmdbData = await response.json()
              setCachedData(tmdbId, tmdbData)
            }
          }
          if (tmdbData) {
            currentData.tmdbData = tmdbData
          }
        }
        catch (error) {
          console.error('TMDB fetch error:', error)
        }
      }

      if (videoInfo && document.querySelector('video')) {
        const title = tmdbData?.title || tmdbData?.name || tmdbData?.original_title || tmdbData?.original_name || pageInfo?.title || 'Unknown'
        const poster = tmdbData?.poster_path ? `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}` : pageInfo?.poster

        const isTV = tmdbData?.name || tmdbData?.original_name || pageInfo?.season || pageInfo?.episode

        let displayTitle = title

        if (isTV && (pageInfo?.season || pageInfo?.episode)) {
          const seasonEpisode = [pageInfo.season, pageInfo.episode].filter(Boolean).join(' ')
          if (seasonEpisode) {
            displayTitle = `${title} • ${seasonEpisode}`
          }
        }

        let state = 'Unknown'
        let smallImageKey = Assets.Play
        let smallImageText = 'Playing'

        if (videoInfo.ended) {
          state = 'Finished'
          smallImageKey = Assets.Stop
          smallImageText = 'Finished'
        }
        else if (videoInfo.buffering) {
          state = 'Buffering'
          smallImageKey = Assets.Pause
          smallImageText = 'Buffering'
        }
        else if (videoInfo.paused) {
          state = 'Paused'
          smallImageKey = Assets.Pause
          smallImageText = 'Paused'
        }
        else if (videoInfo.isPlaying) {
          state = 'Playing'
          smallImageKey = Assets.Play
          smallImageText = 'Playing'
        }
        else {
          state = 'Watching'
          smallImageKey = Assets.Play
          smallImageText = 'Watching'
        }

        if (videoInfo.quality) {
          state += ` (${videoInfo.quality})`
        }

        presenceData.details = displayTitle
        presenceData.state = state
        presenceData.smallImageKey = smallImageKey
        presenceData.smallImageText = smallImageText

        if (videoInfo.duration > 0) {
          const progress = Math.round((videoInfo.currentTime / videoInfo.duration) * 100)

          presenceData.state = `${state} • ${formatTime(videoInfo.currentTime)} / ${formatTime(videoInfo.duration)}`

          if (progress > 0) {
            presenceData.details = `${displayTitle} (${progress}%)`
          }

          if (videoInfo.isPlaying && !videoInfo.paused && !videoInfo.ended && !videoInfo.buffering) {
            const timeLeft = videoInfo.duration - videoInfo.currentTime
            if (timeLeft > 0 && timeLeft < 86400 && showTimestamp) {
              presenceData.endTimestamp = Date.now() + (timeLeft * 1000)
            }
          }
          else {
            delete presenceData.endTimestamp
            delete presenceData.startTimestamp
          }
        }

        if (poster) {
          presenceData.largeImageKey = poster
        }

        if (showButtons) {
          const buttons: { label: string, url: string }[] = [{
            label: 'Watch on Flixer',
            url: document.location.href,
          }]

          if (tmdbData?.id) {
            const tmdbType = isTV ? 'tv' : 'movie'
            buttons.push({
              label: 'View on TMDB',
              url: `https://www.themoviedb.org/${tmdbType}/${tmdbData.id}`,
            })
          }

          if (tmdbData?.imdb_id) {
            buttons.push({
              label: 'View on IMDb',
              url: `https://www.imdb.com/title/${tmdbData.imdb_id}`,
            })
          }

          presenceData.buttons = buttons.slice(0, 2) as [{ label: string, url: string }, ({ label: string, url: string } | undefined)?]
        }
      }
      else if (pageInfo?.type === 'viewing') {
        const title = tmdbData?.title || tmdbData?.name || tmdbData?.original_title || tmdbData?.original_name || pageInfo.title || 'Unknown'
        const poster = tmdbData?.poster_path ? `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}` : null

        const isTV = tmdbData?.name || tmdbData?.original_name || pageInfo.season || pageInfo.episode

        let displayTitle = title
        if (isTV && (pageInfo.season || pageInfo.episode)) {
          const seasonEpisode = [pageInfo.season, pageInfo.episode].filter(Boolean).join(' ')
          if (seasonEpisode) {
            displayTitle = `${title} • ${seasonEpisode}`
          }
        }

        presenceData.details = 'Viewing Details'
        presenceData.state = displayTitle
        presenceData.smallImageKey = Assets.Viewing
        presenceData.smallImageText = 'Viewing Details'

        if (poster) {
          presenceData.largeImageKey = poster
        }

        if (showButtons) {
          const buttons: { label: string, url: string }[] = [{
            label: 'View Details',
            url: document.location.href,
          }]

          if (tmdbData?.id) {
            const tmdbType = tmdbData?.name || tmdbData?.original_name ? 'tv' : 'movie'
            buttons.push({
              label: 'View on TMDB',
              url: `https://www.themoviedb.org/${tmdbType}/${tmdbData.id}`,
            })
          }

          if (tmdbData?.imdb_id) {
            buttons.push({
              label: 'View on IMDb',
              url: `https://www.imdb.com/title/${tmdbData.imdb_id}`,
            })
          }

          presenceData.buttons = buttons.slice(0, 2) as [{ label: string, url: string }, ({ label: string, url: string } | undefined)?]
        }
      }
      else if (pageInfo?.type === 'search') {
        presenceData.details = 'Searching'
        presenceData.state = `"${pageInfo.query}"`
        presenceData.smallImageKey = Assets.Search
        presenceData.smallImageText = 'Searching'
      }
      else if (pageInfo?.type === 'browse') {
        presenceData.details = localizedStrings.browse
        presenceData.state = pageInfo.section
        presenceData.smallImageKey = Assets.Reading
        presenceData.smallImageText = localizedStrings.browse
      }
      else {
        presenceData.details = localizedStrings.browse
        presenceData.state = 'Flixer'
        presenceData.smallImageKey = Assets.Reading
        presenceData.smallImageText = localizedStrings.browse
      }

      presence.setActivity(presenceData)
    }
    catch (error) {
      console.error('Presence error:', error)
      const fallbackData: PresenceData = {
        details: 'Browsing Flixer',
        largeImageKey: ActivityAssets.Logo,
      }

      const showTimestamp = await presence.getSetting('showTimestamp')
      if (showTimestamp) {
        fallbackData.startTimestamp = browsingTimestamp
      }

      presence.setActivity(fallbackData)
    }
  }, DEBOUNCE_DELAY)
})

document.addEventListener('DOMContentLoaded', () => {
  const checkForVideo = () => {
    const video = document.querySelector('video')
    if (video) {
      const updateImmediately = () => {
        forceUpdate()
      }

      video.addEventListener('play', updateImmediately)
      video.addEventListener('pause', updateImmediately)
      video.addEventListener('seeked', updateImmediately)
      video.addEventListener('timeupdate', updateImmediately)
      video.addEventListener('loadedmetadata', updateImmediately)
      video.addEventListener('canplay', updateImmediately)
      video.addEventListener('waiting', updateImmediately)
      video.addEventListener('playing', updateImmediately)
      video.addEventListener('ended', updateImmediately)
      video.addEventListener('volumechange', updateImmediately)

      clearTimeout(updateTimeout)
      updateImmediately()
    }
    else {
      setTimeout(checkForVideo, 100)
    }
  }

  checkForVideo()
})

const observer = new MutationObserver(() => {
  const video = document.querySelector('video')
  if (video) {
    forceUpdate()
  }
})

observer.observe(document.body, { childList: true, subtree: true })

window.addEventListener('popstate', () => {
  forceUpdate()
})

window.addEventListener('hashchange', () => {
  forceUpdate()
})
