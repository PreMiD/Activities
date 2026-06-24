import type { MediaDataGetter } from './dataGetter.js'
import { getTimestamps, timestampFromFormat } from 'premid'

export function updateSongTimesTamps(
  dataGetter: MediaDataGetter,
): [number, number] {
  const time = dataGetter.getCurrentAndTotalTime()

  if (!time)
    return [0, 0]

  const [currentText, totalText] = time

  if (!currentText || !totalText)
    return [0, 0]

  const currentSeconds = timestampFromFormat(currentText)
  const totalSeconds = timestampFromFormat(totalText)

  if (Number.isNaN(currentSeconds) || Number.isNaN(totalSeconds))
    return [0, 0]

  return getTimestamps(currentSeconds, totalSeconds)
}
