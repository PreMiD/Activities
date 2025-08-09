/// <reference path='../../../@types/premid/index.d.ts' />
import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '1203605618745933880',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.ibb.co/vxRrCsHC/logo.png',
}

// Internationalization support
async function getStrings() {
  return presence.getStrings({
    play: 'general.playing',
    pause: 'general.paused',
    browse: 'general.browsing',
    watchingMovie: 'general.watchingMovie',
    watchingSeries: 'general.watchingSeries',
    viewPage: 'general.viewPage',
    search: 'general.search',
    live: 'general.live',
    buttonViewPage: 'general.buttonViewPage',
    buttonViewMovie: 'general.buttonViewMovie',
    buttonViewSeries: 'general.buttonViewSeries',
  })
}

let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null

// Helper function to format titles properly
function formatTitle(title: string): string {
  return title
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Helper function to extract content rating
function getContentRating(): string {
  const ratingElement = document.querySelector('.rating-display, .imdb-rating, [data-rating]')
  return ratingElement?.textContent?.trim() || 'N/A'
}

// Helper function to get poster image
function getPosterImage(): string {
  const posterElement = document.querySelector('img[alt*="poster"], .poster-image, .movie-poster, .show-poster')
  return posterElement?.getAttribute('src') || ActivityAssets.Logo
}

presence.on('UpdateData', async () => {
  let presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    details: 'Exploring PrimeShows',
  }

  const { pathname, search } = document.location
  const urlParams = new URLSearchParams(search)
  
  // Privacy mode check
  const privacy = await presence.getSetting<boolean>('privacy')
  if (privacy) {
    presenceData.details = 'Browsing PrimeShows'
    presenceData.state = 'Privacy mode enabled'
    presence.setActivity(presenceData)
    return
  }

  // Static pages mapping
  const staticPages: Record<string, PresenceData> = {
    '/': {
      details: 'Viewing Homepage 🏠',
      state: 'Discovering new content',
      smallImageKey: Assets.Viewing,
    },
    '/movies': {
      details: 'Browsing Movies 🎬',
      state: 'Looking for something to watch',
      smallImageKey: Assets.Viewing,
    },
    '/tv': {
      details: 'Browsing TV Shows 📺',
      state: 'Exploring series collection',
      smallImageKey: Assets.Viewing,
    },
    '/search': {
      details: 'Searching Content 🔍',
      state: 'Finding the perfect match',
      smallImageKey: Assets.Search,
    },
    '/trending': {
      details: 'Viewing Trending 📈',
      state: 'What\'s hot right now',
      smallImageKey: Assets.Viewing,
    },
    '/favorites': {
      details: 'Viewing Favorites ❤️',
      state: 'Personal collection',
      smallImageKey: Assets.Viewing,
    },
    '/watchlist': {
      details: 'Managing Watchlist 📋',
      state: 'Planning next binge session',
      smallImageKey: Assets.Viewing,
    },
    '/profile': {
      details: 'Viewing Profile 👤',
      state: 'Managing account',
      smallImageKey: Assets.Viewing,
    },
    '/settings': {
      details: 'Configuring Settings ⚙️',
      state: 'Personalizing experience',
      smallImageKey: Assets.Viewing,
    },
    '/contact': {
      details: 'Contact Support 📞',
      state: 'Getting help',
      smallImageKey: Assets.Viewing,
    },
    '/faq': {
      details: 'Reading FAQ ❓',
      state: 'Finding answers',
      smallImageKey: Assets.Viewing,
    },
    '/privacy': {
      details: 'Privacy Policy 🔒',
      state: 'Understanding data usage',
      smallImageKey: Assets.Viewing,
    },
    '/terms': {
      details: 'Terms of Service 📄',
      state: 'Reading the fine print',
      smallImageKey: Assets.Viewing,
    },
    '/promos': {
      details: 'Viewing Promotions 🎁',
      state: 'Checking out deals',
      smallImageKey: Assets.Viewing,
    },
  }

  // Check for static pages first
  if (staticPages[pathname]) {
    Object.assign(presenceData, staticPages[pathname])
  }
  // Handle movie pages
  else if (pathname.startsWith('/movies/')) {
    const movieMatch = pathname.match(/\/movies\/(\d+)(?:-([^/]+))?/)
    if (movieMatch && movieMatch[1]) {
      const movieId = movieMatch[1]
      const movieSlug = movieMatch[2] || 'unknown-movie'
      const movieTitle = formatTitle(movieSlug)
      
      presenceData.details = `🎬 ${movieTitle}`
      presenceData.name = movieTitle
      presenceData.largeImageKey = getPosterImage()
      
      // Get movie metadata
      const rating = getContentRating()
      const runtime = document.querySelector('[data-runtime], .runtime')?.textContent?.match(/\d+/)?.[0] || 'N/A'
      const year = document.querySelector('.release-year, [data-year]')?.textContent?.trim() || 'N/A'
      
      presenceData.state = `⭐ ${rating} • ⏱️ ${runtime}min • 📅 ${year}`
      presenceData.smallImageKey = Assets.Play
    } else {
      presenceData.details = 'Browsing Movies 🎬'
      presenceData.state = 'Exploring movie collection'
    }
  }
  // Handle TV show pages
  else if (pathname.startsWith('/tv/')) {
    const tvMatch = pathname.match(/\/tv\/(\d+)(?:-([^/]+))?/)
    if (tvMatch && tvMatch[1]) {
      const showId = tvMatch[1]
      const showSlug = tvMatch[2] || 'unknown-show'
      const showTitle = formatTitle(showSlug)
      
      presenceData.details = `📺 ${showTitle}`
      presenceData.name = showTitle
      presenceData.largeImageKey = getPosterImage()
      
      // Try to get season/episode info from localStorage or page
      const watchData = JSON.parse(localStorage.getItem('watchProgress') || '{}')
      const currentShow = watchData[showId] || { season: 1, episode: 1 }
      
      const rating = getContentRating()
      const year = document.querySelector('.release-year, [data-year]')?.textContent?.trim() || 'N/A'
      
      presenceData.state = `S${currentShow.season}E${currentShow.episode} • ⭐ ${rating} • 📅 ${year}`
      presenceData.smallImageKey = Assets.Play
    } else {
      presenceData.details = 'Browsing TV Shows 📺'
      presenceData.state = 'Exploring series collection'
    }
  }
  // Handle player pages
  else if (pathname.startsWith('/player/') || pathname.startsWith('/watch/')) {
    const isMovie = pathname.includes('/movie/')
    const isTV = pathname.includes('/tv/')
    const contentType = isMovie ? 'Movie' : isTV ? 'TV Show' : 'Content'
    
    const contentMatch = pathname.match(/\/(player|watch)\/(movie|tv)\/(\d+)/)
    if (contentMatch) {
      const platform = contentMatch[1] === 'player' ? 'Player' : 'Watch'
      const contentId = contentMatch[3]
      
      // Try to get title from page or localStorage
      const titleElement = document.querySelector('h1, .video-title, [data-title]')
      const contentTitle = titleElement?.textContent?.trim() || `${contentType} ${contentId}`
      
      presenceData.details = `▶️ Watching ${contentTitle}`
      presenceData.name = contentTitle
      presenceData.largeImageKey = getPosterImage()
      
      // Check if video is playing or paused
      const video = document.querySelector('video')
      const isPlaying = video && !video.paused
      const currentTime = video?.currentTime || 0
      const duration = video?.duration || 0
      
      if (isPlaying && duration > 0) {
        const remainingTime = duration - currentTime
        presenceData.endTimestamp = Date.now() + (remainingTime * 1000)
        presenceData.smallImageKey = Assets.Play
        presenceData.state = 'Currently playing'
      } else {
        presenceData.smallImageKey = Assets.Pause
        presenceData.state = 'Paused'
      }
    }
  }
  // Handle genre pages
  else if (pathname.startsWith('/genre/') || pathname.startsWith('/genres/')) {
    const genreMatch = pathname.match(/\/genres?\/([^/]+)/)
    if (genreMatch && genreMatch[1]) {
      const genre = formatTitle(genreMatch[1])
      presenceData.details = `🎭 Browsing ${genre} Genre`
      presenceData.state = `Discovering ${genre.toLowerCase()} content`
      presenceData.smallImageKey = Assets.Viewing
    }
  }
  // Handle studio pages
  else if (pathname.startsWith('/studio/')) {
    const studioMatch = pathname.match(/\/studio\/(\d+)/)
    if (studioMatch) {
      const studioName = document.querySelector('.studio-name, h1')?.textContent?.trim() || `Studio ${studioMatch[1]}`
      presenceData.details = `🏢 Viewing ${studioName}`
      presenceData.state = 'Exploring studio content'
      presenceData.smallImageKey = Assets.Viewing
    }
  }
  // Handle section pages
  else if (pathname.startsWith('/section/')) {
    const sectionMatch = pathname.match(/\/section\/([^/]+)\/(\d+)/)
    if (sectionMatch && sectionMatch[1]) {
      const sectionType = formatTitle(sectionMatch[1])
      presenceData.details = `📂 Browsing ${sectionType} Section`
      presenceData.state = 'Exploring curated content'
      presenceData.smallImageKey = Assets.Viewing
    }
  }
  // Handle search with query
  else if (pathname === '/search' && urlParams.get('q')) {
    const query = urlParams.get('q')
    presenceData.details = '🔍 Searching PrimeShows'
    presenceData.state = `Query: "${query}"`
    presenceData.smallImageKey = Assets.Search
  }

  // Set the activity
  if (presenceData.details) {
    presence.setActivity(presenceData)
  } else {
    presence.setActivity()
  }
})
