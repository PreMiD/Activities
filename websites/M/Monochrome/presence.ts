// @ts-expect-error - Presence is globally defined
declare const Presence: any

// Static Asset Configuration
enum ActivityAssets {
  Logo = 'https://i.imgur.com/XHf3H8Y.png',
  Play = 'https://i.imgur.com/ryNutI5.png',
  Pause = 'https://i.imgur.com/TlMwR5i.png',
}

let presence

try {
  presence = new Presence({
    clientId: '1459594619972096248',
  })
}
catch {
  // Silent catch for production environments
}

if (presence) {
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
    // We create a fresh object every tick to avoid 'undefined' property issues
    const presenceData: any = {
      type: 2, // ActivityType.Listening
      largeImageKey: currentLargeImage,
      largeImageText: 'Listening on Monochrome',
      // Default small icon (overwritten below if paused)
      smallImageKey: ActivityAssets.Play,
      smallImageText: 'Playing',
    }

    // 3. TEXT STRATEGY (Browser Tab)
    // Parses "Song - Artist" or "Song • Artist" from the document title
    const tabTitle = document.title || ''
    let separator = ''

    if (tabTitle.includes(' - '))
      separator = ' - '
    else if (tabTitle.includes(' • '))
      separator = ' • '

    if (separator) {
      const parts = tabTitle.split(separator)
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

    if (mediaElement) {
      if (!mediaElement.paused) {
        // -- PLAYING STATE --
        presenceData.smallImageKey = ActivityAssets.Play
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
        presenceData.smallImageKey = ActivityAssets.Pause
        presenceData.smallImageText = 'Paused'
        // Note: We do not set timestamps here, effectively hiding the time bar
      }

      presence.setActivity(presenceData)
    }
    else {
      // Clear activity if no audio player is found
      presence.setActivity({})
    }
  })
}
