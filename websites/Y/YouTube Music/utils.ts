import type { MediaDataGetter } from './dataGetter.js'
import { getTimestamps } from 'premid'

export interface Settings {
  showButtons: boolean
  showTimestamps: boolean
  showCover: boolean
  hidePaused: boolean
  showBrowsing: boolean
  privacyMode: boolean
  displayType: number
  links: boolean
  timestampType: number
}

export function updateSongTimestamps(
  dataGetter: MediaDataGetter,
): [number, number] {
  const times = dataGetter.getPlaybackTimes()

  if (!times) {
    return [0, 0]
  }

  return getTimestamps(Math.floor(times[0]), Math.floor(times[1]))
}

export function createMediaIdentifier(
  title?: string,
  artist?: string,
  watchId?: string,
): string {
  return `${title || ''}${artist || ''}${watchId || ''}`
}

export async function getSettings(presence: Presence): Promise<Settings> {
  const [
    showButtons,
    showTimestamps,
    showCover,
    hidePaused,
    showBrowsing,
    privacyMode,
    displayType,
    links,
    timestampType,
  ] = await Promise.all([
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('timestamps'),
    presence.getSetting<boolean>('cover'),
    presence.getSetting<boolean>('hidePaused'),
    presence.getSetting<boolean>('browsing'),
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<number>('displayType'),
    presence.getSetting<boolean>('links'),
    presence.getSetting<number>('timestampType'),
  ])

  return {
    showButtons,
    showTimestamps,
    showCover,
    hidePaused,
    showBrowsing,
    privacyMode,
    displayType,
    links,
    timestampType,
  }
}
