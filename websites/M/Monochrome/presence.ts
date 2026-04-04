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

presence.on('UpdateData', async () => {
  // 1. DYNAMIC IMAGE LOGIC
  // Default to the static logo
  let currentLargeImage: string = ActivityAssets.Logo

  // standard mediaSession check for high-res artwork
  const artwork = navigator.mediaSession?.metadata?.artwork

  if (artwork && artwork.length > 0) {
    // Select the last image in the array (typically the highest resolution)
    const coverUrl = artwork[artwork.length - 1]?.src
    if (coverUrl) {
      currentLargeImage = coverUrl
    }
  }

  // 2. INITIALIZE ACTIVITY DATA
  // Fix: Use 'PresenceData' (global interface), NOT 'ActivityData' or 'any'
  const presenceData: PresenceData = {
    type: ActivityType.Listening,
    largeImageKey: currentLargeImage,
    largeImageText: 'Listening on Monochrome',
  }

  // 3. TEXT STRATEGY (Browser Tab)
  // Parses "Song - Artist" or "Song • Artist" from the document title
  const tabTitle = document.title || ''
  let separator = ''

  if (tabTitle.includes(' - '))
    separator = ' - '
  else if (tabTitle.includes(' • '))
    separator = ' • '

  // get the album title
  const element = document.querySelector('.album')
  if (element?.matches('.details > .album')) {
    presenceData.largeImageText = element?.textContent
  }



  if (separator) {
    const parts = tabTitle.split(separator)
    // sets the StatusDisplayType on bases of the display type selected
    // displayType 0 - Monochrome
    // displayType 1 - Artist Name
    // displayType 2 - Song Name
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
    // Fallback for non-standard titles
    presenceData.details = 'Monochrome'
    presenceData.state = 'Listening...'
  }

  // 4. AUDIO STATUS & TIMESTAMPS
  const mediaElement = document.querySelector('audio')
  const hidePausedSetting = await presence.getSetting<boolean>('hidePaused')

  if (mediaElement) {
    if (!mediaElement.paused) {
      // -- PLAYING STATE --
      // hides the play btn if the hidePausedSetting is true
      if (!hidePausedSetting) {
        presenceData.smallImageKey = ActivityAssets.Play
      }
      presenceData.smallImageText = 'Playing'

      // Calculate timestamps using native Date.now() for accuracy
      const now = Date.now()
      presenceData.startTimestamp = now - (mediaElement.currentTime * 1000)

      // Only set endTimestamp if duration is finite and positive
      if (mediaElement.duration && Number.isFinite(mediaElement.duration) && mediaElement.duration > 0) {
        presenceData.endTimestamp = now + ((mediaElement.duration - mediaElement.currentTime) * 1000)
      }
    }
    else {
      // -- PAUSED STATE --
      // clears the activity is hidePausedSetting is set to true
      if (await presence.getSetting<boolean>('hidePaused') && mediaElement.paused) {
        return presence.clearActivity()
      }
      presenceData.smallImageKey = ActivityAssets.Pause
      presenceData.smallImageText = 'Paused'
      // Note: We do not set timestamps here, effectively hiding the time bar
    }

    presence.setActivity(presenceData)
  }
  else {
    presence.clearActivity()
  }
})
