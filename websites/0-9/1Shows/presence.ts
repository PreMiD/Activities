import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '1349021198943649884',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.imgur.com/MCJ61nd.png',
}

presence.on('UpdateData', async () => {
  let presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    details: 'Unsupported Page',
  }

  const { pathname } = document.location

  const [privacy] = await Promise.all([presence.getSetting<boolean>('privacy')])

  if (privacy) {
    presenceData.details = 'Watching 1Shows'
    presence.setActivity(presenceData)
    return
  }

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
    '/search': {
      details: 'Browsing Search 🔎',
      smallImageKey: Assets.Viewing,
    },
  }

  for (const [path, data] of Object.entries(pages)) {
    if (pathname === path) {
      presenceData = {
        ...presenceData,
        ...data,
        type: ActivityType.Watching,
      }
    }
  }

  if (pathname.includes('/movies/')) {
    switch (pathname.replace(/^\/+/, '').split('/')[0]) {
      case 'movies': {
        const match = pathname.match(/\/movies\/(\d+)(?:-([^/]+))?/)

        if (match && match[1]) {
          const movieName = match[2]?.replace(/-/g, ' ') || 'Unknown Movie'

          const formattedMovieName = movieName
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')

          presenceData.name = `Watching ${formattedMovieName}`
          presenceData.details = '1Shows.com'

          const ratingElement = document.querySelector(
            '.radial-progress span.text-white',
          )
          const rating = ratingElement?.textContent?.trim() || 'N/A'

          const runtimeElement = document.querySelector(
            '#Movie\\ Runtime time p',
          )

          const runtime =
            runtimeElement?.textContent?.match(/\d+/)?.[0] || 'N/A'

          const releaseDateElement = document.querySelector(
            '#Movie\\ Release\\ Date time p',
          )

          let releaseDate = releaseDateElement?.textContent?.trim() || 'N/A'

          if (releaseDate !== 'N/A') {
            const dateParts = releaseDate.split(', ')
            if (dateParts.length === 3) {
              releaseDate = `${dateParts[1]} ${dateParts[2]}`
            }
          }

          presenceData.state = `⭐ ${rating} 🕒 ${runtime} mins 🗓️ ${releaseDate}`

          const posterElement = document.querySelector(
            'figure img.object-cover',
          )

          const posterSrc = posterElement?.getAttribute('src')

          presenceData.largeImageKey = posterSrc

          // Check URL parameter for streaming
          const urlParams = new URLSearchParams(window.location.search)
          const isStreaming = urlParams.get('streaming') === 'true'
          presenceData.smallImageKey = isStreaming ? Assets.Play : Assets.Pause
        }
        break
      }

      default:
        presenceData.details = 'Browsing a Movie'
        break
    }
  }

  if (pathname.includes('/tv/')) {
    switch (pathname.replace(/^\/+/, '').split('/')[0]) {
      case 'tv':
        const match = pathname.match(/\/tv\/(\d+)(?:-([^/]+))?/)

        if (match && match[1]) {
          const tmdbId = match[1]
          const showName = match[2]?.replace(/-/g, ' ') || 'Unknown Show'

          const formattedShowName = showName
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')

          const watchHistory = JSON.parse(
            localStorage.getItem('watch-history') || '{}',
          )
          const showData = watchHistory[tmdbId] || {
            last_season_watched: '1',
            last_episode_watched: '1',
          }
          const seasonNo = showData.last_season_watched
          const episodeNo = showData.last_episode_watched

          presenceData.name = `Watching ${formattedShowName} S${seasonNo}E${episodeNo}`
          presenceData.details = '1Shows.com'

          const ratingElement = document.querySelector(
            '.radial-progress span.text-white',
          )
          const rating = ratingElement?.textContent?.trim() || 'N/A'

          const releaseDateElement = document.querySelector(
            '#TV\\ Shows\\ Air\\ Date time',
          )
          let releaseDate = releaseDateElement?.textContent?.trim() || 'N/A'

          if (releaseDate !== 'N/A') {
            const dateParts = releaseDate.split(', ')
            if (dateParts.length === 3) {
              releaseDate = `${dateParts[1]} ${dateParts[2]}`
            }
          }

          presenceData.state = `⭐ ${rating} 🗓️ ${releaseDate}`

          const posterElement = document.querySelector(
            'section.md\\:col-\\[1\\/4\\] img',
          )
          const posterSrc =
            posterElement?.getAttribute('src') || 'default_image_key'

          presenceData.largeImageKey = posterSrc

          // Check URL parameter for streaming
          const urlParams = new URLSearchParams(window.location.search)
          const isStreaming = urlParams.get('streaming') === 'true'
          presenceData.smallImageKey = isStreaming ? Assets.Play : Assets.Pause

          console.log('Presence data before setting activity:', presenceData) // Debugging log
        } else {
          console.log('TV show match failed for pathname:', pathname)
        }
        break

      default:
        presenceData.details = 'Browsing a TV Show'
        break
    }
  }

  if (presenceData.details) {
    presence.setActivity(presenceData)
  } else {
    presence.setActivity() // Clear activity if no details
  }

  if (pathname.includes('/search')) {
    presenceData.details = `Searching for Movies/TvShows 🔎`
    const query = document.querySelector('input')?.getAttribute('value')
    if (query) {
      presenceData.state = `Query: ${query}`
    }
    presenceData.smallImageKey = Assets.Search
  }

  if (presenceData.details) {
    presence.setActivity(presenceData)
  } else {
    presence.setActivity() // Clear activity if no details
  }
})
