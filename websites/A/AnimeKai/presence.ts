import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1264754447276310599',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

let data: {
  currTime: number
  duration: number
  paused: boolean
} = null as any

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/A/AnimeKai/assets/logo.png',
  Settings = 'https://cdn.rcd.gg/PreMiD/websites/A/AnimeKai/assets/0.png',
  Notifications = 'https://cdn.rcd.gg/PreMiD/websites/A/AnimeKai/assets/1.png',
}

presence.on(
  'iFrameData',
  async (recievedData: {
    currTime: number
    duration: number
    paused: boolean
  }) => {
    data = recievedData
  },
)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    name: 'AnimeKai',
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href } = document.location
  const buttons = await presence.getSetting<boolean>('buttons')

  if (pathname === '/' || pathname === '/home') {
    presenceData.details = 'Exploring AnimeKai.to'
  }
  else if (
    /\/(?:ongoing|recent|movie|new-releases|updates|tv|completed|top-upcoming|ona|ova|special|genres\/.*)/.test(
      pathname,
    )
  ) {
    const heading = document.querySelector<HTMLSpanElement>('.shead .stitle.text-uppercase')
    if (heading)
      presenceData.details = `Looking at ${heading.textContent}`
  }
  else if (pathname.startsWith('/producers')) {
    const name = document.querySelector<HTMLSpanElement>('.shead .stitle.text-uppercase')?.textContent

    presenceData.details = name
    if (buttons) {
      presenceData.buttons = [
        {
          label: 'Go to Production Page',
          url: href,
        },
      ]
    }
  }
  else if (pathname.startsWith('/az-list')) {
    presenceData.details = 'Looking at Anime list'
    if (pathname !== '/az-list') {
      presenceData.state = `Titles starting with ${
        pathname.substring(9) === 'other'
          ? 'Other characters'
          : `${pathname.substring(9)}`
      }`
    }
    presenceData.smallImageKey = Assets.Search
  }
  else if (pathname.startsWith('/watch2gether')) {
    if (pathname === '/watch2gether') {
      presenceData.details = 'Looking for anime rooms'
    }
    else {
      const filmName = document.querySelector<HTMLLIElement>(
        'li.breadcrumb-item.active',
      )
      const thumbnail = document.querySelector<HTMLImageElement>(
        '.poster > div > img',
      )?.src

      presenceData.largeImageKey = thumbnail
      presenceData.details = 'In a room';
      (presenceData as PresenceData).type = ActivityType.Watching
      if (filmName)
        presenceData.state = `${filmName.textContent}`
      if (data && !data.paused) {
        [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(data.currTime, data.duration)
      }
      if (buttons) {
        presenceData.buttons = [
          {
            label: 'Join Room',
            url: href,
          },
        ]
      }
    }
  }
  else if (pathname.startsWith('/watch')) {
    const title = document.querySelector<HTMLLIElement>(
      'li.breadcrumb-item.active',
    )
    const episodeSpan = document.querySelector<HTMLSpanElement>(
      '.eplist .range li a.active span',
    )
    const episode = episodeSpan?.previousSibling?.nodeValue?.trim() || null
    const thumbnail = document.querySelector<HTMLImageElement>(
      '.poster > div > img',
    )?.src

    presenceData.largeImageKey = thumbnail
    if (title)
      presenceData.details = title.textContent
    if (episode)
      presenceData.state = `Episode ${episode}`
    if (data) {
      (presenceData as PresenceData).type = ActivityType.Watching
      if (!data.paused) {
        [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(data.currTime, data.duration)
        presenceData.smallImageKey = Assets.Play
        presenceData.smallImageText = 'Playing'
      }
      else {
        presenceData.smallImageKey = Assets.Pause
        presenceData.smallImageText = 'Paused'
        delete presenceData.startTimestamp
        delete presenceData.endTimestamp
      }
    }

    if (buttons) {
      presenceData.buttons = [
        {
          label: 'Watch Episode',
          url: href,
        },
      ]
    }
  }
  else {
    switch (pathname) {
      case '/browser': {
        presenceData.details = 'Searching'

        const searchInput = document.querySelector('.search input.form-control') as HTMLInputElement | null
        const searchInputValue = searchInput?.value ?? ''

        presenceData.state = searchInputValue
        presenceData.smallImageKey = Assets.Search
        break
      }
      case '/contact': {
        presenceData.details = 'Contact Us'
        break
      }
      case '/user/profile': {
        presenceData.details = 'Checking User Profile'
        presenceData.smallImageKey = ActivityAssets.Settings
        break
      }
      case '/user/settings': {
        presenceData.details = 'Changing Settings'
        presenceData.smallImageKey = ActivityAssets.Settings
        break
      }
      case '/user/notification': {
        presenceData.details = 'Looking at Notifications'
        presenceData.smallImageKey = ActivityAssets.Notifications
        break
      }
      case '/user/watching': {
        presenceData.details = 'Continue Watching'
        presenceData.smallImageKey = Assets.Reading
        break
      }
      case '/user/import': {
        presenceData.details = 'MAL Import/Export'
        presenceData.smallImageKey = Assets.Downloading
        break
      }
      default: {
        const title = document.querySelector<HTMLHeadingElement>(
          'h2.film-name.dynamic-name',
        )
        if (title) {
          const thumbnail = document.querySelector<HTMLImageElement>(
            '#ani_detail > div > div > div.anis-content > div.anisc-poster > div > img',
          )?.src

          presenceData.largeImageKey = thumbnail
          presenceData.details = 'Checking Synopsis'
          presenceData.state = title.textContent
          if (buttons) {
            presenceData.buttons = [
              {
                label: 'Check Synopsis',
                url: href,
              },
            ]
          }
        }
      }
    }
  }

  presence.setActivity(presenceData)
})
