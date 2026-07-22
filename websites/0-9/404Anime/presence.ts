import { ActivityType, Assets, getTimestamps } from 'premid'

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

function getVideoFallback(): Pick<
  Anime404PremidPresence,
  'currentTime' | 'duration' | 'paused'
> {
  const video = document.querySelector<HTMLVideoElement>('video')

  if (!video) {
    return {
      currentTime: 0,
      duration: 0,
      paused: true,
    }
  }

  return {
    currentTime: Number.isFinite(video.currentTime) ? video.currentTime : 0,
    duration: Number.isFinite(video.duration) ? video.duration : 0,
    paused: video.paused,
  }
}

function getBridgeData(): Anime404PremidPresence | null {
  const el = document.getElementById('s-anime-premid')
  if (!el)
    return null

  const d = el.dataset
  if (!d.animeTitle && !d.episode)
    return null

  return {
    page: d.page,
    mediaType: d.mediaType as Anime404PremidPresence['mediaType'],
    animeId: d.animeId ? Number(d.animeId) : undefined,
    animeTitle: d.animeTitle,
    episode: d.episode ? Number(d.episode) : undefined,
    season: d.season ? Number(d.season) : undefined,
    episodeTitle: d.episodeTitle ?? null,
    audio: d.audio as Anime404PremidPresence['audio'],
    server: d.server,
    cover: d.cover ?? null,
    url: d.url,
    currentTime: d.currentTime ? Number(d.currentTime) : undefined,
    duration: d.duration ? Number(d.duration) : undefined,
    paused: d.paused === 'true',
  }
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
  const bridge = getBridgeData()
  const fallback = getVideoFallback()
  const data = {
    ...fallback,
    ...bridge,
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
      ? `Season 1, Episode ${data.episode}`
      : '404Anime',
  }

  if ((isWatchPage || isMovieWatchPage) && title) {
    presenceData.details = truncate(
      episodeLabel ? `${title} - ${episodeLabel}` : title,
    )
    presenceData.state = truncate(
      [
        data.mediaType === 'movie'
          ? 'Movie'
          : data.mediaType === 'tv'
            ? data.episodeTitle || 'TV Episode'
            : data.audio ? data.audio.toUpperCase() : null,
      ]
        .filter(Boolean)
        .join(' - '),
    )

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
