import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '1458014647193047042',
})

enum ActivityAssets {
  Logo = 'https://storage.googleapis.com/pr-newsroom-wp/1/2023/05/Spotify_Primary_Logo_RGB_Green-300x300.png',
}

async function getStrings() {
  return presence.getStrings({
    play: 'general.playing',
    pause: 'general.paused',
  })
}

let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null

presence.on('UpdateData', async () => {
  const [newLang, privacy, timestamps, cover, buttons] = await Promise.all([
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('timestamps'),
    presence.getSetting<boolean>('cover'),
    presence.getSetting<boolean>('buttons'),
  ])

  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }

  // Check if music is playing
  const playPauseButton = document.querySelector('[data-testid=control-button-playpause]')
  const isPlaying = playPauseButton?.getAttribute('aria-label')?.toLowerCase().includes('pause')

  // Only show presence when music is playing
  if (!isPlaying) {
    presence.clearActivity()
    return
  }

  // Get track info
  const trackName = document.querySelector(
    '[data-testid="context-item-link"], [data-testid="nowplaying-track-link"]',
  )?.textContent

  const artistName = document.querySelector(
    '[data-testid="context-item-info-artist"], [data-testid="track-info-artists"]',
  )?.textContent

  if (!trackName) {
    presence.clearActivity()
    return
  }

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    type: ActivityType.Listening,
    details: trackName,
    state: artistName || 'Unknown Artist',
    smallImageKey: Assets.Play,
    smallImageText: strings.play,
  }

  // Get timestamps
  if (timestamps) {
    const currentTime = document.querySelector('[data-testid="playback-position"]')?.textContent
    const duration = document.querySelector('[data-testid="playback-duration"]')?.textContent

    if (currentTime && duration) {
      [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(
        presence.timestampFromFormat(currentTime),
        presence.timestampFromFormat(duration),
      )
    }
  }

  // Get cover art
  if (cover) {
    const albumCover = document.querySelector<HTMLAnchorElement>(
      ':is(a[data-testid=cover-art-link], a[data-testid=context-link])',
    )
    const coverImg = albumCover?.querySelector('img')?.src
    if (coverImg) {
      presenceData.largeImageKey = coverImg
      presenceData.smallImageKey = ActivityAssets.Logo
    }
  }

  // Add button
  if (buttons) {
    presenceData.buttons = [
      { label: 'Listen on Spotify', url: document.location.href },
    ]
  }

  // Apply privacy mode
  if (privacy) {
    presenceData.details = 'Listening to music'
    delete presenceData.state
    presenceData.largeImageKey = ActivityAssets.Logo
    delete presenceData.smallImageKey
  }

  presence.setActivity(presenceData)
})
