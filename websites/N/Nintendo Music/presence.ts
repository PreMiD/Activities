import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '1511302288138833950',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://music.nintendo.com/favicon.ico',
}

presence.on('UpdateData', async () => {
  // Retrieve Settings
  const privacyMode = await presence.getSetting<boolean>('privacyMode')
  const displayOrder = await presence.getSetting<number>('displayOrder')

  // Create the base presence data
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    details: 'Browsing',
    state: 'Music Catalog',
    startTimestamp: browsingTimestamp,
    type: ActivityType.Listening,
  }

  // Retrieve Metadatas and audio source
  const metadata = navigator.mediaSession.metadata
  const audio = document.querySelector('audio')

  if (metadata && audio) {
    // Display the data or nor via privacyMode
    if (privacyMode) {
      presenceData.details = 'Nintendo Music'
      presenceData.state = 'Listening to a music'
    }
    else {
      presenceData.type = ActivityType.Listening
      // Display Details and State depending on user choice
      if (displayOrder === 0) {
        presenceData.details = metadata.title
        presenceData.state = metadata.album
      }
      else {
        presenceData.details = metadata.album
        presenceData.state = metadata.title
      }
      // Try to retrieve item and display it
      const artwork = metadata.artwork[metadata.artwork.length - 1]
      if (artwork) {
        presenceData.largeImageKey = artwork.src
      }

      // Display Timestamp if playing otherwise display browsing time.
      // Display a small icon when audio is paused
      if (audio.paused) {
        presenceData.smallImageKey = Assets.Pause
        presenceData.smallImageText = 'Paused'

        presenceData.startTimestamp = browsingTimestamp
        delete presenceData.endTimestamp
      }
      else {
        const startTimestamp = Math.floor(Date.now() / 1000) - Math.floor(audio.currentTime)
        const endTimestamp = startTimestamp + Math.floor(audio.duration)

        presenceData.startTimestamp = startTimestamp
        presenceData.endTimestamp = endTimestamp
      }
    }
  }
  else {
    // If no audio source or metadatas found, display a log
    console.warn('[PreMid] No audio source or metadatas found')
  }

  // Set the activity
  if (presenceData.state) {
    presence.setActivity(presenceData)
  }
  else {
    presence.clearActivity()
  }
})
