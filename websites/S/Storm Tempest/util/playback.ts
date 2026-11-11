import type { Playback } from '../config/types.js'
import { getTimestamps } from 'premid'
import { isVisible } from './dom.js'

let iframePlayback: (Playback & { at: number }) | undefined

/** Remembers the playback state sent by the embedded player, stamped with the time it arrived. */
export function setIframePlayback(data: Playback): void {
  iframePlayback = { ...data, at: Date.now() }
}

/** Returns the first loaded, unfinished `<video>` element on the page. */
export function getVideo(): HTMLVideoElement | undefined {
  return Array.from(
    document.querySelectorAll<HTMLVideoElement>('video'),
  ).find(video => !video.ended && video.readyState > 0)
}

/** Whether `video` is in the viewport and big enough to be the main player rather than a preview. */
export function isMainPlayer(video: HTMLVideoElement): boolean {
  const rect = video.getBoundingClientRect()

  return (
    isVisible(video)
    && rect.bottom > 0
    && rect.top < window.innerHeight
    && rect.right > 0
    && rect.left < window.innerWidth
    && rect.width >= 200
    && rect.width >= window.innerWidth * 0.5
  )
}

/** Returns the page video's playback, or the embedded player's if it reported in the last 5 seconds. */
export function getPlayback(video: HTMLVideoElement | undefined): Playback | undefined {
  if (video) {
    return video
  }

  if (iframePlayback && Date.now() - iframePlayback.at < 5000) {
    return iframePlayback
  }

  return undefined
}

/** Builds start/end timestamps from `playback`, or none while it is paused or unknown. */
export function getPlaybackTimestamps(
  playback: Playback | undefined,
): {
  startTimestamp?: number
  endTimestamp?: number
} {
  if (
    !playback
    || playback.paused
    || playback.ended
    || !Number.isFinite(playback.duration)
    || playback.duration <= 0
    || !Number.isFinite(playback.currentTime)
  ) {
    return {}
  }

  const [startTimestamp, endTimestamp] = getTimestamps(
    Math.floor(playback.currentTime),
    Math.floor(playback.duration),
  )

  return {
    startTimestamp,
    endTimestamp,
  }
}
