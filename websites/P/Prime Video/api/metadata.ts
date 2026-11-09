import type { PlaybackMetadata, PlaybackRequest } from '../config/types.js'
import { RETRY_DELAY_MS, SCHEDULE_REFRESH_MS } from '../config/constants.js'
import { fetchLiveSchedule, findCurrentAiring } from './liveSchedule.js'
import { fetchChromeResources, getCurrentPlayback } from './playback.js'

const metadataCache = new Map<string, PlaybackMetadata>()
const pendingMetadata = new Map<string, Promise<PlaybackMetadata | null>>()
const failedAt = new Map<string, number>()

async function fetchPlaybackMetadata(playback: PlaybackRequest): Promise<PlaybackMetadata | null> {
  const { gti } = playback

  try {
    const catalogResource = (await fetchChromeResources(playback, 'catalogMetadataV2'))?.catalogMetadataV2
    const catalog = catalogResource?.catalog
    if (!catalog?.title)
      throw new Error('Catalog is empty')

    const metadata: PlaybackMetadata = {
      type: catalog.type,
      title: catalog.title,
      seriesTitle: catalog.seriesTitle,
      seasonNumber: catalog.seasonNumber,
      episodeNumber: catalog.episodeNumber,
      eventTitle: catalog.eventTitle,
      image: catalogResource?.images?.coverImage ?? catalogResource?.images?.heroImage,
      fetchedAt: Date.now(),
    }

    // Live TV channel: the guide provides the current program
    if (catalog.type === 'STATION') {
      try {
        metadata.schedule = await fetchLiveSchedule(playback)
      }
      catch {
        // Keep the channel name at least; the guide will be retried after a delay
        failedAt.set(gti, Date.now())
      }
    }

    metadataCache.set(gti, metadata)
    return metadata
  }
  catch {
    failedAt.set(gti, Date.now())
    return null
  }
}

// A live guide is refreshed when it no longer covers the current program or after a certain time
function needsRefresh(metadata: PlaybackMetadata): boolean {
  if (metadata.type !== 'STATION')
    return false

  return !findCurrentAiring(metadata.schedule) || Date.now() - metadata.fetchedAt > SCHEDULE_REFRESH_MS
}

// True while the metadata of the current playback is being fetched for the first time
export function isMetadataLoading(): boolean {
  const playback = getCurrentPlayback()
  return !!playback && !metadataCache.has(playback.gti) && pendingMetadata.has(playback.gti)
}

/**
 * Non-blocking: returns the cached metadata (even stale, e.g. an old guide) and starts the fetch in the
 * background when needed. `null` until the first fetch completes (see `isMetadataLoading`).
 */
export function getPlaybackMetadata(): PlaybackMetadata | null {
  const playback = getCurrentPlayback()
  if (!playback)
    return null

  const cached = metadataCache.get(playback.gti)
  if (cached && !needsRefresh(cached))
    return cached

  if (Date.now() - (failedAt.get(playback.gti) ?? 0) < RETRY_DELAY_MS)
    return cached ?? null

  if (!pendingMetadata.has(playback.gti)) {
    pendingMetadata.set(
      playback.gti,
      fetchPlaybackMetadata(playback).finally(() => pendingMetadata.delete(playback.gti)),
    )
  }

  return cached ?? null
}
