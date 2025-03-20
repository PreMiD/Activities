import { getTimestamps } from './getTimestamps.js'

/**
 * Gets timestamps from an HTML media element (audio or video)
 * @param {HTMLMediaElement} media The media element to get timestamps from (works with both <audio> and <video> elements)
 * @returns {[number, number]} Array containing [startTimestamp, endTimestamp] as Unix timestamps in seconds
 */
export function getTimestampsFromMedia(
  media: HTMLMediaElement,
): [startTimestamp: number, endTimestamp: number] {
  //* Return early if media is not loaded or has no duration
  if (media.readyState === 0 || !Number.isFinite(media.duration))
    return [0, 0]

  return getTimestamps(media.currentTime, media.duration)
}
