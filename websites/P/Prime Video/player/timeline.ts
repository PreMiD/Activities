import type { TimelineInfo, TimelineState } from '../config/types.js'
import { getCurrentPlayback } from '../api/playback.js'
import { DEFAULT_LIVE_LAG_MS, MAX_TIMELINE_OFFSET_S } from '../config/constants.js'
import { getTimelineState } from './timelineTracker.js'

/*
 * The player inserts non-content elements into the video timeline: the Prime Video intro jingle (~6 s)
 * and ads. `currentTime` and `duration` are therefore ahead of the real position.
 * The required state (playlist, ad durations, positions reported by Amazon) is built from the player
 * requests (see timelineTracker.ts); this module derives the real position from it.
 */

function getCurrentTimelineState(): TimelineState | null {
  const gti = getCurrentPlayback()?.gti
  return gti ? getTimelineState(gti) : null
}

// Duration (s) of off-content elements before `currentTime`: intro jingle + ad cuts
// past or in progress (in progress: only the already-played part counts; the content position is frozen).
export function computeTimelineOffset(state: TimelineState, currentTime: number): { offset: number, inAd: boolean } {
  let ads = 0
  let inAd = false

  for (const { cue, a } of state.breaks) {
    if (!(a > 0))
      continue

    const start = cue + ads
    if (currentTime >= start + a) {
      ads += a
    }
    else {
      if (currentTime > start) {
        ads += currentTime - start
        inAd = true
      }
      break
    }
  }

  return { offset: state.intro + ads, inAd }
}

// Real content position and duration (VOD). Without usable state: raw `currentTime` and `duration`.
export function getTimelineInfo(video: HTMLVideoElement): TimelineInfo {
  const fallback = { position: video.currentTime, duration: video.duration, inAd: false }

  const state = getCurrentTimelineState()
  if (!state)
    return fallback

  const current = computeTimelineOffset(state, video.currentTime)
  let offset = current.offset

  // The last known position reported by Amazon wins if it contradicts the calculation
  // (e.g. an ad break ignored by the player when resuming later)
  if (state.anchor) {
    const calibration = (state.anchor.ct - state.anchor.cp) - computeTimelineOffset(state, state.anchor.ct).offset
    if (Math.abs(calibration) <= MAX_TIMELINE_OFFSET_S)
      offset += calibration
  }

  if (!(offset >= 0 && offset <= MAX_TIMELINE_OFFSET_S))
    return fallback
  offset = Math.min(offset, video.currentTime)

  const position = video.currentTime - offset
  // `full` = title duration without ads (including the intro jingle); otherwise, `duration` minus the known ads
  const totalAds = state.breaks.reduce((total, item) => total + item.a, 0)
  const total = (state.full ?? video.duration - totalAds) - state.intro
  const duration = total > position && total <= video.duration ? total : video.duration - offset

  return { position, duration, inAd: current.inAd }
}

/**
 * Live TV: server-clock time (ms) of the point actually being watched. The stream lags behind live
 * (more so after a pause or scrubbing) while the program schedule reflects the live time. Amazon sends
 * this time on each play, pause, seek, then every ~180 s; `currentTime` then advances at the same rate.
 * Before the first measurement: estimate.
 */
export function getLiveViewerTime(video: HTMLVideoElement, clockOffset: number): number {
  const live = getCurrentTimelineState()?.live

  // The measurement is tied to the active video stream (`<video>` tag)
  if (live && live.src === video.currentSrc)
    return live.t + (video.currentTime - live.ct) * 1000

  return Date.now() + clockOffset - DEFAULT_LIVE_LAG_MS
}
