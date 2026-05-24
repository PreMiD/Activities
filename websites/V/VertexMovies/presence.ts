import { ActivityType } from 'premid'

const LOGO = 'https://i.imgur.com/FV46abR.png'
const presence = new Presence({
  clientId: '1508084972991549551',
})

// State cache to prevent flickering
let lastStatusHash = ''

presence.on('UpdateData', async () => {
  if (window !== window.top)
    return

  const { pathname } = document.location
  const currentPath = pathname.toLowerCase()

  const presenceData: any = {
    largeImageKey: LOGO,
    largeImageText: 'VertexMovies.com',
    type: ActivityType.Watching,
  }

  let currentHash = currentPath

  // 1. PLAYER PAGE LOGIC (Unified)
  if (currentPath.includes('/player')) {
    const metaEl = document.getElementById('premid-metadata')

    if (metaEl) {
      const title = metaEl.getAttribute('data-title') || 'Video'
      const type = metaEl.getAttribute('data-type') || 'movie' // "movie", "tv", or "anime"

      presenceData.name = title
      presenceData.details = title
      presenceData.buttons = [{ label: 'Watch on VertexMovies', url: document.location.href }]

      // BRANCH: Movie Logic
      if (type === 'movie') {
        // 1. Try to get data from metadata attributes first
        let duration = metaEl.getAttribute('data-duration')
        let year = metaEl.getAttribute('data-year')

        // 2. If data is missing or "0", scrape it directly from the DOM "playerMeta" div
        if (!duration || duration === '0' || !year) {
          const metaDiv = document.getElementById('playerMeta')
          if (metaDiv) {
            const spans = Array.from(metaDiv.querySelectorAll('span'))
            // Find year (4 digits) and duration (contains 'h' or 'm')
            const foundYear = spans.find(s => /^\d{4}$/.test(s.textContent?.trim() || ''))?.textContent?.trim()
            const foundDuration = spans.find(s => (s.textContent?.includes('h') || s.textContent?.includes('m')) && !s.classList.contains('text-slate-500'))?.textContent?.trim()

            if (foundYear)
              year = foundYear
            if (foundDuration)
              duration = foundDuration
          }
        }

        // 3. Set the state string
        let stateStr = 'Movie'
        if (duration && year) {
          stateStr = `${duration} • ${year}`
        }
        else if (duration) {
          stateStr = duration
        }

        const posterUrl = metaEl.getAttribute('data-poster-url')
        presenceData.largeImageKey = posterUrl || LOGO
        presenceData.state = stateStr

        currentHash += title + (posterUrl || '') + (duration || '') + (year || '')
      }
      // BRANCH: TV/Anime Logic (Using sidebar discovery)
      else {
        const activeEp = document.querySelector('.player-upnext-ep:has(.bg-primary)')
        const season = activeEp?.getAttribute('data-season') || '0'
        const episode = activeEp?.getAttribute('data-episode') || '0'
        const img = activeEp?.querySelector('img')?.src || LOGO

        presenceData.largeImageKey = img
        presenceData.state = `S${season} • Episode ${episode}`

        currentHash += title + season + episode + img
      }
    }
    else {
      presence.clearActivity()
      lastStatusHash = ''
      return
    }
  }

  // 2. INFO / MOVIE PAGE LOGIC
  else if (currentPath.includes('/info') || currentPath.includes('/movie')) {
    const titleEl = document.querySelector('h1') || document.querySelector('.movie-name')
    const movieTitle = titleEl?.textContent?.trim() || 'Viewing Info'
    const posterEl = document.getElementById('infoPoster') as HTMLImageElement

    if (posterEl)
      presenceData.largeImageKey = posterEl.src
    presenceData.name = movieTitle
    presenceData.details = movieTitle

    currentHash += movieTitle + (posterEl?.src || '')
  }

  // 3. FALLBACK
  else {
    presenceData.name = 'VertexMovies'
    presenceData.details = 'Browsing VertexMovies'
  }

  // Optimized Update
  if (currentHash !== lastStatusHash) {
    lastStatusHash = currentHash
    presence.setActivity(presenceData)
  }
})

// --- CLEANUP ---
function cleanup() {
  lastStatusHash = ''
  presence.clearActivity()
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden')
    cleanup()
})
window.addEventListener('beforeunload', cleanup)
window.addEventListener('pagehide', cleanup)
