import { Assets } from 'premid'

const presence = new Presence({
  clientId: '610102236374368267',
})

const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
  live: 'general.live',
})

const MIXCLOUD_LOGO = 'https://cdn.rcd.gg/PreMiD/websites/M/Mixcloud/assets/logo.png'

function absoluteUrl(value: string | null | undefined): string | undefined {
  if (!value) return undefined
  try {
    const url = new URL(value, window.location.origin)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : undefined
  }
  catch {
    return undefined
  }
}

presence.on('UpdateData', async () => {
  // Modern Mixcloud player (the stable attributes were observed in its DOM).
  const player = document.querySelector<HTMLElement>('[data-testid="player-container"]')
  const audio = document.querySelector<HTMLAudioElement>('[data-testid="audioTag"]')
    ?? document.querySelector<HTMLAudioElement>('audio')

  const livePlayButton = document.querySelector<HTMLElement>(
    '[class^="LiveVideo__VideoContainer"] .shaka-play-button',
  )
  const liveIsPlaying = livePlayButton?.getAttribute('icon') === 'pause'

  if (player && audio && !audio.paused && !audio.ended) {
    const titleLink = player.querySelector<HTMLAnchorElement>('[data-testid="player-short-title"]')
    const details = player.querySelector<HTMLElement>('[data-sentry-component="PlayerControlsDetails"]')
    const artistLink = details?.querySelector<HTMLAnchorElement>(
      'a:not([data-testid="player-short-title"])',
    )
    const artwork = player.querySelector<HTMLImageElement>('img')

    const title = titleLink?.textContent?.trim()
    const artist = artistLink?.textContent?.trim()
    const mixUrl = absoluteUrl(titleLink?.getAttribute('href'))
    const coverUrl = absoluteUrl(artwork?.currentSrc || artwork?.getAttribute('src'))

    if (title) {
      const presenceData: PresenceData = {
        details: title,
        state: artist || 'Mixcloud',
        largeImageKey: coverUrl || MIXCLOUD_LOGO,
        smallImageKey: Assets.Play,
        smallImageText: (await strings).play,
      }

      if (mixUrl) {
        presenceData.buttons = [{ label: 'Listen to Show', url: mixUrl }]
      }

      presence.setActivity(presenceData)
      return
    }
  }

  // Preserve legacy livestream handling until its current DOM is verified.
  if (liveIsPlaying) {
    const title = document.querySelector<HTMLElement>(
      '[class^="LiveStreamDetails__StreamTitleContainer"] > h4',
    )?.textContent?.trim()
    const author = document.querySelector<HTMLElement>(
      '[class^="LiveStreamStreamerDetails__StreamerDetailsTextContainer"] h4',
    )?.textContent?.trim()

    const presenceData: PresenceData = {
      details: title || 'Live on Mixcloud',
      state: author || 'Mixcloud',
      largeImageKey: MIXCLOUD_LOGO,
      smallImageKey: Assets.Live,
      smallImageText: (await strings).live,
      buttons: [{ label: 'View Livestream', url: window.location.href }],
    }
    presence.setActivity(presenceData)
    return
  }

  presence.setActivity()
})
