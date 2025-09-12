import { ActivityType } from 'premid'

const presence = new Presence({
  clientId: '1381606555710918766',
})

enum Assets {
  Play = 'https://cdn.rcd.gg/PreMiD/websites/F/FantomTv/assets/0.png',
  Info = 'https://cdn.rcd.gg/PreMiD/websites/F/FantomTv/assets/1.png',
  TV = 'https://cdn.rcd.gg/PreMiD/websites/F/FantomTv/assets/2.png',
  Profile = 'https://cdn.rcd.gg/PreMiD/websites/F/FantomTv/assets/3.png',
  Star = 'https://cdn.rcd.gg/PreMiD/websites/F/FantomTv/assets/4.png',
  Movie = 'https://cdn.rcd.gg/PreMiD/websites/F/FantomTv/assets/5.png',
  Anime = 'https://cdn.rcd.gg/PreMiD/websites/F/FantomTv/assets/6.png',
  Heart = 'https://cdn.rcd.gg/PreMiD/websites/F/FantomTv/assets/7.png',
  Trending =
  'https://cdn.rcd.gg/PreMiD/websites/F/FantomTv/assets/8.png',
  Clock = 'https://cdn.rcd.gg/PreMiD/websites/F/FantomTv/assets/9.png',
}

const browsingTimestamp = Math.floor(Date.now() / 1000)

const defaultLogo
  = 'https://cdn.rcd.gg/PreMiD/websites/F/FantomTv/assets/logo.png'

const API_KEY = 'f1e9f26e7db297085d5c15e7ea4f15db'
const API_URL = 'https://api.themoviedb.org/3'
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/'

// Cache to prevent repeated API calls
const cache = new Map<string, any>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Track current state to prevent unnecessary updates
let currentState = {
  type: '',
  id: '',
  lastUpdate: 0,
  data: null as any,
}

async function fetchMovieDetails(id: string) {
  const cacheKey = `movie-${id}`
  const cached = cache.get(cacheKey)

  // Return cached data if it exists and is still valid
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }

  try {
    const res = await fetch(
      `${API_URL}/movie/${id}?api_key=${API_KEY}&language=en-US`,
    )
    if (!res.ok)
      return null

    const data = await res.json()

    // Cache the result
    cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    })

    return data
  }
  catch {
    return null
  }
}

async function fetchTvDetails(id: string) {
  const cacheKey = `tv-${id}`
  const cached = cache.get(cacheKey)

  // Return cached data if it exists and is still valid
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }

  try {
    const res = await fetch(
      `${API_URL}/tv/${id}?api_key=${API_KEY}&language=en-US`,
    )
    if (!res.ok)
      return null

    const data = await res.json()

    // Cache the result
    cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    })

    return data
  }
  catch {
    return null
  }
}

// Clean up old cache entries
function cleanupCache() {
  const now = Date.now()
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      cache.delete(key)
    }
  }
}

// Cleanup cache every 10 minutes
setInterval(cleanupCache, 10 * 60 * 1000)

presence.on('UpdateData', async () => {
  let details = 'Browsing FantomTV 🎬'
  let state = 'Ready to stream movies, shows & anime 🍿'
  let largeImageKey = defaultLogo
  let largeImageText = 'FantomTV - Watch. Chill. Repeat.'
  let smallImageKey = Assets.Play
  let smallImageText = 'Browsing FantomTV'
  const startTimestamp = browsingTimestamp
  const endTimestamp: number | undefined = undefined
  let buttons: [ButtonData, ButtonData?] | undefined

  const videoModal = document.getElementById('video-modal')
  const videoFrame = document.querySelector<HTMLIFrameElement>('#video-frame')

  if (
    videoModal
    && videoModal.style.display !== 'none'
    && !videoModal.classList.contains('hidden')
    && videoFrame
    && videoFrame.src
  ) {
    const url = new URL(videoFrame.src)
    const type = url.searchParams.get('type')
    const id = url.searchParams.get('id')

    // Check if we need to fetch new data
    const now = Date.now()
    const shouldFetch = currentState.type !== type
      || currentState.id !== id
      || (now - currentState.lastUpdate > CACHE_DURATION)

    if (type === 'movie' && id) {
      let movie = currentState.data

      if (shouldFetch) {
        movie = await fetchMovieDetails(id)
        currentState = { type, id, lastUpdate: now, data: movie }
      }

      if (movie) {
        details = `Watching: ${movie.title || movie.original_title || 'Unknown Movie'}`
        state = movie.tagline
          ? movie.tagline
          : movie.release_date
            ? `Released: ${movie.release_date}`
            : 'Streaming now 🍿'
        largeImageKey = movie.backdrop_path
          ? `${IMAGE_BASE_URL}w780${movie.backdrop_path}`
          : movie.poster_path
            ? `${IMAGE_BASE_URL}w500${movie.poster_path}`
            : defaultLogo
        largeImageText = movie.title || 'FantomTV'
        smallImageKey = Assets.Movie
        smallImageText = 'Now Playing'
        buttons = [
          {
            label: 'View on TMDB',
            url: `https://www.themoviedb.org/movie/${id}`,
          },
        ]
      }
      else {
        details = 'Watching: Unknown Movie'
        state = 'Streaming now 🍿'
        smallImageKey = Assets.Movie
        smallImageText = 'Now Playing'
      }
    }
    else if (type === 'tv' && id) {
      let tv = currentState.data

      if (shouldFetch) {
        tv = await fetchTvDetails(id)
        currentState = { type, id, lastUpdate: now, data: tv }
      }

      if (tv) {
        details = `Watching: ${tv.name || 'Unknown TV Show'}`
        state = tv.tagline
          ? tv.tagline
          : tv.first_air_date
            ? `First aired: ${tv.first_air_date}`
            : 'Streaming now 📺'
        largeImageKey = tv.backdrop_path
          ? `${IMAGE_BASE_URL}w780${tv.backdrop_path}`
          : tv.poster_path
            ? `${IMAGE_BASE_URL}w500${tv.poster_path}`
            : defaultLogo
        largeImageText = tv.name || 'FantomTV'
        smallImageKey = Assets.TV
        smallImageText = 'Now Playing'
        buttons = [
          {
            label: 'View on TMDB',
            url: `https://www.themoviedb.org/tv/${id}`,
          },
        ]
      }
      else {
        details = 'Watching: Unknown TV Show'
        state = 'Streaming now 📺'
        smallImageKey = Assets.TV
        smallImageText = 'Now Playing'
      }
    }
    else if (type === 'anime' && id) {
      // Reset current state for anime since we don't fetch API data
      if (currentState.type !== 'anime' || currentState.id !== id) {
        currentState = { type: 'anime', id, lastUpdate: now, data: null }
      }

      const animeTitle
        = document.getElementById('anime-player-title')?.textContent?.trim()
          || 'Unknown Anime'
      details = `Watching: ${animeTitle}`
      state = 'Streaming anime episode 🍥'
      const animeImg = document.querySelector<HTMLImageElement>('#anime-player-poster img')
      largeImageKey = animeImg?.src || defaultLogo
      largeImageText = animeTitle
      smallImageKey = Assets.Anime
      smallImageText = 'Now Playing'
    }
  }
  else {
    // Reset current state when not watching
    currentState = { type: '', id: '', lastUpdate: 0, data: null }

    if (
      document.getElementById('details-modal')
      && document.getElementById('details-modal')!.style.display !== 'none'
      && !document.getElementById('details-modal')!.classList.contains('hidden')
    ) {
      const movieTitle
      = document.getElementById('details-title')?.textContent?.trim()
        || 'Unknown Movie'
      details = `Viewing details of ${movieTitle}`
      state = 'Checking out info, cast, and more!'
      const imgElement = document.querySelector<HTMLImageElement>('#details-backdrop')
      if (imgElement && imgElement.src && !imgElement.src.includes('placehold.co')) {
        largeImageKey = imgElement.src
        largeImageText = movieTitle
      }
      smallImageKey = Assets.Info
      smallImageText = 'Viewing Details'
    }
    else if (
      document.getElementById('anime-page-container')
      && !document.getElementById('anime-page-container')!.classList.contains('hidden')
    ) {
      details = 'Browsing Anime 🍥'
      state = 'Explore trending anime series!'
      const heroImg = document.querySelector<HTMLImageElement>('#anime-hero-slider img')
      if (heroImg && heroImg.src && !heroImg.src.includes('placehold.co')) {
        largeImageKey = heroImg.src
        largeImageText = 'Anime Spotlight'
      }
      smallImageKey = Assets.Anime
      smallImageText = 'Anime Section'
    }
    else if (
      document.getElementById('tv-shows-page-container')
      && !document.getElementById('tv-shows-page-container')!.classList.contains('hidden')
    ) {
      details = 'Browsing TV Shows 📺'
      state = 'Find your next binge!'
      const heroImg = document.querySelector<HTMLImageElement>('#tv-hero-slider img')
      if (heroImg && heroImg.src && !heroImg.src.includes('placehold.co')) {
        largeImageKey = heroImg.src
        largeImageText = 'TV Show Spotlight'
      }
      smallImageKey = Assets.TV
      smallImageText = 'TV Shows Section'
    }
    else if (
      document.getElementById('profile-page-container')
      && !document.getElementById('profile-page-container')!.classList.contains('hidden')
    ) {
      const username
    = document.getElementById('profile-username')?.textContent?.trim()
      || 'Profile'
      details = `Viewing profile: ${username}`
      state = 'Checking out watch history & lists'
      const imgElement = document.querySelector<HTMLImageElement>('#profile-avatar')
      if (imgElement && imgElement.src) {
        largeImageKey = imgElement.src
        largeImageText = username
      }
      smallImageKey = Assets.Profile
      smallImageText = 'Profile Section'
    }
    else if (
      document.getElementById('wishlist-modal')
      && !document.getElementById('wishlist-modal')!.classList.contains('hidden')
    ) {
      details = 'Viewing Wishlist ⭐'
      state = 'Checking your favorite movies and shows'
      smallImageKey = Assets.Star
      smallImageText = 'Wishlist'
    }
  }

  presence.setActivity(
    {
      type: ActivityType.Watching,
      details,
      state,
      largeImageKey,
      largeImageText,
      smallImageKey,
      smallImageText,
      startTimestamp,
      endTimestamp,
      buttons,
    },
  )
})
