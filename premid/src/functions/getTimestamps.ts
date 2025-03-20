/**
 * Converts current media time and duration into Unix timestamps
 * @param {number} elementTime Current playback position in seconds
 * @param {number} elementDuration Total duration of the media in seconds
 * @returns {[number, number]} Array containing [startTimestamp, endTimestamp] as Unix timestamps in seconds
 */
export function getTimestamps(
  elementTime: number,
  elementDuration: number,
): [startTimestamp: number, endTimestamp: number] {
  const startTime = (Date.now() / 1000) - elementTime
  const endTime = startTime + elementDuration
  return [Math.floor(startTime), Math.floor(endTime)]
}
