import { ActivityType } from 'premid'
import { createBrowsingPresence } from './browsingPresence.js'
import { ActivityAssets } from './constants.js'
import { YouTubeMusicDataGetter } from './dataGetter.js'
import { stringMap } from './i18n.js'
import { createListeningPresence } from './listeningPresence.js'
import { createMediaIdentifier, getSettings, updateSongTimestamps } from './utils.js'

const presence = new Presence({
  clientId: '463151177836658699',
})

class PresenceState {
  prevTitleAuthor = ''
  mediaTimestamps: [number, number] = [0, 0]
  oldPath = ''
  startTimestamp = 0
  videoListenerAttached = false
  dataGetter = new YouTubeMusicDataGetter()
}

const state = new PresenceState()

function attachVideoListeners(videoElement: HTMLMediaElement) {
  if (state.videoListenerAttached)
    return

  const updateTimestamps = () => {
    state.mediaTimestamps = updateSongTimestamps(state.dataGetter)
  }

  videoElement.addEventListener('seeked', updateTimestamps)
  videoElement.addEventListener('play', updateTimestamps)

  state.videoListenerAttached = true
}

function detachVideoListeners() {
  state.prevTitleAuthor = ''
  state.videoListenerAttached = false
}

presence.on('UpdateData', async () => {
  const { pathname, search, href } = document.location
  const settings = await getSettings(presence)
  const strings = await presence.getStrings(stringMap)

  const mediaData = state.dataGetter.getMediaData()
  const watchID = state.dataGetter.getWatchId()
  const repeatMode = state.dataGetter.getRepeatMode()
  const videoElement = state.dataGetter.getVideoElement()

  if (videoElement && !settings.privacyMode) {
    attachVideoListeners(videoElement)
  }
  else {
    detachVideoListeners()
  }

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

    if (!mediaData.title || Number.isNaN(videoElement?.duration ?? Number.NaN)) {
      return
    }

    const currentTimeText = document
      .querySelector<HTMLSpanElement>('#left-controls > span')
      ?.textContent
      ?.trim()

    const currentMediaIdentifier = createMediaIdentifier(
      mediaData.title,
      mediaData.artist,
      currentTimeText,
    )

    if (state.prevTitleAuthor !== currentMediaIdentifier) {
      state.mediaTimestamps = updateSongTimestamps(state.dataGetter)

      if (state.mediaTimestamps[0] === state.mediaTimestamps[1]) {
        return
      }

      state.prevTitleAuthor = currentMediaIdentifier
    }

    presenceData = createListeningPresence(
      mediaData,
      state.dataGetter,
      settings,
      watchID,
      repeatMode,
      state.mediaTimestamps,
      strings,
    )
  }
  else if (settings.showBrowsing) {
    if (state.oldPath !== pathname) {
      state.oldPath = pathname
      state.startTimestamp = Math.floor(Date.now() / 1000)
    }

    presenceData = createBrowsingPresence(pathname, search, href, state.startTimestamp, strings, settings.privacyMode)
  }

  presence.setActivity(presenceData)
})
