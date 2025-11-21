import { ActivityType, Assets, StatusDisplayType } from 'premid'
import { ActivityAssets } from './constants.js'
import { RythmDataGetter } from './dataGetter.js'
import { updateSongTimesTamps } from './utils.js'

const presence = new Presence({
  clientId: '463151177836658699',
})

const dataGetter = new RythmDataGetter()

presence.on('UpdateData', () => {
  const mediaData = dataGetter.getMediaData()

  // nada tocando ou sem título → limpa presença
  if (mediaData.playbackState === 'none' || !mediaData.title) {
    return presence.clearActivity()
  }

  const isPlaying = dataGetter.isPlaying()

  const presenceData: PresenceData = {
    type: ActivityType.Listening,
    largeImageKey: mediaData.artwork || ActivityAssets.Logo,
    smallImageKey: isPlaying ? Assets.Play : Assets.Pause,
    details: mediaData.title,
    state: mediaData.artist || undefined,
    statusDisplayType: StatusDisplayType.Details,
  }

  // controle de tempo
  if (isPlaying) {
    const [start, end] = updateSongTimesTamps(dataGetter)

    if (start !== 0 && end !== 0) {
      presenceData.startTimestamp = start
      presenceData.endTimestamp = end
    }
  }

  return presence.setActivity(presenceData)
})
