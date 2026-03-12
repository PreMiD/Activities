import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1174478441450573924',
})

// Function to convert the site's duration timer to raw seconds
function convertToSeconds(duration: string): number {
  const [minutes, seconds] = duration.split(':').map(Number) as [number, number]
  return minutes * 60 + seconds
}

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/P/Poolsuite%20FM/assets/logo.jpg',
}

let details: string, state: string, artist: string
presence.on('UpdateData', async () => {
  // Grab channel and artist name
  details = `Channel: ${
    document.querySelector('.select-wrapper')?.lastChild?.textContent
  }`
  artist = document.querySelector('.current-track')?.lastChild?.textContent ?? ''

  // If next track is loading, replace current track text with "Tuning..." instead of track
  if (artist === 'We\'ll be right back') {
    state = 'Tuning...'
  }
  else {
    state = `${artist} - ${
      document.querySelector('.current-track')?.firstChild?.nextSibling?.textContent
    }`
  }
  if (document.querySelector('.middle')?.firstChild?.textContent === 'Pause') {
    // Set presence data for a playing song
    const elapsed = Math.floor(Date.now() / 1000)
    const presenceData: PresenceData = {
      details,
      state,
      largeImageKey: ActivityAssets.Logo,
      startTimestamp: elapsed,
      endTimestamp: elapsed
        + (convertToSeconds(
          document.querySelector('.timer')?.lastChild?.textContent ?? '',
        )
        - convertToSeconds(
          document.querySelector('.timer')?.firstChild?.textContent ?? '',
        )),
      smallImageKey: Assets.Play,
      smallImageText: 'Playing',
    }
    presence.setActivity(presenceData)
  }
  else {
    // Set presence data for a paused song
    const presenceData: PresenceData = {
      details,
      state,
      largeImageKey: ActivityAssets.Logo,
      endTimestamp: 0,
      smallImageKey: Assets.Pause,
      smallImageText: 'Paused',
    }
    presence.setActivity(presenceData)
  }
})
