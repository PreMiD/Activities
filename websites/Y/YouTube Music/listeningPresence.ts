import type { MediaData, MediaDataGetter } from './dataGetter.js'
import type { Strings } from './i18n.js'
import type { Settings } from './utils.js'
import { ActivityType, Assets } from 'premid'
import { ActivityAssets } from './constants.js'

export function createListeningPresence(
  mediaData: MediaData,
  dataGetter: MediaDataGetter,
  settings: Settings,
  watchID: string | undefined,
  repeatMode: string | null,
  mediaTimestamps: [number, number],
  strings: Strings,
): PresenceData {
  const {
    showButtons,
    showTimestamps,
    showCover,
    showAsListening,
  } = settings

  const albumArtistBtnLink = dataGetter.getAlbumArtistLink()
  const buttons: [ButtonData, ButtonData?] = [
    {
      label: strings.listenAlong,
      url: `https://music.youtube.com/watch?v=${watchID}`,
    },
  ]

  if (albumArtistBtnLink) {
    buttons.push({
      label: mediaData.album ? strings.viewAlbum : strings.viewArtist,
      url: albumArtistBtnLink,
    })
  }

  const presenceData: PresenceData = {
    type: ActivityType.Listening,
    name: showAsListening
      ? mediaData.title
      : 'YouTube Music',
    largeImageKey: showCover
      ? mediaData.artwork ?? ActivityAssets.Logo
      : ActivityAssets.Logo,
    details: mediaData.title,
    state: mediaData.artist,
  }

  if (mediaData.album) {
    presenceData.largeImageText = mediaData.album
  }

  if (showButtons) {
    presenceData.buttons = buttons
  }

  if (mediaData.playbackState === 'paused' || (repeatMode && repeatMode !== 'NONE')) {
    presenceData.smallImageKey = mediaData.playbackState === 'paused'
      ? Assets.Pause
      : repeatMode === 'ONE'
        ? Assets.RepeatOne
        : Assets.Repeat

    presenceData.smallImageText = mediaData.playbackState === 'paused'
      ? strings.paused
      : repeatMode === 'ONE'
        ? strings.onLoop
        : strings.playlistOnLoop
  }

  if (showTimestamps && mediaData.playbackState === 'playing') {
    presenceData.startTimestamp = mediaTimestamps[0]
    presenceData.endTimestamp = mediaTimestamps[1]
  }

  return presenceData
}
