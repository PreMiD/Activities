import type { MediaData, MediaDataGetter } from './dataGetter.js'
import type { Strings } from './i18n.js'
import type { Settings } from './utils.js'
import { ActivityType, Assets, StatusDisplayType } from 'premid'
import { ActivityAssets } from './constants.js'

export function createListeningPresence(
  mediaData: MediaData,
  dataGetter: MediaDataGetter,
  settings: Settings,
  watchID: string | undefined,
  repeatMode: string | null,
  listeningStartTimestamp: number,
  strings: Strings,
): PresenceData {
  const {
    showButtons,
    showTimestamps,
    showCover,
    displayType,
  } = settings

  const albumArtistBtnLink = dataGetter.getAlbumArtistLink()
  const artistLink = dataGetter.getArtistLink()
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
    largeImageKey: showCover
      ? mediaData.artwork ?? ActivityAssets.Logo
      : ActivityAssets.Logo,
    details: mediaData.title,
    state: mediaData.artist,
  }

  if (settings.links) {
    presenceData.detailsUrl = `https://music.youtube.com/watch?v=${watchID}`
    if (albumArtistBtnLink) {
      presenceData.largeImageUrl = albumArtistBtnLink
    }
    if (artistLink) {
      presenceData.stateUrl = artistLink
    }
  }

  switch (displayType) {
    case 1:
      presenceData.statusDisplayType = StatusDisplayType.State
      break
    case 2:
      presenceData.statusDisplayType = StatusDisplayType.Details
      break
  }

  if (mediaData.album) {
    presenceData.largeImageText = mediaData.album
  }

  if (showButtons) {
    presenceData.buttons = buttons
  }

  if (mediaData.playbackState === 'paused') {
    presenceData.smallImageKey = Assets.Pause
    presenceData.smallImageText = strings.paused
  }
  else if (repeatMode && repeatMode !== 'NONE') {
    presenceData.smallImageKey = repeatMode === 'ONE'
      ? Assets.RepeatOne
      : Assets.Repeat

    presenceData.smallImageText = repeatMode === 'ONE'
      ? strings.onLoop
      : strings.playlistOnLoop
  }
  else {
    presenceData.smallImageKey = Assets.Play
    presenceData.smallImageText = strings.playing
  }

  if (showTimestamps) {
    presenceData.startTimestamp = listeningStartTimestamp
  }

  return presenceData
}
