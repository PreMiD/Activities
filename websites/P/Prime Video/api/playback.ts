import type { PlaybackRequest } from '../config/types.js'
import { FORWARDED_PARAMS, MAX_TRACKED_TITLES, PLAYBACK_PATH_REGEX, PLAYER_CHROME_PATH } from '../config/constants.js'
import { getActiveTitleId } from '../player/timelineTracker.js'

/**
 * The player calls `Get*PlaybackResources?titleId=<gti>` on each playback start (resume, autoplay,
 * channel change...). Since the Performance buffer fills quickly with video segments,
 * a PerformanceObserver (restarted with `buffered`) keeps the most recent playback requests.
 */
const playbackRequests = new Map<string, PlaybackRequest>()
let latestPlayback: PlaybackRequest | null = null

/**
 * The title played is not always the last requested: a detail page prefetches the trailer and the episode
 * to resume, and "Resume" makes no new request. The timeline tracker tells which one the video plays.
 */
export function getCurrentPlayback(): PlaybackRequest | null {
  const activeGti = getActiveTitleId()
  if (!activeGti || activeGti === latestPlayback?.gti)
    return latestPlayback

  const request = playbackRequests.get(activeGti)
  if (request)
    return request

  // The other parameters (device, locale...) are the same for all requests
  return latestPlayback && { ...latestPlayback, gti: activeGti }
}

function trackPlaybackRequest(entry: PerformanceEntry): void {
  if (!PLAYBACK_PATH_REGEX.test(entry.name))
    return

  try {
    const url = new URL(entry.name)
    const gti = url.searchParams.get('titleId')

    // Entries are published at the end of the request: ignore an older request
    // that would finish after a newer one.
    if (!gti)
      return

    const previous = playbackRequests.get(gti)
    if (previous && entry.startTime < previous.startTime)
      return

    const request = { gti, origin: url.origin, params: url.searchParams, startTime: entry.startTime }
    playbackRequests.set(gti, request)
    if (playbackRequests.size > MAX_TRACKED_TITLES)
      playbackRequests.delete(playbackRequests.keys().next().value!)

    if (!latestPlayback || entry.startTime >= latestPlayback.startTime)
      latestPlayback = request
  }
  catch {
    // Invalid URL: ignore the entry
  }
}

new PerformanceObserver(list => list.getEntries().forEach(trackPlaybackRequest))
  .observe({ type: 'resource', buffered: true })

// Same API as the player overlay: `catalogMetadataV2`, `stationAiringsAndRestrictions`...
export async function fetchChromeResources({ gti, origin, params }: PlaybackRequest, resources: string): Promise<any> {
  const url = new URL(PLAYER_CHROME_PATH, origin)
  for (const key of FORWARDED_PARAMS) {
    const value = params.get(key)
    if (value)
      url.searchParams.set(key, value)
  }
  url.searchParams.set('desiredResources', resources)
  url.searchParams.set('entityId', gti)
  url.searchParams.set('widgetScheme', 'pvplayer-web-v6')

  const response = await fetch(url, { credentials: 'include' })
  if (!response.ok)
    throw new Error(`HTTP ${response.status}`)

  return (await response.json())?.resources
}
