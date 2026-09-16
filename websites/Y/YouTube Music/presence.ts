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
  attachedVideoElement: HTMLMediaElement | null = null
  updateTimestampsHandler: (() => void) | null = null
  dataGetter = new YouTubeMusicDataGetter()
}

const state = new PresenceState()

function attachVideoListeners(videoElement: HTMLMediaElement) {
  if (state.attachedVideoElement === videoElement)
    return

  detachVideoListeners()

  const updateTimestamps = () => {
    state.mediaTimestamps = updateSongTimestamps(state.dataGetter)
  }
  videoElement.addEventListener('seeked', updateTimestamps)
  videoElement.addEventListener('play', updateTimestamps)

  state.attachedVideoElement = videoElement
  state.updateTimestampsHandler = updateTimestamps
}

function detachVideoListeners() {
  if (state.attachedVideoElement && state.updateTimestampsHandler) {
    state.attachedVideoElement.removeEventListener('seeked', state.updateTimestampsHandler)
    state.attachedVideoElement.removeEventListener('play', state.updateTimestampsHandler)
  }
  state.attachedVideoElement = null
  state.updateTimestampsHandler = null
  state.prevTitleAuthor = ''
}

function tryShowBrowsing(
  settings: Awaited<ReturnType<typeof getSettings>>,
  pathname: string,
  search: string,
  href: string,
  strings: Awaited<ReturnType<typeof presence.getStrings>>,
) {
  if (!settings.showBrowsing)
    return false

  if (state.oldPath !== pathname) {
    state.oldPath = pathname
    state.startTimestamp = Math.floor(Date.now() / 1000)
  }

  presence.setActivity(
    createBrowsingPresence(pathname, search, href, state.startTimestamp, strings, settings.privacyMode),
  )
  return true
}

presence.on('UpdateData', async () => {
  const { pathname, search, href } = document.location
  const [settings, strings] = await Promise.all([
    getSettings(presence),
    presence.getStrings(stringMap),
  ])
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

  if (!videoElement) {
    if (tryShowBrowsing(settings, pathname, search, href, strings))
      return

    state.prevTitleAuthor = ''
    return presence.clearActivity()
  }

  if (settings.hidePaused && mediaData.playbackState !== 'playing') {
    return presence.clearActivity()
  }

  if (['playing', 'paused'].includes(mediaData.playbackState)) {
    if (settings.privacyMode) {
      return presence.setActivity({
        type: ActivityType.Listening,
        largeImageKey: ActivityAssets.Logo,
        details: strings.listeningToSong,
      })
    }

    if (!mediaData.title || Number.isNaN(videoElement.duration)) {
      state.prevTitleAuthor = ''
      return presence.clearActivity()
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
        state.prevTitleAuthor = ''
        return presence.clearActivity()
      }
      state.prevTitleAuthor = currentMediaIdentifier
    }

    return presence.setActivity(
      createListeningPresence(
        mediaData,
        state.dataGetter,
        settings,
        watchID,
        repeatMode,
        state.mediaTimestamps,
        strings,
      ),
    )
  }

  state.prevTitleAuthor = ''

  if (tryShowBrowsing(settings, pathname, search, href, strings))
    return

  return presence.clearActivity()
})
