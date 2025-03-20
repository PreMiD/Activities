import { Assets } from 'premid'

const presence = new Presence({
  clientId: '875631338663870485',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/B/BitChute/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href } = document.location
  const [privacy, buttons, time] = await Promise.all(
    ['privacy', 'buttons', 'time'].map(async (setting) => {
      const s = await presence.getSetting<boolean>(setting)
      return s
    }),
  )

  if (privacy) {
    presenceData.details = 'Using BitChute'
  }
  else if (pathname === '/') {
    const tab = document.querySelector<HTMLLIElement>(
      'ul.nav.nav-tabs.nav-tabs-list > li.active',
    )
    presenceData.details = 'At HomePage'
    if (tab)
      presenceData.state = `Viewing ${tab.textContent} Videos`
  }
  else if (pathname.startsWith('/video')) {
    const title = document.querySelector<HTMLHeadingElement>('h1#video-title')
    const channelName = document.querySelector<HTMLAnchorElement>(
      '.details > .name > a',
    )
    const video = document.querySelector<HTMLVideoElement>('video#player')
    const sensitivity = document.querySelector<HTMLAnchorElement>(
      '.video-detail-list tr:last-child a',
    )?.textContent
    if (title)
      presenceData.details = `Watching ${title.textContent}`
    if (channelName) {
      presenceData.state = `By ${channelName.textContent}`
      if (buttons) {
        presenceData.buttons = [
          {
            label: 'Watch Video',
            url: href,
          },
          {
            label: 'View Channel',
            url: channelName.href,
          },
        ]
      }
    }
    if (sensitivity?.startsWith('NSFW')) {
      presenceData.details = 'Watching a video'
      delete presenceData.state
      delete presenceData.buttons
    }
    if (time && video && !video.paused) {
      [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(video)
      presenceData.smallImageText = presenceData.smallImageKey = Assets.Play
    }
  }
  else if (pathname.startsWith('/channel')) {
    const name = document.querySelector<HTMLAnchorElement>(
      '.details > .name > a',
    )
    presenceData.details = 'Viewing Channel'
    if (name) {
      presenceData.state = name.textContent
      if (buttons)
        presenceData.buttons = [{ label: 'View Channel', url: href }]
    }
    else {
      presenceData.details = 'Viewing All Channels'
    }
  }
  else if (pathname.startsWith('/category')) {
    const name = document.querySelector<HTMLHeadingElement>('h1.page-title')
    if (name) {
      presenceData.details = `Viewing Category: ${name.textContent}`
      const tab = document.querySelector<HTMLLIElement>(
        'ul.nav.nav-tabs.nav-tabs-list > li.active',
      )
      if (tab)
        presenceData.state = `Looking at ${tab.textContent} videos`
    }
  }
  else {
    switch (pathname) {
      case '/accounts/register': {
        presenceData.details = 'Registering Account'
        break
      }
      case '/accounts/login': {
        presenceData.details = 'Logging In'
        break
      }
      case '/profile/': {
        presenceData.details = 'Viewing Profile'
        break
      }
      case '/settings/': {
        presenceData.details = 'Viewing Settings'
        break
      }
      case '/notifications/': {
        presenceData.details = 'Viewing Notifications'
        break
      }
      default:
        if (pathname.startsWith('/playlist/')) {
          const playlistName = document.querySelector<HTMLHeadingElement>('h1#playlist-title')
          presenceData.details = 'Viewing Playlist'
          if (playlistName)
            presenceData.state = playlistName.textContent
        }
        else if (pathname.includes('monetization')) {
          presenceData.details = 'Looking at Monetization options'
        }
        else if (pathname === '/help-us-grow/') {
          presenceData.details = 'At funding page'
        }
        else if (pathname.startsWith('/search')) {
          const { search } = location
          presenceData.details = `Searching for ${search.substring(
            7,
            search.includes('&') ? search.indexOf('&') : search.length,
          )}`
        }
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
