import type { LiveAiring, LiveSchedule, PlaybackRequest } from '../config/types.js'
import { fetchChromeResources } from './playback.js'

// API images look like [{ key: 'BACKGROUND', value: [{ localizedImage: { imageUrl } }] }]
function pickImage(images: any[] | undefined, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const url = images?.find(image => image.key === key)?.value?.[0]?.localizedImage?.imageUrl
    if (url)
      return url
  }
  return undefined
}

// Program guide for a channel (≈ ±6 h around now)
export async function fetchLiveSchedule(playback: PlaybackRequest): Promise<LiveSchedule> {
  const requestedAt = Date.now()
  const station = (await fetchChromeResources(playback, 'stationAiringsAndRestrictions'))?.stationAiringsAndRestrictions

  // `airingAttributes: ['NOW']` is present on all programs: only the times are reliable
  const airings: LiveAiring[] = (station?.linearAirings ?? [])
    .map((airing: any): LiveAiring => {
      const parents: any[] = airing.program?.parentDetails ?? []
      const series = parents.find(parent => parent.parentType === 'SERIES')
      const season = parents.find(parent => parent.parentType === 'SEASON')

      return {
        title: airing.program?.title?.value,
        seriesTitle: series?.title?.value,
        // SERIES.childNumber = season number, SEASON.childNumber = episode number
        seasonNumber: series?.childNumber,
        episodeNumber: season?.childNumber,
        startTime: airing.startTime,
        endTime: airing.endTime,
        image: pickImage(airing.program?.images, 'BACKGROUND', 'CAROUSEL'),
      }
    })
    .filter((airing: LiveAiring) => airing.title && airing.startTime && airing.endTime)

  if (!airings.length)
    throw new Error('Guide is empty')

  return {
    airings,
    clockOffset: typeof station?.now === 'number' ? station.now - requestedAt : 0,
    stationLogo: pickImage(station?.station?.images, 'LOGO'),
  }
}

// `viewerTime`: server-clock time of the point being watched, behind live; otherwise, now
export function findCurrentAiring(schedule?: LiveSchedule, viewerTime?: number): LiveAiring | undefined {
  if (!schedule)
    return undefined

  const now = viewerTime ?? Date.now() + schedule.clockOffset
  return schedule.airings.find(airing => airing.startTime <= now && now < airing.endTime)
}
