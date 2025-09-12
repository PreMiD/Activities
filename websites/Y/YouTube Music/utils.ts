import type { MediaDataGetter } from './dataGetter.js'
import { getTimestamps, timestampFromFormat } from 'premid'

export interface Settings {
  showButtons: boolean
  showTimestamps: boolean
  showCover: boolean
  hidePaused: boolean
  showBrowsing: boolean
  privacyMode: boolean
  showAsListening: boolean
}

export function updateSongTimestamps(
  dataGetter: MediaDataGetter,
): [number, number] {
  const times = dataGetter.getCurrentAndTotalTime()

  if (!times) {
    return [0, 0]
  }

  const [currTimes, totalTimes] = times

  if (currTimes && totalTimes) {
    return getTimestamps(
      timestampFromFormat(currTimes),
      timestampFromFormat(totalTimes),
    )
  }

  return [0, 0]
}

export function createMediaIdentifier(
  title?: string,
  artist?: string,
  timeText?: string,
): string {
  return `${title || ''}${artist || ''}${timeText || ''}`
}

export async function getSettings(presence: Presence): Promise<Settings> {
  const [
    showButtons,
    showTimestamps,
    showCover,
    hidePaused,
    showBrowsing,
    privacyMode,
    showAsListening,
  ] = await Promise.all([
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('timestamps'),
    presence.getSetting<boolean>('cover'),
    presence.getSetting<boolean>('hidePaused'),
    presence.getSetting<boolean>('browsing'),
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('showAsListening'),
  ])

  return {
    showButtons,
    showTimestamps,
    showCover,
    hidePaused,
    showBrowsing,
    privacyMode,
    showAsListening,
  }
}
