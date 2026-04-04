import { ActivityType, StatusDisplayType } from 'premid'

// Static Asset Configuration
enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/M/Monochrome/assets/logo.png',
  Play = 'https://cdn.rcd.gg/PreMiD/resources/play.png',
  Pause = 'https://cdn.rcd.gg/PreMiD/resources/pause.png',
}

const presence = new Presence({
  clientId: '1459594619972096248',
})

// Track the last known playing title to detect track switches
let prevTitle = ''

presence.on('UpdateData', async () => {
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

  const element = document.querySelector('.album')
  if (element?.matches('.details > .album'))
    presenceData.largeImageText = element?.textContent

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
  const mediaElement = document.querySelector('audio')
  const hidePausedSetting = await presence.getSetting<boolean>('hidePaused')

  if (mediaElement) {
    if (!mediaElement.paused) {
      // -- PLAYING STATE --
      // Update prevTitle so we know what was last playing
      prevTitle = tabTitle

      if (!hidePausedSetting)
        presenceData.smallImageKey = ActivityAssets.Play
      presenceData.smallImageText = 'Playing'

      const now = Date.now()
      presenceData.startTimestamp = now - (mediaElement.currentTime * 1000)

      if (mediaElement.duration && Number.isFinite(mediaElement.duration) && mediaElement.duration > 0)
        presenceData.endTimestamp = now + ((mediaElement.duration - mediaElement.currentTime) * 1000)
    }
    else {
      // -- PAUSED STATE --
      if (hidePausedSetting) {
        // If the title changed while paused, a track switch is in progress — don't clear yet
        if (tabTitle !== prevTitle)
          return
        return presence.clearActivity()
      }
      presenceData.smallImageKey = ActivityAssets.Pause
      presenceData.smallImageText = 'Paused'
    }

    presence.setActivity(presenceData)
  }
  else {
    presence.clearActivity()
  }
})
