import { Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '1534742028368347156',
})

const TMDB_KEY = '8476a7ab80ad76f0936744df0430e67c'
const TMDB_IMG = 'https://image.tmdb.org/t/p/w500'

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/C/Cinejoy/assets/logo.png',
}

function parseMediaPath() {
  const path = document.location.pathname
  const parts = path.split('/').filter(Boolean)

  const type = parts.find(p => p === 'tv' || p === 'movie')
  if (!type)
    return null

  const typeIndex = parts.indexOf(type)
  const idPart = parts[typeIndex + 1]
  const idMatch = idPart?.match(/^\d+/)
  const tmdbId = idMatch?.[0]
  if (!tmdbId)
    return null

  const seasonPart = parts[typeIndex + 2]
  const episodePart = parts[typeIndex + 3]
  const season = seasonPart?.match(/\d+/)?.[0]
  const episode = episodePart?.match(/\d+/)?.[0]

  return { type, tmdbId, season, episode }
}

function getStaticPageInfo(): { details: string, state?: string } {
  const parts = document.location.pathname.split('/').filter(Boolean)

  if (parts.length === 0)
    return { details: 'Browsing Cinejoy', state: 'On the home page' }

  switch (parts[0]) {
    case 'movies':
      return { details: 'Browsing Cinejoy', state: 'Browsing Movies' }
    case 'series':
      return { details: 'Browsing Cinejoy', state: 'Browsing TV Shows' }
    case 'lists':
      return { details: 'Browsing Cinejoy', state: 'Viewing My List' }
    case 'continue-watching':
      return { details: 'Browsing Cinejoy', state: 'Viewing Continue Watching' }
    case 'shorts':
      return { details: 'Browsing Cinejoy', state: 'Watching Shorts' }
    case 'settings':
      return { details: 'Browsing Cinejoy', state: 'In Settings' }
    case 'search':
      return { details: 'Browsing Cinejoy', state: 'Searching' }
    default:
      return { details: 'Browsing Cinejoy' }
  }
}

let cache: { key: string, details: any } | null = null

async function getTmdbDetails(type: string, tmdbId: string) {
  const key = `${type}-${tmdbId}`
  if (cache?.key === key)
    return cache.details

  const res = await fetch(
    `https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${TMDB_KEY}&language=en-US`,
  )
  const data = await res.json()
  cache = { key, details: data }
  return data
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    details: 'Browsing Cinejoy',
  }

  const parsedMedia = parseMediaPath()
  const video = document.querySelector('video')

  if (parsedMedia) {
    try {
      const data = await getTmdbDetails(parsedMedia.type, parsedMedia.tmdbId)
      const title = data.title ?? data.name ?? 'Unknown'
      const posterPath = data.poster_path

      presenceData.details = title

      if (parsedMedia.type === 'tv' && parsedMedia.season && parsedMedia.episode) {
        presenceData.state = `S${parsedMedia.season}:E${parsedMedia.episode}`
      }
      else if (parsedMedia.type === 'movie' && data.release_date) {
        presenceData.state = data.release_date.split('-')[0]
      }

      if (posterPath) {
        presenceData.largeImageKey = `${TMDB_IMG}${posterPath}`
      }
    }
    catch {
      presenceData.details = 'Watching Cinejoy'
    }
  }
  else {
    const pageInfo = getStaticPageInfo()
    presenceData.details = pageInfo.details
    if (pageInfo.state) {
      presenceData.state = pageInfo.state
    }
  }

  if (video && video.readyState > 0) {
    presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
    presenceData.smallImageText = video.paused ? 'Paused' : 'Playing'

    if (!video.paused && Number.isFinite(video.duration)) {
      [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(video)
    }
  }

  presence.setActivity(presenceData)
})
