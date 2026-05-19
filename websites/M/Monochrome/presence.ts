import { ActivityType, Assets, StatusDisplayType } from 'premid'

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/M/Monochrome/assets/logo.png',
}

const presence = new Presence({
  clientId: '1459594619972096248',
})

presence.on('UpdateData', async () => {
  const mediaElement = document.querySelector('audio')
  const hidePausedSetting = await presence.getSetting<boolean>('hidePaused')

  // Mirror YT Music: if hidePaused and not playing, clear — but only if media is ready.
  // During a track switch the audio element is briefly absent or has no duration,
  // so we return early (no clear) to avoid the flicker.
  if (hidePausedSetting) {
    if (!mediaElement || !Number.isFinite(mediaElement.duration))
      return
    if (mediaElement.paused)
      return presence.clearActivity()
  }

  // 1. DYNAMIC IMAGE LOGIC
  let currentLargeImage: string = ActivityAssets.Logo

  const artwork = navigator.mediaSession?.metadata?.artwork
  if (artwork && artwork.length > 0) {
    const coverUrl = artwork[artwork.length - 1]?.src
    if (coverUrl)
      currentLargeImage = coverUrl
  }

  // 2. INITIALIZE ACTIVITY DATA
  const presenceData: PresenceData = {
    type: ActivityType.Listening,
    largeImageKey: currentLargeImage,
    largeImageText: 'Listening on Monochrome',
  }

  // 3. TEXT STRATEGY (Browser Tab)
  const tabTitle = document.title || ''
  let separator = ''

  if (tabTitle.includes(' - '))
    separator = ' - '
  else if (tabTitle.includes(' • '))
    separator = ' • '

  const albumElement = document.querySelector('.album')
  if (albumElement?.matches('.details > .album'))
    presenceData.largeImageText = albumElement.textContent

  if (separator) {
    const parts = tabTitle.split(separator)
    const displayType = await presence.getSetting<number>('displayType')
    switch (displayType) {
      case 1:
        presenceData.statusDisplayType = StatusDisplayType.State
        break
      case 2:
        presenceData.statusDisplayType = StatusDisplayType.Details
        break
    }
    presenceData.details = parts[0]?.trim() || 'Unknown Song'
    presenceData.state = parts.slice(1).join(separator).trim() || 'Unknown Artist'
  }
  else {
    presenceData.details = 'Monochrome'
    presenceData.state = 'Listening...'
  }

  // 4. AUDIO STATUS & TIMESTAMPS
  if (mediaElement) {
    if (!mediaElement.paused) {
      // -- PLAYING STATE --
      if (!hidePausedSetting) {
        presenceData.smallImageKey = Assets.Play
      }
      presenceData.smallImageText = 'Playing'

      const now = Date.now()
      presenceData.startTimestamp = now - (mediaElement.currentTime * 1000)

      if (Number.isFinite(mediaElement.duration) && mediaElement.duration > 0)
        presenceData.endTimestamp = now + ((mediaElement.duration - mediaElement.currentTime) * 1000)
    }
    else {
      // -- PAUSED STATE (only reached when hidePaused is false) --
      presenceData.smallImageKey = Assets.Pause
      presenceData.smallImageText = 'Paused'
    }

    presence.setActivity(presenceData)
  }
  else {
    presence.clearActivity()
  }
})
