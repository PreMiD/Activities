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
  listeningStartTimestamp = 0
  videoListenerTarget: HTMLMediaElement | null = null
  dataGetter = new YouTubeMusicDataGetter()
}

const state = new PresenceState()

const timestampEvents = ['seeked', 'play', 'loadedmetadata', 'durationchange', 'ratechange'] as const

function updateTimestamps() {
  state.mediaTimestamps = updateSongTimestamps(state.dataGetter)
}

// Re-attaches if the player swaps its media element.
function attachVideoListeners(videoElement: HTMLMediaElement) {
  if (state.videoListenerTarget === videoElement)
    return

  detachVideoListeners()
  for (const event of timestampEvents)
    videoElement.addEventListener(event, updateTimestamps)

  state.videoListenerTarget = videoElement
}

function detachVideoListeners() {
  state.prevTitleAuthor = ''
  for (const event of timestampEvents)
    state.videoListenerTarget?.removeEventListener(event, updateTimestamps)
  state.videoListenerTarget = null
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

    if (!mediaData.title) {
      return
    }

    if (state.dataGetter.isAdPlaying()) {
      return presence.setActivity({
        type: ActivityType.Listening,
        largeImageKey: ActivityAssets.Logo,
        details: strings.listeningToSong,
      })
    }

    if (!state.listeningStartTimestamp) {
      state.listeningStartTimestamp = Math.floor(Date.now() / 1000)
    }

    const currentMediaIdentifier = createMediaIdentifier(
      mediaData.title,
      mediaData.artist,
      watchID,
    )

    // If timestamps aren't readable yet, still show the song and retry them next update.
    if (state.prevTitleAuthor !== currentMediaIdentifier) {
      state.mediaTimestamps = updateSongTimestamps(state.dataGetter)

      if (state.mediaTimestamps[0] !== state.mediaTimestamps[1])
        state.prevTitleAuthor = currentMediaIdentifier
    }

    presenceData = createListeningPresence(
      mediaData,
      state.dataGetter,
      settings,
      watchID,
      repeatMode,
      state.mediaTimestamps,
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
