import { ActivityType, Assets, getTimestamps, timestampFromFormat } from 'premid'

const presence = new Presence({
  clientId: '1458014647193047042',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/S/Spotify/assets/logo.png',
}

async function getStrings() {
  return presence.getStrings({
    play: 'general.playing',
    pause: 'general.paused',
    listening: 'general.listeningMusic',
    listeningPodcast: 'general.listeningPodcast',
    listenOnSpotify: 'spotify.listenOnSpotify',
    listenToPodcast: 'spotify.listenToPodcast',
    listeningToSong: 'spotify.listeningToSong',
    listeningToPodcast: 'spotify.listeningToPodcast',
  })
}

let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null

presence.on('UpdateData', async () => {
  const [newLang, privacy, timestamps, cover, buttons, podcastsOnly] = await Promise.all([
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('timestamps'),
    presence.getSetting<boolean>('cover'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('podcastsOnly'),
  ])

  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }

  // Check if music/podcast is playing
  const playPauseButton = document.querySelector('[data-testid=control-button-playpause]')
  const isPlaying = playPauseButton?.getAttribute('aria-label')?.toLowerCase().includes('pause')

  // Only show presence when content is playing
  if (!isPlaying) {
    presence.clearActivity()
    return
  }

  // Check if it's a podcast or music
  const albumCover = document.querySelector<HTMLAnchorElement>(
    ':is(a[data-testid=cover-art-link], a[data-testid=context-link])',
  )
  const isPodcast = albumCover && /\/(?:show|episode)\/|your-episodes\?/.test(albumCover.href)

  // If podcastsOnly mode is enabled, skip music
  if (podcastsOnly && !isPodcast) {
    presence.clearActivity()
    return
  }

  // Get track/episode info
  const trackName = document.querySelector(
    '[data-testid="context-item-link"], [data-testid="nowplaying-track-link"]',
  )?.textContent

  const artistOrShowName = document.querySelector(
    isPodcast
      ? '[data-testid="context-item-info-show"], [data-testid="track-info-artists"]'
      : '[data-testid="context-item-info-artist"], [data-testid="track-info-artists"]',
  )?.textContent

  if (!trackName) {
    presence.clearActivity()
    return
  }

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    type: ActivityType.Listening,
    details: trackName,
    state: artistOrShowName || (isPodcast ? 'Unknown Show' : 'Unknown Artist'),
    smallImageKey: Assets.Play,
    smallImageText: strings.play,
  }

  // Get timestamps
  if (timestamps) {
    const currentTime = document.querySelector('[data-testid="playback-position"]')?.textContent
    const duration = document.querySelector('[data-testid="playback-duration"]')?.textContent

    if (currentTime && duration) {
      [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(
        timestampFromFormat(currentTime),
        timestampFromFormat(duration),
      )
    }
  }

  // Get cover art
  if (cover && albumCover) {
    const coverImg = albumCover.querySelector('img')?.src
    if (coverImg) {
      presenceData.largeImageKey = coverImg
      presenceData.smallImageKey = ActivityAssets.Logo
    }
  }

  // Add button
  if (buttons) {
    presenceData.buttons = [
      {
        label: isPodcast ? strings.listenToPodcast : strings.listenOnSpotify,
        url: document.location.href,
      },
    ]
  }

  // Apply privacy mode
  if (privacy) {
    presenceData.details = isPodcast ? strings.listeningToPodcast : strings.listeningToSong
    delete presenceData.state
    presenceData.largeImageKey = ActivityAssets.Logo
    delete presenceData.smallImageKey
  }

  presence.setActivity(presenceData)
})
