import type { RequestData, TimelineState } from '../config/types.js'
import { supports, timestampFromFormat } from 'premid'
import {
  DURATION_TOLERANCE_S,
  ENABLE_TIMELINE_CORRECTION,
  MAX_TIMELINE_OFFSET_S,
  MAX_TITLE_ADS_S,
  MAX_TRACKED_TITLES,
  PLAYBACK_PATH_REGEX,
  REQUEST_EVENT,
  TRACKED_REQUEST_REGEX,
  UPDATE_SESSION_PATH_REGEX,
  VIDEO_ADS_PATH_REGEX,
} from '../config/constants.js'
import { findPlayerVideo } from '../page/dom.js'
import { injectFetchForwarder } from './fetchForwarder.js'

/*
 * Builds the timeline state from the player requests:
 * - `Get*PlaybackResources` response: playlist (intro jingle, ad break points) and title duration
 * - `/cdp/getVideoAds` response: duration of each ad cut
 * - `UpdateSession` request: watched position (VOD) or real time (live)
 * Requests come from `onRequest` (extension 2.14+), otherwise from a minimal fetch forwarder injected into the page.
 */

// Titles by playback request (oldest first): the player can prefetch one that is played later
const titles = new Map<string, TimelineState>()
// An ad cut can be answered before or after the playlist that references it
const adDurations = new Map<string, number>()
let activeTitle: string | null = null

function parseIsoDuration(value: unknown): number | null {
  const match = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:([\d.]+)S)?$/.exec(String(value))
  return match ? Number(match[1] ?? 0) * 3600 + Number(match[2] ?? 0) * 60 + Number(match[3] ?? 0) : null
}

function parseJson(text: string | null): any {
  try {
    return text ? JSON.parse(text) : null
  }
  catch {
    return null
  }
}

function getAdMarker(text?: string): string | null {
  return /adMarkerId=([^&]+)/.exec(text ?? '')?.[1] ?? null
}

/**
 * Title played by the video: the most recent one whose duration fits (the video also contains its ads).
 * Without duration to compare (live, not loaded yet): the last requested.
 */
function findActiveTitle(): string | null {
  const ids = [...titles.keys()].reverse()
  const video = findPlayerVideo()

  if (video && Number.isFinite(video.duration)) {
    const match = ids.find((gti) => {
      const { full } = titles.get(gti)!
      return full !== null && video.duration - full >= -DURATION_TOLERANCE_S && video.duration - full <= MAX_TITLE_ADS_S
    })
    if (match)
      return match
  }

  return ids[0] ?? null
}

function updateActiveTitle(): void {
  activeTitle = findActiveTitle()
}

function parsePlaylist(result: any): Pick<TimelineState, 'intro' | 'full' | 'breaks'> | null {
  const playlist = result?.playbackUrls?.intraTitlePlaylist
  if (!Array.isArray(playlist))
    return null

  // Position (s) in the video timeline without ads
  let position = 0
  let intro = 0
  let seenMain = false
  const breaks: TimelineState['breaks'] = []

  for (const item of playlist) {
    if (!item)
      continue

    if (item.type === 'Remote') {
      const marker = getAdMarker(item.urlsInPriorityOrder?.[0])
      breaks.push({ cue: position, marker, a: marker ? adDurations.get(marker) ?? 0 : 0 })
      continue
    }

    if (typeof item.startMs === 'number' && typeof item.endMs === 'number') {
      if (!seenMain && item.type !== 'Main')
        intro += (item.endMs - item.startMs) / 1000
      position = item.endMs / 1000
    }
    if (item.type === 'Main')
      seenMain = true
  }

  const full = /"fullTitleDurationMs":(\d+)/.exec(JSON.stringify(result))
  return { intro, breaks, full: full ? Number(full[1]) / 1000 : null }
}

function onPlayback(url: string, json: any): void {
  const gti = new URL(url, location.href).searchParams.get('titleId')
  if (!gti)
    return

  titles.delete(gti)
  titles.set(gti, { gti, intro: 0, full: null, breaks: [], anchor: null, live: null, ...parsePlaylist(json?.vodPlaylistedPlaybackUrls?.result) })
  if (titles.size > MAX_TRACKED_TITLES)
    titles.delete(titles.keys().next().value!)

  updateActiveTitle()
}

function onAds(url: string, json: any): void {
  const marker = getAdMarker(url)
  if (!marker || !Array.isArray(json?.playlist))
    return

  const duration = json.playlist.reduce((total: number, ad: any) => total + timestampFromFormat(ad?.description?.duration?.split('.')[0]), 0)
  adDurations.set(marker, duration)

  for (const { breaks } of titles.values()) {
    for (const item of breaks) {
      if (item.marker === marker)
        item.a = duration
    }
  }
}

function onUpdateSession(info: any): void {
  updateActiveTitle()

  const progress = info?.streamInfo
  const video = findPlayerVideo()
  const state = activeTitle ? titles.get(activeTitle) : undefined
  if (!progress || !video || !state)
    return

  // Live: real server-clock time of the watched point
  if (progress.liveProgressInfo) {
    const time = Date.parse(progress.liveProgressInfo.currentProgressTime)
    if (!Number.isNaN(time))
      state.live = { ct: video.currentTime, t: time, src: video.currentSrc }
    return
  }

  // VOD: position within the content
  const position = parseIsoDuration(progress.vodProgressInfo?.currentProgressTime)
  if (position === null)
    return

  const gap = video.currentTime - position
  if (gap >= 0 && gap <= MAX_TIMELINE_OFFSET_S)
    state.anchor = { ct: video.currentTime, cp: position }
}

function trackRequest({ url, requestBody, responseBody }: RequestData): void {
  if (PLAYBACK_PATH_REGEX.test(url))
    onPlayback(url, parseJson(responseBody))
  else if (VIDEO_ADS_PATH_REGEX.test(url))
    onAds(url, parseJson(responseBody))
  else if (UPDATE_SESSION_PATH_REGEX.test(url))
    onUpdateSession(parseJson(requestBody))
}

export function getActiveTitleId(): string | null {
  return activeTitle
}

export function getTimelineState(gti: string): TimelineState | null {
  return titles.get(gti) ?? null
}

export function startTimelineTracking(presence: Presence): void {
  if (!ENABLE_TIMELINE_CORRECTION)
    return

  // Starting a prefetched title (e.g. "Resume" on a detail page) makes no request: the video changes
  for (const type of ['play', 'loadedmetadata', 'durationchange'])
    document.addEventListener(type, updateActiveTitle, true)

  if (supports(presence, 'onRequest')) {
    presence.onRequest({ url: TRACKED_REQUEST_REGEX }, trackRequest)
    return
  }

  document.addEventListener(REQUEST_EVENT, event => trackRequest(JSON.parse((event as CustomEvent<string>).detail)))
  injectFetchForwarder()
}
