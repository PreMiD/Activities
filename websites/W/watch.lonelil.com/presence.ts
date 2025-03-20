import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1147910465134002276',
})
async function getStrings() {
  return presence.getStrings(
    {
      play: 'general.playing',
      pause: 'general.paused',
      viewAMovie: 'general.viewAMovie',
      viewAShow: 'general.viewAShow',
      viewAnime: 'general.viewAnime',
      watchingMovie: 'general.watchingMovie',
      watchingShow: 'general.watchingShow',
      watchingLive: 'general.watchingLive',
      viewingHomePage: 'general.viewHome',
      loading: 'watch.lonelil.com.loading',
      browsing: 'general.browsing',
      buttonWatchMovie: 'general.buttonWatchMovie',
      buttonWatchEpisode: 'general.buttonViewEpisode',
      buttonWatchStream: 'general.buttonWatchStream',
      buttonViewMovie: 'general.buttonViewMovie',
      buttonViewShow: 'general.buttonViewShow',
    },

  )
}

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/W/watch.lonelil.com/assets/logo.png',
  Home = 'https://cdn.rcd.gg/PreMiD/websites/W/watch.lonelil.com/assets/0.png',
}

let since = Math.floor(Date.now() / 1000)
let lastType = ''
let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null

presence.on('UpdateData', async () => {
  if (document.querySelector('#state')) {
    const state = JSON.parse(
      document.querySelector('#state')!.getAttribute('data-state')!,
    ) as {
      type: string
      since: number
      item: {
        shownType: string
        type: 'movie' | 'show' | 'anime' | 'tv' | 'pokemon'
        id: string
        title: string
        description: string
        poster: string
        details?: string
      }
      duration?: number
      paused?: boolean
      title?: string
      shownType?: string
    }

    if (state.type !== lastType) {
      lastType = state.type
      since = Math.floor(Date.now() / 1000)
    }

    const defaultData: PresenceData = {
      largeImageKey: ActivityAssets.Logo,
      smallImageText: 'watch.lonelil.com',
      smallImageKey: ActivityAssets.Logo,
      startTimestamp: since,
    }
    const newLang = await presence.getSetting<string>('lang').catch(() => 'en')
    let presenceData: PresenceData = {}

    if (oldLang !== newLang || !strings) {
      oldLang = newLang
      strings = await getStrings()
    }

    switch (true) {
      case state.type.startsWith('home'):
        if (state.type.includes('-')) {
          presenceData = {
            ...defaultData,
            details: `${strings.browsing.slice(0, -3)} ${state.shownType}`,
            largeImageKey: ActivityAssets.Home,
          }
        }
        else {
          presenceData = {
            ...defaultData,
            details: strings.viewingHomePage,
            largeImageKey: ActivityAssets.Home,
          }
        }
        break

      case state.type.startsWith('details'):
        presenceData = {
          ...defaultData,
          details: state.item.type === 'anime'
            ? strings.viewAnime.replace(':', '')
            : state.item.type === 'movie'
              ? strings.viewAMovie
              : strings.viewAShow,
          state: state.item.title,
          largeImageKey: state.item.poster,
          smallImageText: state.item.shownType,
          buttons: [
            {
              label: state.item.type === 'movie'
                ? strings.buttonViewMovie
                : strings.buttonViewShow,
              url: `https://watch.lonelil.com/${state.item.type}/${state.item.id}`,
            },
          ],
        }
        break

      case state.type.startsWith('watch'):
        presenceData = {
          details: state.item.details
            || (state.item.type === 'movie'
              ? strings.watchingMovie
              : state.item.type === 'tv'
                ? strings.watchingLive
                : strings.watchingShow),
          state: state.item.title,
          largeImageKey: state.item.poster,
          smallImageKey: Assets.Play,
          smallImageText: strings.play,
          buttons: [
            {
              label: state.item.type === 'movie'
                ? strings.buttonWatchMovie
                : state.item.type === 'tv'
                  ? strings.buttonWatchStream
                  : strings.buttonWatchEpisode,
              url: `https://watch.lonelil.com/watch/${state.item.type}/${state.item.id}`,
            },
          ],
        }

        if (state.paused) {
          presenceData.smallImageKey = Assets.Pause
          presenceData.smallImageText = strings.pause
        }
        else {
          const elapsed = document.querySelector(
            '.jw-text-elapsed[role="timer"]',
          )?.textContent
          const duration = document.querySelector(
            '.jw-text-duration[role="timer"]',
          )?.textContent
          if (elapsed && duration) {
            [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(
              presence.timestampFromFormat(elapsed),
              presence.timestampFromFormat(duration),
            )
          }
        }
        break

      case state.type === 'loading':
        delete defaultData.smallImageKey
        presenceData = {
          ...defaultData,
          details: strings.loading,
        }
        break

      case state.type.startsWith('other'):
        delete defaultData.smallImageKey
        presenceData = {
          ...defaultData,
          details: state.title,
        }
        break

      default:
        presence.clearActivity()
    }

    presence.setActivity(presenceData)
  }
  else {
    presence.clearActivity()
  }
})
