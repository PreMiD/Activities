import { Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '1400642676487098519',
})

function getAction(): string {
  const href = document.location.href
  if (href.includes('/movie'))
    return 'movie'
  if (href.includes('/tv'))
    return 'tv'
  if (href.includes('/live-tv'))
    return 'live'
  if (href.includes('/watch/channel/'))
    return 'live'
  if (href.includes('/sports'))
    return 'sports'
  if (href.includes('/audiobooks'))
    return 'audiobooks'
  if (href.includes('/listen/'))
    return 'audiobooks'
  return 'home'
}

function getText(selector: string): string {
  return document.querySelector(selector)?.textContent?.trim() || ''
}

function getStatus(): string {
  const url = window.location.href

  // Sports: extract from h2 element
  if (url.includes('/sports/')) {
    const h2 = document.querySelector<HTMLElement>('h2.text-transparent')
    return h2?.textContent?.trim() || 'Browsing'
  }

  // Get content from meta tag
  const meta = document.querySelector<HTMLMetaElement>(
    'meta[name="twitter:title"]',
  )
  const rawTitle = meta?.content?.trim()
  if (!rawTitle)
    return 'Browsing'

  // Audiobooks: extract book title and author
  if (url.includes('/audiobooks') || url.includes('/listen/')) {
    const cleanedTitle = rawTitle.replace(/\s*–\s*MappleTV$/i, '')
    const titleMatch = cleanedTitle.match(/"([^"]+)"/)
    const byIndex = cleanedTitle.toLowerCase().indexOf(' by ')
    const author = byIndex !== -1 ? cleanedTitle.slice(byIndex + 4).trim() : 'Unknown Author'
    const book = titleMatch?.[1]?.trim() || 'Unknown Title'
    return `${book} by ${author}`
  }

  // Live TV: remove 'Streaming - ' prefix
  if (url.includes('/watch/channel/')) {
    return rawTitle.replace(/^Streaming\s*-\s*/i, '').trim()
  }

  return `${rawTitle}`
}

const constructAction: Record<string, string> = {
  movie: 'Watching a Movie',
  tv: 'Watching a TV Series',
  live: 'Streaming Live TV',
  sports: 'Watching Sports',
  audiobooks: 'Listening to an Audiobook',
  home: 'Browsing',
}

async function updatePresence() {
  const action = getAction()

  const [
    privacy,
    showBrowsing,
    showLive,
    showMovies,
    showTVShows,
    showAudiobooks,
    showSports,
  ] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('browse'),
    presence.getSetting<boolean>('live'),
    presence.getSetting<boolean>('movies'),
    presence.getSetting<boolean>('tvshows'),
    presence.getSetting<boolean>('audiobooks'),
    presence.getSetting<boolean>('sports'),
  ])

  // Privacy mode enabled — show nothing except icon + timestamps (if any)
  if (privacy) {
    const presenceData: PresenceData = {
      largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/M/Mapple.tv/assets/logo.png',
    }

    const video = document.querySelector('video')
    if (video && getStatus().toLowerCase() !== 'pause') {
      const [start, end] = getTimestampsFromMedia(video)
      presenceData.startTimestamp = start
      presenceData.endTimestamp = end
      presenceData.smallImageKey = Assets.Play
    }
    else if (video) {
      presenceData.smallImageKey = Assets.Pause
    }

    presence.setActivity(presenceData)
    return
  }

  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/M/Mapple.tv/assets/logo.png',
    details: constructAction[action],
  }

  // Show 'Browsing' only if it's allowed
  if (!['movie', 'tv', 'sports', 'live', 'audiobooks'].includes(action)) {
    if (showBrowsing) {
      presenceData.details = 'Home'
      presenceData.startTimestamp = Math.floor(Date.now() / 1000)
    }
    else {
      delete presenceData.details
    }
    presence.setActivity(presenceData)
    return
  }

  const allowDetail
    = (action === 'movie' && showMovies)
      || (action === 'tv' && showTVShows)
      || (action === 'live' && showLive)
      || (action === 'audiobooks' && showAudiobooks)
      || (action === 'sports' && showSports)

  const video = document.querySelector('video')
  if (video && getStatus().toLowerCase() !== 'pause') {
    const [start, end] = getTimestampsFromMedia(video)
    presenceData.startTimestamp = start
    presenceData.endTimestamp = end
    presenceData.smallImageKey = Assets.Play
  }
  else if (video) {
    presenceData.smallImageKey = Assets.Pause
  }

  if (allowDetail) {
    const subtitle
      = getText('.player-title-bar') || getText('[class*=player-title-bar]')
    presenceData.state = `${getStatus()}${subtitle ? ` | ${subtitle}` : ''}`
  }

  presence.setActivity(presenceData)
}

presence.on('UpdateData', updatePresence)
