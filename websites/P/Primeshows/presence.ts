import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '1369156087340728350',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/P/Primeshows/assets/logo.png',
}

/**
 * Formats a slug into a readable name.
 * e.g., "66732-stranger-things" -> "Stranger Things"
 *
 * @param slug - The slug string to format.
 */
function formatSlug(slug: string | undefined): string {
  if (!slug) {
    return ''
  }

  return slug
    .split('-')
    .map((word) => {
      if (/^\d+$/.test(word)) {
        return ''
      } // Skip IDs
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .filter(Boolean)
    .join(' ')
}

/**
 * Attempts to retrieve a name/title from the DOM if the URL slug is insufficient.
 */
function getNameFromDOM(): string | null {
  const selectors = [
    'h1.text-white',
    '.movie-title',
    '.show-title',
    'h1',
    'header h1',
    '#Movie\\ Name',
    '#TV\\ Shows\\ Name',
  ]

  for (const selector of selectors) {
    const el = document.querySelector(selector)
    if (el && el.textContent) {
      return el.textContent.trim()
    }
  }

  return null
}

/**
 * Robustly fetches the rating from the page.
 */
function getRating(): string {
  const ratingEl = document.querySelector('.radial-progress span.text-white')
    || document.querySelector('[class*="radial-progress"] span')
    || document.querySelector('.rating-value')

  const rating = ratingEl?.textContent?.trim() || 'N/A'

  return rating === '0' || rating === '0.0' ? 'N/A' : rating
}

/**
 * Robustly fetches the release date from the page.
 *
 * @param type - The type of content ('movie' or 'tv').
 */
function getReleaseDate(type: 'movie' | 'tv'): string {
  const selector = type === 'movie' ? '#Movie\\ Release\\ Date time p' : '#TV\\ Shows\\ Air\\ Date time'
  let date = document.querySelector(selector)?.textContent?.trim()
    || document.querySelector('time')?.textContent?.trim()
    || 'N/A'

  // Format long dates like "Sunday, October 12, 2014" to "October 2014"
  if (date !== 'N/A') {
    const dateParts = date.split(', ')
    const p0 = dateParts[0]
    const p1 = dateParts[1]
    const p2 = dateParts[2]

    if (dateParts.length === 3 && p1 && p2) {
      date = `${p1} ${p2}`
    }
    else if (dateParts.length === 2 && type === 'tv' && p0 && p1) {
      const monthYear = p0.split(' ')[0]
      if (monthYear) {
        date = `${monthYear} ${p1}`
      }
    }
  }

  return date
}

presence.on('UpdateData', async () => {
  let presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    details: 'Unsupported Page',
  }

  const { pathname, search, href } = document.location
  const urlParams = new URLSearchParams(search)

  const privacy = await presence.getSetting<boolean>('privacy')
  const showButtons = await presence.getSetting<boolean>('showButtons')

  if (privacy) {
    presenceData.details = 'Watching Primeshows 🔒'
    presence.setActivity(presenceData)
    return
  }

  // Static Pages
  const pages: Record<string, PresenceData> = {
    '/': {
      details: 'Viewing HomePage 🏠',
      smallImageKey: Assets.Viewing,
    },
    '/profile': {
      details: 'Viewing Profile 👤',
      smallImageKey: Assets.Viewing,
    },
    '/tv': {
      details: 'Browsing TV Shows 📺',
      smallImageKey: Assets.Viewing,
    },
    '/movies': {
      details: 'Browsing Movies 🎬',
      smallImageKey: Assets.Viewing,
    },
    '/trending': {
      details: 'Browsing Trending 🔥',
      smallImageKey: Assets.Viewing,
    },
    '/search': {
      details: 'Browsing Search 🔎',
      smallImageKey: Assets.Viewing,
    },
    '/livetv': {
      details: 'Browsing Live TV 📶',
      smallImageKey: Assets.Viewing,
    },
    '/sports': {
      details: 'Live Sports ⚽',
      smallImageKey: Assets.Viewing,
    },
  }

  if (pages[pathname]) {
    presenceData = {
      ...presenceData,
      ...pages[pathname],
      type: ActivityType.Watching,
    }
  }

  // Handle Dynamic Routes

  // 1. TV Info Page: /tv/{id}-{slug}
  if (pathname.startsWith('/tv/') && pathname !== '/tv') {
    const match = pathname.match(/\/tv\/\d+(?:-([^/]+))?/)
    if (match) {
      const showName = formatSlug(match[1]) || getNameFromDOM() || 'Unknown Show'
      presenceData.details = `Viewing ${showName} 📺`
      presenceData.type = ActivityType.Watching
      presenceData.smallImageKey = Assets.Viewing

      const rating = getRating()
      const releaseDate = getReleaseDate('tv')

      const stateParts = []
      if (rating !== 'N/A') {
        stateParts.push(`⭐ ${rating}`)
      }
      if (releaseDate !== 'N/A') {
        stateParts.push(`🗓️ ${releaseDate}`)
      }
      presenceData.state = stateParts.length > 0 ? stateParts.join(' • ') : 'Viewing Details'
      presenceData.largeImageKey = document.querySelector<HTMLImageElement>('section.md\\:col-\\[1\\/4\\] img')?.src
        || document.querySelector<HTMLImageElement>('img[alt*="Poster"]')?.src
        || ActivityAssets.Logo

      if (showButtons) {
        presenceData.buttons = [
          { label: 'View Show 📺', url: href },
        ]
      }
    }
  }

  // 2. Movie Info Page: /movies/{id}-{slug}
  if (pathname.startsWith('/movies/') && pathname !== '/movies') {
    const match = pathname.match(/\/movies\/\d+(?:-([^/]+))?/)
    if (match) {
      const movieName = formatSlug(match[1]) || getNameFromDOM() || 'Unknown Movie'
      presenceData.details = `Viewing ${movieName} 🎬`
      presenceData.type = ActivityType.Watching
      presenceData.smallImageKey = Assets.Viewing

      const rating = getRating()
      const runtime = document.querySelector('#Movie\\ Runtime time p')?.textContent?.match(/\d+/)?.[0] || 'N/A'
      const releaseDate = getReleaseDate('movie')

      const stateParts = []
      if (rating !== 'N/A') {
        stateParts.push(`⭐ ${rating}`)
      }
      if (runtime !== 'N/A') {
        stateParts.push(`🕒 ${runtime}m`)
      }
      if (releaseDate !== 'N/A') {
        stateParts.push(`🗓️ ${releaseDate}`)
      }
      presenceData.state = stateParts.length > 0 ? stateParts.join(' • ') : 'Viewing Details'
      presenceData.largeImageKey = document.querySelector<HTMLImageElement>('figure img.object-cover')?.src
        || document.querySelector<HTMLImageElement>('img[alt*="Poster"]')?.src
        || ActivityAssets.Logo

      if (showButtons) {
        presenceData.buttons = [
          { label: 'View Movie 🎬', url: href },
        ]
      }
    }
  }

  // 3. Watch TV: /watch/tv/{id}
  if (pathname.startsWith('/watch/tv/')) {
    const match = pathname.match(/\/watch\/tv\/(\d+)/)
    if (match) {
      const tmdbId = match[1]
      const showName = getNameFromDOM() || 'Unknown Show'

      const season = urlParams.get('season')
      const episode = urlParams.get('episode')

      let seasonNo = '1'
      let episodeNo = '1'

      if (season && episode) {
        seasonNo = season
        episodeNo = episode
      }
      else {
        const watchHistory = JSON.parse(localStorage.getItem('watch-history') || '{}')
        const showData = (tmdbId ? watchHistory[tmdbId] : null) || { last_season_watched: '1', last_episode_watched: '1' }
        seasonNo = showData.last_season_watched
        episodeNo = showData.last_episode_watched
      }

      presenceData.details = `Watching ${showName} 🍿`
      presenceData.state = `S${seasonNo} E${episodeNo} • Streaming 📺`
      presenceData.type = ActivityType.Watching
      presenceData.smallImageKey = Assets.Play

      presenceData.largeImageKey = document.querySelector<HTMLImageElement>('img.poster')?.src || ActivityAssets.Logo

      if (showButtons) {
        presenceData.buttons = [
          { label: 'Watch Now 🍿', url: href },
        ]
      }
    }
  }

  // 4. Watch Movie: /watch/movie/{id}
  if (pathname.startsWith('/watch/movie/')) {
    const movieName = getNameFromDOM() || 'Unknown Movie'
    presenceData.details = `Watching ${movieName} 🎬`
    presenceData.state = `Enjoying Movie 🍿`
    presenceData.type = ActivityType.Watching
    presenceData.smallImageKey = Assets.Play
    presenceData.largeImageKey = document.querySelector<HTMLImageElement>('img.poster')?.src || ActivityAssets.Logo

    if (showButtons) {
      presenceData.buttons = [
        { label: 'Watch Now 🍿', url: href },
      ]
    }
  }

  // 5. Watch Sports: /watch/sports/{details}
  if (pathname.startsWith('/watch/sports/')) {
    const sportsSlug = pathname.split('/').pop() || ''
    const sportsName = formatSlug(sportsSlug) || 'Live Sports'

    presenceData.details = `Watching ${sportsName} 🏆`
    presenceData.type = ActivityType.Watching
    presenceData.smallImageKey = Assets.Play
    presenceData.state = 'Live Sports Event 📶'

    if (showButtons) {
      presenceData.buttons = [
        { label: 'Watch Live 📶', url: href },
      ]
    }
  }

  // 6. Search Page
  if (pathname.includes('/search')) {
    const query = urlParams.get('q') || document.querySelector('input')?.getAttribute('value')

    presenceData.details = 'Searching Primeshows 🔎'
    if (query) {
      presenceData.state = `Looking for: ${query} ✨`
    }
    presenceData.smallImageKey = Assets.Search
  }

  if (presenceData.details !== 'Unsupported Page') {
    presence.setActivity(presenceData)
  }
  else {
    presence.clearActivity()
  }
})
