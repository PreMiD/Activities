import { ActivityType, Assets, getTimestamps, StatusDisplayType } from 'premid'

const presence = new Presence({
  clientId: '1464284865972404512',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/W/WOW%20TV/assets/logo.png',
}

async function getStrings() {
  return presence.getStrings(
    {
      play: 'general.playing',
      pause: 'general.paused',
      browsing: 'general.browsing',
      watchingMovie: 'general.watchingMovie',
      watchingSeries: 'general.watchingSeries',
      watchEpisode: 'general.buttonViewEpisode',
      watchVideo: 'general.buttonWatchVideo',
      searchFor: 'general.searchFor',
      searchSomething: 'general.searchSomething',
    },
  )
}

presence.on('UpdateData', async () => {
  const [privacy, time] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('time'),
  ])

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    type: ActivityType.Watching,
  }

  const strings = await getStrings()

  const { pathname } = document.location

  switch (true) {
    case pathname.includes('home'):
      presenceData.state = strings.browsing
      break

    case pathname.includes('cinema'):
      presenceData.state = 'In Filmen stöbern...'
      break

    case pathname.includes('tv'):
      presenceData.state = 'In Serien stöbern...'
      break

    case pathname.includes('sports'):
      presenceData.state = 'In Sport stöbern...'
      break

    case pathname.includes('my-stuff'):
      presenceData.state = 'Watchlist durchsuchen...'
      break

    case pathname.includes('search'):
      presenceData.state = strings.searchSomething
      break

    // Viewing A Movies / Shows Page
    case pathname.includes('asset'): {
      const titleLogo = document.querySelector('img.program-details__title')?.getAttribute('alt')
      const titleText = document.querySelector('h1.program-details__title')?.textContent

      if ((titleLogo || titleText) && !privacy) {
        presenceData.state = `${titleLogo} ansehen...` ? titleLogo : `${titleText} +  ansehen...`
      }
      else { presenceData.state = 'Etwas ansehen...' }
    }
      break

    // Main Video Player Site
    case pathname.includes('playback'): {
      presenceData.statusDisplayType = StatusDisplayType.Details

      const video = document.querySelector<HTMLVideoElement>('video')
      if (!video) {
        return
      }

      const title = document.querySelector('[data-testid="metadata-title"]')?.textContent
      const episode = document.querySelector('p.contentPrimary')?.textContent

      // If Video Is Part Of A Show
      if (document.querySelector('[data-testid="more-episodes-toggle"]')) {
        privacy ? presenceData.details = strings.watchingSeries : presenceData.details = title
        if (!privacy) {
          presenceData.state = episode
        }
      }
      else {
        privacy ? presenceData.details = strings.watchingMovie : presenceData.details = title
      }

      if (!video.paused) {
        const sliderEl = document.querySelector('[data-testid="scrubber-bar"]')
        presenceData.smallImageKey = Assets.Play
        presenceData.smallImageText = strings.play

        if (time) {
          const timestamps = getTimestamps(
            Number.parseInt(sliderEl?.getAttribute('aria-valuenow') ?? '0'),
            Number.parseInt(sliderEl?.getAttribute('aria-valuemax') ?? '0'),
          )
          presenceData.startTimestamp = timestamps[0]
          presenceData.endTimestamp = timestamps[1]
        }
      }
      else {
        presenceData.smallImageKey = Assets.Pause
        presenceData.smallImageText = strings.pause
      }
    }
      break
  }

  presence.setActivity(presenceData)
})
