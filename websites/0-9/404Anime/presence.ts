import { ActivityType, Assets, getTimestamps, supports } from 'premid'

const presence = new Presence({
  clientId: '503557087041683458',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/0-9/404Anime/assets/logo.png',
}

interface Anime404PremidPresence {
  page?: string
  mediaType?: 'anime' | 'movie' | 'tv'
  animeId?: number
  animeTitle?: string
  episode?: number
  season?: number
  episodeTitle?: string | null
  audio?: 'sub' | 'dub'
  server?: string
  cover?: string | null
  url?: string
  currentTime?: number
  duration?: number
  paused?: boolean
}

function truncate(value: string, max = 128): string {
  return value.length > max ? `${value.slice(0, max - 1)}...` : value
}

function getLivePlayback(): Pick<
  Anime404PremidPresence,
  'currentTime' | 'duration' | 'paused'
> {
  const video = document.querySelector<HTMLVideoElement>('video')

  // No video: contribute nothing, so the cached bridge values stand.
  if (!video)
    return {}

  return {
    currentTime: Number.isFinite(video.currentTime) ? video.currentTime : 0,
    duration: Number.isFinite(video.duration) ? video.duration : 0,
    paused: video.paused,
  }
}

async function fetchBridgeData(): Promise<Anime404PremidPresence | null> {
  if (supports(presence, 'execInPage')) {
    try {
      const data = await presence.execInPage<Anime404PremidPresence | null>({
        get: '__SANIME_PREMID__',
      })

      if (data?.animeTitle || data?.episode)
        return data
    }
    catch {
      // Fall back to the older variable reader below.
    }
  }

  try {
    const page = await presence.getPageVariable<{
      __SANIME_PREMID__?: Anime404PremidPresence | null
    }>('__SANIME_PREMID__')

    return page.__SANIME_PREMID__ ?? null
  }
  catch {
    return null
  }
}

// Cached, and only re-read on a URL change or when the page rewrites
// `<body data-premid>`. Position comes off the <video> element instead.
let bridgeCache: Anime404PremidPresence | null = null
let bridgeReadInFlight = false
let bridgeReadStale = false
let lastBridgeRead = 0
let lastHref = document.location.href
const RETRY_MS = 2000

function refreshBridgeData(): void {
  // A change during a read means that read is already out of date, so queue
  // one more rather than dropping it.
  if (bridgeReadInFlight) {
    bridgeReadStale = true
    return
  }

  bridgeReadInFlight = true
  lastBridgeRead = Date.now()
  fetchBridgeData()
    .then((data) => {
      bridgeCache = data
    })
    .finally(() => {
      bridgeReadInFlight = false
      if (bridgeReadStale) {
        bridgeReadStale = false
        refreshBridgeData()
      }
    })
}

function watchForChanges(): void {
  new MutationObserver(refreshBridgeData).observe(document.body, {
    attributes: true,
    attributeFilter: ['data-premid'],
  })
  refreshBridgeData()
}

if (document.body)
  watchForChanges()
else
  document.addEventListener('DOMContentLoaded', watchForChanges, { once: true })

function getBridgeData(): Anime404PremidPresence | null {
  if (document.location.href !== lastHref) {
    lastHref = document.location.href
    refreshBridgeData()
  }

  // Self-heal: the page can publish before the observer is attached, and a
  // read can land before the data exists. Retry while a player is on screen
  // but the cache is still empty. Once it fills, this stops.
  else if (
    !bridgeCache
    && document.querySelector('video')
    && Date.now() - lastBridgeRead > RETRY_MS
  ) {
    refreshBridgeData()
  }

  return bridgeCache
}

function applyPlayback(
  presenceData: PresenceData,
  currentTime = 0,
  duration = 0,
  paused = true,
): void {
  if (paused) {
    presenceData.smallImageKey = Assets.Pause
    presenceData.smallImageText = 'Paused'
    delete presenceData.startTimestamp
    delete presenceData.endTimestamp
    return
  }

  presenceData.smallImageKey = Assets.Play
  presenceData.smallImageText = 'Playing'

  if (duration > 0) {
    [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(
      currentTime,
      duration,
    )
  }
  else {
    presenceData.startTimestamp = Date.now() - currentTime * 1000
    delete presenceData.endTimestamp
  }
}

function getBrowsingState(pathname: string): string {
  if (pathname === '/welcome')
    return 'Getting started'

  if (pathname === '/' || pathname === '/index.html')
    return 'Browsing anime'

  if (pathname.startsWith('/search'))
    return 'Searching anime'

  if (pathname.startsWith('/latest'))
    return 'Browsing latest releases'

  if (pathname.startsWith('/schedule'))
    return 'Checking the schedule'

  if (pathname.startsWith('/seasons'))
    return 'Browsing seasons'

  if (pathname.startsWith('/movies'))
    return 'Browsing movies and shows'

  if (pathname.startsWith('/watchlist'))
    return 'Viewing watchlist'

  if (pathname.startsWith('/history'))
    return 'Viewing watch history'

  if (pathname.startsWith('/profile'))
    return 'Viewing profile'

  if (pathname.startsWith('/login') || pathname.startsWith('/auth'))
    return 'Signing in'

  if (pathname.startsWith('/privacy'))
    return 'Reading privacy policy'

  if (pathname.startsWith('/anime/'))
    return 'Viewing anime details'

  if (pathname.startsWith('/movie/'))
    return 'Viewing movie details'

  if (pathname.startsWith('/tv/'))
    return 'Viewing show details'

  if (pathname.startsWith('/studio/'))
    return 'Viewing studio details'

  if (pathname.startsWith('/person/'))
    return 'Viewing staff details'

  return 'Exploring 404Anime'
}

presence.on('UpdateData', () => {
  // Live playback overrides the cached bridge's stale position.
  const data = {
    ...getBridgeData(),
    ...getLivePlayback(),
  }

  const isWatchPage = document.location.pathname.includes('/watch/')
  const isMovieWatchPage = /^\/(?:movie|tv)\//.test(document.location.pathname)
  const title = data.animeTitle || document.title.replace(/\s*[-|].*$/, '')
  const episodeLabel = data.episode
    ? data.season
      ? `S${data.season}E${data.episode}`
      : `Episode ${data.episode}`
    : null

  const presenceData: PresenceData = {
    name: '404Anime',
    type: ActivityType.Watching,
    largeImageKey: data.cover || ActivityAssets.Logo,
    largeImageText: data.episode
      ? data.season
        ? `Season ${data.season}, Episode ${data.episode}`
        : `Episode ${data.episode}`
      : '404Anime',
  }

  if ((isWatchPage || isMovieWatchPage) && title) {
    presenceData.details = truncate(
      episodeLabel ? `${title} - ${episodeLabel}` : title,
    )
    // Episode title was previously shown only for `tv`, so anime lost it even
    // though the site publishes one. Pair it with the audio track instead.
    const stateParts = data.mediaType === 'movie'
      ? ['Movie']
      : [
          data.episodeTitle || (data.mediaType === 'tv' ? 'TV Episode' : null),
          data.audio ? data.audio.toUpperCase() : null,
        ]
    presenceData.state = truncate(stateParts.filter(Boolean).join(' - '))

    applyPlayback(
      presenceData,
      data.currentTime,
      data.duration,
      data.paused,
    )
  }
  else {
    presenceData.details = '404Anime'
    presenceData.state = getBrowsingState(document.location.pathname)
    presenceData.startTimestamp = browsingTimestamp
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = 'Browsing'
  }

  presence.setActivity(presenceData)
})
