import type { Options, Playback } from '../config/types.js'
import { Assets } from 'premid'
import { ActivityAssets } from '../config/constants.js'

/** Joins the distinct, non-empty parts of a status line, skipping names that repeat the show's title. */
export function distinctParts(title: string | undefined, parts: (string | undefined)[]): string {
  const seen = new Set<string>(title ? [title.toLowerCase()] : [])

  return parts
    .filter((part): part is string => Boolean(part))
    .filter((part) => {
      const key = part.toLowerCase()

      return seen.has(key) ? false : Boolean(seen.add(key))
    })
    .join(' • ')
}

/** Builds the home-page button and, when given, a second button to the current item. */
export function buildButtons(item?: ButtonData): [ButtonData, ButtonData?] {
  const home = {
    label: 'Storm Tempest',
    url: `${document.location.origin}/`,
  }

  return item ? [home, item] : [home]
}

/** Picks a play or pause icon while playback is known, else the site logo when artwork fills the large image. */
export function smallImageFor(
  playback: Playback | undefined,
  hasArtwork: boolean,
): { smallImageKey?: string, smallImageText?: string } {
  if (playback) {
    return playback.paused
      ? { smallImageKey: Assets.Pause, smallImageText: 'Paused' }
      : { smallImageKey: Assets.Play, smallImageText: 'Playing' }
  }

  return hasArtwork
    ? { smallImageKey: ActivityAssets.Logo, smallImageText: 'Storm Tempest' }
    : {}
}

/** Whether `key` is one of this presence's own icons rather than a title cover or teacher photo. */
export function isOwnAsset(key: unknown): boolean {
  return Object.values(ActivityAssets).includes(key as ActivityAssets)
}

/** Drops the buttons, cover or timestamps from `data` according to the user's settings. */
export function applyOptions(data: PresenceData, options: Options): PresenceData {
  const result = { ...data }

  if (!options.buttons) {
    delete result.buttons
  }

  if (!options.cover && result.largeImageKey && !isOwnAsset(result.largeImageKey)) {
    result.largeImageKey = ActivityAssets.Logo
  }

  if (!options.time) {
    delete result.startTimestamp
    delete result.endTimestamp
  }

  return result
}
