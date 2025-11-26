import { ActivityType, Assets, StatusDisplayType } from 'premid'
import { ActivityAssets } from './constants.js'
import { RythmDataGetter } from './dataGetter.js'
import { updateSongTimesTamps } from './utils.js'

const presence = new Presence({
  clientId: '463151177836658699',
})

const dataGetter = new RythmDataGetter()

presence.on('UpdateData', async () => {
  const mediaData = dataGetter.getMediaData()
  const hidePaused = await presence.getSetting<boolean>('hidePaused')
  const privacyMode = await presence.getSetting<boolean>('privacy')
  const largeImage = await presence.getSetting<number>('largeImage')
  const hideTimesTamps = await presence.getSetting<boolean>('timesTamps')
  const displayType = await presence.getSetting<number>('displayType')
  const buttonType = await presence.getSetting<number>('buttonType')
  const isPlaying = dataGetter.isPlaying()
  const smallImageText = isPlaying ? 'Playing' : 'Paused'

const buttonStyle =
  buttonType === 0
    ? (isPlaying ? Assets.Play : Assets.Pause)
    : buttonType === 1
      ? (isPlaying ? ActivityAssets.LogoPlaying : ActivityAssets.LogoPaused)
      : buttonType === 2
        ? ActivityAssets.LogoPaused
        : buttonType === 3
          ? ActivityAssets.LogoPlaying
          : ActivityAssets.LogoPlaying

const largeImageStyle =
  largeImage === 0
    ? mediaData.artwork
    : largeImage === 1
      ? ActivityAssets.LogoPlaying
      : largeImage === 2
        ? ActivityAssets.LogoPaused
        : mediaData.artwork

  // status text display
  const stateText
    = displayType === 0
      ? StatusDisplayType.Details ?? undefined
      : displayType === 1
        ? StatusDisplayType.State ?? undefined
        : StatusDisplayType.Name

  // nothing playing or no title → clear presence
  if (mediaData.playbackState === 'none' || !mediaData.title || privacyMode) {
    return presence.clearActivity()
  }

  if (hidePaused && mediaData.playbackState === 'paused') {
    return presence.clearActivity()
  }

  const presenceData: PresenceData = {

    type: ActivityType.Listening,
    largeImageKey: largeImageStyle,
    smallImageKey: buttonStyle,
    smallImageText: smallImageText,
    details: mediaData.title,
    detailsUrl: mediaData.trackUrl,
    state: mediaData.artist,
    stateUrl: mediaData.artistUrl,
    largeImageUrl: mediaData.trackUrl,
    statusDisplayType: stateText,
  }

  // temp cotroller
  if (isPlaying && !hideTimesTamps) {
    const [start, end] = updateSongTimesTamps(dataGetter)

    if (start !== 0 && end !== 0) {
      presenceData.startTimestamp = start
      presenceData.endTimestamp = end
    }
  }

  return presence.setActivity(presenceData)
})
