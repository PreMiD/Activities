import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1535996328230780938',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/S/SoundScout/assets/logo.png',
}

function getBackgroundImageUrl(element: HTMLElement | null) {
  return element?.style.backgroundImage.match(/^url\(["']?(.*?)["']?\)$/)?.[1]
}

function getPageName() {
  return document.querySelector('main h1')?.textContent?.trim()
    || document.title.split('·')[0]?.trim()
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    type: ActivityType.Listening,
  }
  const { href, pathname } = document.location

  // SoundScout exposes metadata through Media Session, while playback timing
  // can fall back to the controls in its persistent player bar.
  const playerBar = document.querySelector<HTMLElement>('[data-testid="player-bar"]')
  const audio = playerBar?.querySelector<HTMLAudioElement>('audio')
    ?? document.querySelector<HTMLAudioElement>('audio')
  const seekSlider = playerBar?.querySelector<HTMLInputElement>(
    'input[aria-label="Seek"]',
  )
  const metadata = navigator.mediaSession.metadata

  if (metadata?.title) {
    const isPlaying = navigator.mediaSession.playbackState === 'playing'
      || Boolean(audio && !audio.paused)

    // Clear paused tracks so an abandoned tab does not leave a stale activity.
    if (!isPlaying) {
      presence.clearActivity()
      return
    }

    const trackUrl = document.querySelector<HTMLAnchorElement>(
      '[data-testid="player-bar"] a[href^="/player/music/"]',
    )?.href
    const artistUrl = document.querySelector<HTMLAnchorElement>(
      '[data-testid="player-bar"] a[href^="/player/artists/"]',
    )?.href

    presenceData.details = metadata.title
    presenceData.state = metadata.artist || 'Unknown artist'
    presenceData.largeImageKey = metadata.artwork[0]?.src
      || ActivityAssets.Logo
    presenceData.smallImageKey = Assets.Play
    presenceData.smallImageText = 'Playing'

    // Replace the browsing timer with synchronized progress for active media.
    delete presenceData.startTimestamp

    const currentTime = audio?.currentTime
      ?? seekSlider?.valueAsNumber
      ?? Number.NaN
    const audioDuration = audio?.duration
    const duration = audioDuration !== undefined
      && Number.isFinite(audioDuration)
      ? audioDuration
      : Number(seekSlider?.max)

    if (
      Number.isFinite(currentTime)
      && Number.isFinite(duration)
      && duration > 0
    ) {
      [presenceData.startTimestamp, presenceData.endTimestamp]
        = getTimestamps(currentTime, duration)
    }

    if (trackUrl) {
      presenceData.detailsUrl = trackUrl
      presenceData.largeImageUrl = trackUrl
      presenceData.buttons = [
        {
          label: 'Listen on SoundScout',
          url: trackUrl,
        },
      ]
    }
    if (artistUrl)
      presenceData.stateUrl = artistUrl
  }
  else {
    presenceData.details = 'Browsing SoundScout'

    switch (true) {
      case pathname === '/player': {
        presenceData.state = 'Exploring music'
        break
      }
      case pathname.includes('/search'): {
        presenceData.state = 'Searching for music'
        break
      }
      case pathname === '/player/my-library': {
        presenceData.state = 'Browsing favorites'
        break
      }
      case pathname.startsWith('/player/explore/'): {
        // Detail routes can contain UUIDs, so prefer the rendered page heading.
        const pathParts = pathname.split('/').filter(Boolean)
        const category = pathParts[2] ?? 'music'
        const selection = pathParts[3]
        const collectionTypes: Record<string, string> = {
          activities: 'activity',
          genres: 'genre',
          instruments: 'instrument',
          keys: 'key',
          moods: 'mood',
          themes: 'theme',
        }
        const pathLabel = selection
          ? decodeURIComponent(selection).replaceAll('-', ' ')
          : undefined
        const collectionName = getPageName() || pathLabel

        presenceData.state = selection && collectionName
          ? `Browsing ${collectionTypes[category] ?? category}: ${collectionName}`
          : `Browsing ${category}`
        break
      }
      case pathname.includes('/music/'): {
        presenceData.state = 'Viewing a track'
        break
      }
      case pathname.includes('/artists/'): {
        const artistHero = document.querySelector<HTMLElement>(
          '[data-testid="artist-hero"]',
        )
        const artistName = artistHero?.querySelector('h1')?.textContent?.trim()

        // Artist portraits are CSS backgrounds rather than image elements.
        const artistImage = getBackgroundImageUrl(
          artistHero?.querySelector<HTMLElement>(
            '[aria-hidden="true"] [style*="background-image"]',
          ) ?? null,
        )

        presenceData.state = artistName
          ? `Viewing ${artistName}`
          : 'Viewing an artist'

        if (artistImage) {
          presenceData.largeImageKey = artistImage
          presenceData.largeImageUrl = href
        }
        break
      }
      case pathname.includes('/releases/'): {
        presenceData.state = 'Viewing a release'
        break
      }
      case pathname === '/player/playlists':
      case pathname === '/player/my-playlists': {
        presenceData.state = 'Browsing playlists'
        break
      }
      case pathname.startsWith('/player/playlists/'):
      case pathname.startsWith('/player/my-playlists/'): {
        const playlistName = getPageName()

        presenceData.state = playlistName
          ? `Browsing playlist: ${playlistName}`
          : 'Browsing a playlist'
        break
      }
      default: {
        presenceData.state = 'Exploring music'
      }
    }

    presenceData.detailsUrl = href
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.clearActivity()
})
