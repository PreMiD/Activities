import { Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '1534742028368347156',
})

const TMDB_KEY = '8476a7ab80ad76f0936744df0430e67c'
const TMDB_IMG = 'https://image.tmdb.org/t/p/w500'

enum ActivityAssets {
  Logo = 'https://cinejoy.to/favicon.ico',
}

function parsePath() {
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

  const parsed = parsePath()
  const video = document.querySelector('video')

  if (parsed) {
    try {
      const data = await getTmdbDetails(parsed.type, parsed.tmdbId)
      const title = data.title ?? data.name ?? 'Unknown'
      const posterPath = data.poster_path

      presenceData.details = title

      if (parsed.type === 'tv' && parsed.season && parsed.episode) {
        presenceData.state = `S${parsed.season}:E${parsed.episode}`
      }
      else if (parsed.type === 'movie' && data.release_date) {
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

  if (video && video.readyState > 0) {
    presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
    presenceData.smallImageText = video.paused ? 'Paused' : 'Playing'

    if (!video.paused && Number.isFinite(video.duration)) {
      [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(video)
    }
  }

  presence.setActivity(presenceData)
})
