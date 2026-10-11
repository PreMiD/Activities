import { ActivityType } from 'premid'
import { createBrowsingPresence } from './browsingPresence.js'
import { ActivityAssets } from './constants.js'
import { YouTubeMusicDataGetter } from './dataGetter.js'
import { stringMap } from './i18n.js'
import { createListeningPresence } from './listeningPresence.js'
import { getSettings } from './utils.js'

const presence = new Presence({
  clientId: '463151177836658699',
})

class PresenceState {
  oldPath = ''
  startTimestamp = 0
  listeningStartTimestamp = 0
  dataGetter = new YouTubeMusicDataGetter()
}

const state = new PresenceState()

presence.on('UpdateData', async () => {
  const { pathname, search, href } = document.location
  const settings = await getSettings(presence)
  const strings = await presence.getStrings(stringMap)

  const mediaData = state.dataGetter.getMediaData()
  const watchID = state.dataGetter.getWatchId()
  const repeatMode = state.dataGetter.getRepeatMode()

  if (settings.hidePaused && mediaData.playbackState !== 'playing') {
    return presence.clearActivity()
  }

  let presenceData: PresenceData = {}

  if (['playing', 'paused'].includes(mediaData.playbackState)) {
    if (settings.privacyMode) {
      return presence.setActivity({
        type: ActivityType.Listening,
        largeImageKey: ActivityAssets.Logo,
        details: strings.listeningToSong,
      })
    }

    if (!mediaData.title) {
      return
    }

    if (!state.listeningStartTimestamp) {
      state.listeningStartTimestamp = Math.floor(Date.now() / 1000)
    }

    presenceData = createListeningPresence(
      mediaData,
      state.dataGetter,
      settings,
      watchID,
      repeatMode,
      state.listeningStartTimestamp,
      strings,
    )
  }
  else if (settings.showBrowsing) {
    state.listeningStartTimestamp = 0

    if (state.oldPath !== pathname) {
      state.oldPath = pathname
      state.startTimestamp = Math.floor(Date.now() / 1000)
    }

    presenceData = createBrowsingPresence(pathname, search, href, state.startTimestamp, strings, settings.privacyMode)
  }
  else {
    state.listeningStartTimestamp = 0
  }

  presence.setActivity(presenceData)
})
