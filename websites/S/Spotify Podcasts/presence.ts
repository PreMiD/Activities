import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '619561001234464789',
})
const browsingStamp = Math.floor(Date.now() / 1000)

let recentlyCleared = 0

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/S/Spotify%20Podcasts/assets/logo.png',
}

async function getStrings() {
  return presence.getStrings(
    {
      play: 'general.playing',
      pause: 'general.paused',
      featured: 'spotify.featured',
      bestPodcasts: 'spotify.bestPodcasts',
      charts: 'spotify.charts',
      genres: 'spotify.genres',
      latest: 'spotify.latest',
      discover: 'spotify.discover',
      browse: 'spotify.browse',
      podcastLike: 'spotify.podcastsLike',
      artistLike: 'spotify.artistsLike',
      albumLike: 'spotify.albumLike',
      songLike: 'spotify.songsLike',
      forMeh: 'spotify.madeForYou',
      playlist: 'spotify.playlists',
      viewPlaylist: 'general.viewPlaylist',
      download: 'spotify.download',
      view: 'general.view',
      account: 'general.viewAccount',
      search: 'general.search',
      searchFor: 'general.searchFor',
      searchSomething: 'general.searchSomething',
      browsing: 'general.browsing',
      listening: 'general.listeningMusic',
      show: 'general.viewShow',
      artist: 'general.buttonViewArtist',
      viewPodcast: 'general.buttonViewPodcast',
      buttonViewPlaylist: 'general.buttonViewPlaylist',
      viewHome: 'general.viewHome',
      viewPage: 'general.buttonViewPage',
    },

  )
}

let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null

presence.on('UpdateData', async () => {
  let presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    type: ActivityType.Listening,
  }

  //* Update strings if user selected another language.
  const [newLang, privacy, timestamps, cover, buttons] = await Promise.all([
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('timestamps'),
    presence.getSetting<boolean>('cover'),
    presence.getSetting<boolean>('buttons'),
  ])
  const { href, pathname, hostname } = document.location

  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }

  const pages: Record<string, PresenceData> = {
    '/browse/featured': {
      details: strings.browse,
      state: strings.featured,
      buttons: [
        {
          label: strings.viewPage,
          url: href,
        },
      ],
    },
    '/browse/podcasts': {
      details: strings.browse,
      state: strings.bestPodcasts,
      buttons: [
        {
          label: strings.viewPage,
          url: href,
        },
      ],
    },
    '/browse/charts': {
      details: strings.charts,
      buttons: [
        {
          label: strings.viewPage,
          url: href,
        },
      ],
    },
    '/browse/genres': {
      details: strings.browse,
      state: strings.genres,
      buttons: [
        {
          label: strings.viewPage,
          url: href,
        },
      ],
    },
    '/browse/latest': {
      details: strings.browse,
      state: strings.latest,
      buttons: [
        {
          label: strings.viewPage,
          url: href,
        },
      ],
    },
    '/browse/discover': {
      details: strings.discover,
      buttons: [
        {
          label: strings.viewPage,
          url: href,
        },
      ],
    },
    '/collection/playlists': {
      details: strings.browse,
      state: strings.playlist,
      buttons: [
        {
          label: strings.viewPage,
          url: href,
        },
      ],
    },
    '/collection/made-for-you': {
      details: strings.browse,
      state: strings.forMeh,
      buttons: [
        {
          label: strings.viewPage,
          url: href,
        },
      ],
    },
    '/collection/tracks': {
      details: strings.browse,
      state: strings.songLike,
      buttons: [
        {
          label: strings.viewPage,
          url: href,
        },
      ],
    },
    '/collection/albums': {
      details: strings.browse,
      state: strings.albumLike,
      buttons: [
        {
          label: strings.viewPage,
          url: href,
        },
      ],
    },
    '/collection/artists': {
      details: strings.browse,
      state: strings.artistLike,
      buttons: [
        {
          label: strings.viewPage,
          url: href,
        },
      ],
    },
    '/collection/podcasts': {
      details: strings.browse,
      state: strings.podcastLike,
      buttons: [
        {
          label: strings.viewPage,
          url: href,
        },
      ],
    },
    '/collection/episodes': {
      details: strings.browse,
      state: 'my episodes',
      buttons: [
        {
          label: strings.viewPage,
          url: href,
        },
      ],
    },
    '/setting': {
      details: strings.account,
      buttons: [
        {
          label: strings.viewPage,
          url: href,
        },
      ],
    },
  }
  const albumCover = document.querySelector<HTMLAnchorElement>(
    ':is(a[data-testid=cover-art-link], a[data-testid=context-link])',
  )

  for (const [path, data] of Object.entries(pages)) {
    if (pathname.includes(path))
      presenceData = { ...presenceData, ...data } as PresenceData
  }

  let searching = false

  if (
    !(albumCover && /\/(?:show|episode)\/|your-episodes\?/.test(albumCover.href))
  ) {
    if (timestamps)
      presenceData.startTimestamp = browsingStamp
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = strings.browsing
    switch (hostname) {
      case 'open.spotify.com': {
        if (pathname === '/') {
          presenceData.details = strings.viewHome
        }
        else if (pathname.includes('/search/')) {
          const search = document.querySelector('input')
          searching = true
          presenceData.details = strings.searchFor
          presenceData.state = search?.value
          if (search && search.value.length <= 3)
            presenceData.state = 'something...'
          presenceData.smallImageKey = Assets.Search
        }
        else if (pathname.includes('/search')) {
          searching = true
          presenceData.details = strings.search
          presenceData.smallImageKey = Assets.Search
        }
        else if (pathname.includes('/playlist/')) {
          const playlistCover = document
            .querySelector(
              'div.Ws8Ec3GREpT5PAUesr9b > div > img.mMx2LUixlnN_Fu45JpFB',
            )
            ?.getAttribute('src')
          presenceData.details = strings.viewPlaylist
          presenceData.state = document.querySelector(
            'div.RP2rRchy4i8TIp1CTmb7 > span.rEN7ncpaUeSGL9z0NGQR > h1',
          )?.textContent
          presenceData.buttons = [
            {
              label: strings.buttonViewPlaylist,
              url: href,
            },
          ]
          if (playlistCover) {
            presenceData.largeImageKey = playlistCover
            presenceData.smallImageKey = ActivityAssets.Logo
          }
        }
        else if (pathname.includes('/show/')) {
          presenceData.details = strings.show
          presenceData.state = document.querySelector(
            'div.RP2rRchy4i8TIp1CTmb7 > span.rEN7ncpaUeSGL9z0NGQR > h1 > span',
          )?.textContent
          presenceData.largeImageKey = document
            .querySelector(
              'div._gLjHpwOxHFwo5nLM8hb > div > img.mMx2LUixlnN_Fu45JpFB',
            )
            ?.getAttribute('src')
          presenceData.smallImageKey = ActivityAssets.Logo
          presenceData.buttons = [
            {
              label: strings.artist,
              url: href,
            },
          ]
        }
        break
      }
      case 'accounts.spotify.com': {
        if (pathname.includes('/login'))
          presenceData.details = 'Logging in'
        break
      }
      case 'support.spotify.com': {
        presenceData.details = strings.browse
        presenceData.state = 'Support Center'

        break
      }
      case 'investors.spotify.com': {
        presenceData.details = strings.browse
        presenceData.state = 'Support Center'

        break
      }
      case 'developer.spotify.com': {
        presenceData.details = strings.browse
        presenceData.state = 'Spotify for Developers'

        break
      }
      case 'artists.spotify.com': {
        presenceData.details = strings.browse
        presenceData.state = 'Spotify for Artists'

        break
      }
      case 'newsroom.spotify.com': {
        presenceData.details = strings.browse
        presenceData.state = 'Spotify for Newsroom'

        break
      }
      case 'podcasters.spotify.com': {
        presenceData.details = strings.browse
        presenceData.state = 'Spotify for Podcasters'

        break
      }
      case 'www.spotify.com': {
        if (pathname.includes('/premium')) {
          presenceData.details = strings.view
          presenceData.state = 'Spotify Premium'
          delete presenceData.smallImageKey
        }
        else if (pathname.includes('/download')) {
          presenceData.details = strings.download
          presenceData.smallImageKey = Assets.Downloading
        }
        else if (pathname.includes('/account')) {
          presenceData.details = strings.account
          delete presenceData.smallImageKey
        }

        break
      }
    }
    const control = document.querySelector<HTMLButtonElement>(
      'div.player-controls__buttons > button',
    )
    if (
      document.querySelector('.now-playing-bar-hidden') !== null
      || control === null
      || control.dataset.testid === 'control-button-play'
    ) {
      if (!presenceData.details) {
        presence.setActivity()
      }
      else if (privacy) {
        if (searching) {
          presenceData.details = strings.searchSomething
          delete presenceData.state
        }
        else {
          presenceData.details = strings.browsing
          delete presenceData.state
          delete presenceData.smallImageKey
        }
        presence.setActivity(presenceData)
      }
      else {
        presence.setActivity(presenceData)
      }
    }
    else {
      if (recentlyCleared < Date.now() - 1000)
        presence.clearActivity()

      recentlyCleared = Date.now()
    }
  }
  else {
    const pause = document
      .querySelector('[data-testid=control-button-playpause]')
      ?.getAttribute('aria-label') === 'Play'

    presenceData.smallImageKey = pause ? Assets.Pause : Assets.Play
    presenceData.smallImageText = pause ? strings.pause : strings.play;
    [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(
      presence.timestampFromFormat(
        document.querySelector('[data-testid="playback-position"]')
          ?.textContent ?? '',
      ),
      presence.timestampFromFormat(
        document.querySelector('[data-testid="playback-duration"]')
          ?.textContent ?? '',
      ),
    )

    if (pause || !timestamps) {
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
    }

    if (cover)
      presenceData.largeImageKey = albumCover?.querySelector('img')?.src

    presenceData.details = document.querySelector(
      ':is(a[nowplaying-track-link], a[data-testid=context-item-link',
    )?.textContent
    presenceData.state = document.querySelector(
      ':is(div[data-testid=track-info-artists], a[data-testid=context-item-info-show]',
    )?.textContent

    presenceData.buttons = [
      {
        label: strings.viewPodcast,
        url: href,
      },
    ]

    if (privacy) {
      presenceData.details = strings.listening
      delete presenceData.state
    }
  }

  if (!buttons && presenceData.buttons)
    delete presenceData.buttons

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
