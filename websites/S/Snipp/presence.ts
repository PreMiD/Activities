import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '1369465791132729425',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.snipp.gg/4918533360320604/ec966c5df71c7d6edf25f33164d7ea79.png',
}

presence.on('UpdateData', async () => {
  const { pathname } = document.location

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    type: ActivityType.Watching,
  }

  if (document.location.hostname.startsWith('docs.')) {
    presenceData.state = 'Reading the docs'
    presenceData.smallImageKey = Assets.Search
  }
  else if (pathname === '/upload') {
    presenceData.state = 'Uploading a file'
    presenceData.smallImageKey = Assets.Uploading
  }
  else if (pathname.includes('/discover')) {
    presenceData.state = 'Browsing discover'
    presenceData.smallImageKey = Assets.Viewing
    presenceData.buttons = [{ label: 'View discover', url: 'https://snipp.gg/discover' }]
    presenceData.detailsUrl = 'https://snipp.gg/discover'
  }
  else if (pathname.startsWith('/p/')) {
    const title = document.querySelector<HTMLElement>('section h1')
    const avatar = document.querySelector<HTMLImageElement>('section img[src*="avatar"], section img[alt*="avatar"]')
    const video = document.querySelector<HTMLVideoElement>('section video')
    const author = document.querySelector<HTMLElement>('div > span > span:nth-child(1) > button > p')

    if (video) {
      if (!video.paused)
        [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(video)

      presenceData.details = title?.textContent ?? 'Watching a post'
      presenceData.largeImageKey = video.poster || ActivityAssets.Logo
    }
    else {
      presenceData.details = title?.textContent ?? 'Viewing a post'
      presenceData.largeImageKey = ActivityAssets.Logo
    }

    presenceData.state = author?.textContent ? `by ${author.textContent}` : 'Unknown author'
    presenceData.smallImageKey = avatar?.src ?? Assets.Viewing
    presenceData.buttons = [
      {
        label: video ? 'Watch on Snipp' : 'View on Snipp',
        url: `https://snipp.gg${pathname}`,
      },
    ]
    presenceData.detailsUrl = `https://snipp.gg${pathname}`
  }
  else if (pathname.includes('/gallery')) {
    presenceData.state = 'Viewing gallery'
    presenceData.smallImageKey = Assets.Viewing
    presenceData.detailsUrl = `https://snipp.gg${pathname}`
  }
  else if (pathname.includes('/u/')) {
    const username = document.querySelector<HTMLElement>('section h1')
    presenceData.state = username?.textContent
      ? `Viewing ${username.textContent}'s profile`
      : 'Viewing a profile'
    presenceData.smallImageKey = Assets.Viewing
    presenceData.detailsUrl = `https://snipp.gg${pathname}`
  }
  else if (pathname.includes('/settings')) {
    const subpath = pathname.replace('/settings', '')
    presenceData.state = subpath
      ? `Changing ${subpath.slice(1).replace(/-/g, ' ')} settings`
      : 'Changing settings'
    presenceData.smallImageKey = Assets.Writing
  }
  else if (pathname.includes('/about')) {
    presenceData.state = 'Reading about us'
    presenceData.smallImageKey = Assets.Reading
  }
  else if (pathname.includes('/support')) {
    presenceData.state = 'Contacting support'
    presenceData.smallImageKey = Assets.Question
  }

  if (presenceData.state)
    presence.setActivity(presenceData)
  else
    presence.clearActivity()
})