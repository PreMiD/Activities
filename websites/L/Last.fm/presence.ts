import { Assets } from 'premid'

const presence = new Presence({
  clientId: '917456087299534858',
})
const browsingTimestamp = Date.now() / 1000

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/L/Last.fm/assets/logo.png',
}

presence.on('UpdateData', async () => {
  let presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    smallImageKey: Assets.Search,
    startTimestamp: browsingTimestamp,
  }
  const [buttons, timestamps, cover] = await Promise.all([
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('timestamps'),
    presence.getSetting<boolean>('cover'),
  ])
  const pages: Record<string, PresenceData> = {
    '/home': {
      details: 'Home',
    },
    '/dashboard': {
      details: 'Dashboard',
    },
    '/features': {
      details: 'Features',
    },
    '/events': {
      details: 'Events',
    },
    '/charts': {
      details: 'Charts',
    },
    '/inbox': {
      details: 'Inbox',
    },
    '/settings': {
      details: 'Settings',
    },
    '/pro': {
      details: 'Last.fm Pro',
    },
    '/about': {
      details: 'About',
    },
    '/api': {
      details: 'Developer API',
    },
    '/legal': {
      details: 'Legal',
    },
    '/help': {
      details: 'Help',
    },
    '/search': {
      details: 'Searching for:',
      state: new URLSearchParams(document.location.search).get('q'),
    },
    '/user': {
      details: 'Viewing user:',
      state: document.querySelector('h1.header-title')?.textContent?.trim(),
      buttons: [
        {
          url: document.querySelector<HTMLAnchorElement>(
            'h1.header-title > a',
          )?.href ?? '',
          label: 'View User',
        },
      ],
    },
    '/music': {
      details: (() => {
        if (document.querySelector('body.album-overview-new'))
          return 'Viewing Album:'
        else if (document.querySelector('body.artist-overview-new'))
          return 'Viewing Artist:'
        else if (document.querySelector('body.track-overview-new'))
          return 'Viewing Track:'
        else if (
          document.querySelector('body.namespace--music_bookmarks_overview')
        )
          return 'Viewing Bookmarks'
        else return 'Music'
      })(),
      largeImageKey: (() => {
        if (cover) {
          if (document.querySelector('body.album-overview-new')) {
            return (
              document.querySelector<HTMLImageElement>(
                '.album-overview-cover-art > .cover-art > img',
              )?.src ?? ActivityAssets.Logo
            )
          }
          else {
            return ActivityAssets.Logo
          }
        }
        else {
          return ActivityAssets.Logo
        }
      })(),
      state: document.querySelector('h1.header-new-title')?.textContent,
      buttons: ((): [ButtonData] | undefined => {
        if (document.querySelector('body.album-overview-new')) {
          return [
            {
              url: document.URL,
              label: 'View Album',
            },
          ]
        }
        else if (document.querySelector('body.artist-overview-new')) {
          return [
            {
              url: document.URL,
              label: 'View Artist',
            },
          ]
        }
        else if (document.querySelector('body.track-overview-new')) {
          return [
            {
              url: document.URL,
              label: 'View Track',
            },
          ]
        }
      })(),
    },
  }

  for (const [path, data] of Object.entries(pages)) {
    if (location.pathname.match(path))
      presenceData = { ...presenceData, ...data } as PresenceData
  }

  if (
    !document.querySelector<HTMLButtonElement>(
      '[data-analytics-action="PlaybarResumeTrack"]',
    )?.disabled
  ) {
    let paused = !!document
      .querySelector('[data-analytics-action="PlaybarResumeTrack"]')
      ?.className
      .endsWith('play')

    if (timestamps) {
      const timeLeft = presence.timestampFromFormat(
        document
          .querySelector('div.player-bar-progress-wrap > div > div > span')
          ?.textContent
          ?.slice(1) ?? '',
      )

      if (Date.now() / 1000 >= Date.now() / 1000 + timeLeft)
        paused = true

      if (!paused)
        presenceData.endTimestamp = Date.now() / 1000 + timeLeft
    }

    if (cover) {
      const artwork = document.querySelector<HTMLImageElement>(
        '.player-bar-inner-wrap > .player-bar-artwork > img',
      )?.src

      presenceData.largeImageKey = artwork?.includes('player_default_album')
        ? ActivityAssets.Logo
        : artwork?.replace('/174s/', '/1024s/')
    }
    else {
      presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/L/Last.fm/assets/logo.png'
    }

    presenceData.details = 'Listening to:'
    presenceData.state = document
      .querySelector('p.player-bar-track.js-player-status')
      ?.getAttribute('title')

    presenceData.smallImageKey = paused ? Assets.Pause : Assets.Play
    presenceData.smallImageText = paused ? 'Paused' : 'Playing'

    delete presenceData.startTimestamp
    delete presenceData.buttons
  }

  if (!buttons)
    delete presenceData.buttons
  if (!timestamps)
    delete presenceData.startTimestamp
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
