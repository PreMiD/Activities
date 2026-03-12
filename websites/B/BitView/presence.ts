import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '899181356372860958',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
const VIEW_PAGES = new Map<string, string>([
  ['playlists', 'Viewing their playlists'],
  ['videos', 'Viewing their uploaded videos'],
  ['subscriptions', 'Viewing their subscriptions videos'],
  ['favorites', 'Viewing their favorite videos'],
  ['quicklist', 'Viewing their quicklist'],
  ['account', 'Viewing their account settings'],
  ['history', 'Viewing their history'],
  ['groups', 'Viewing their joined groups'],
  ['channel', 'Viewing a channel'],
  ['inbox', 'Viewing their inbox'],
  ['guidelines', 'Viewing the community guidelines'],
  ['terms', 'Viewing the terms of use'],
  ['privacy', 'Viewing the privacy policy'],
])
function getChannelURL() {
  return `https://${document.location.hostname}${document
    .querySelector('#watch-channel-stats > a')
    ?.getAttribute('href')}`
}
function getChannelAvatar() {
  return `https://${document.location.host}${document
    .querySelector('.user-thumb-semismall > div > img')
    ?.getAttribute('src')}`
}
function getChannelSuscribers() {
  return document.querySelector('#user_subscribers > div > div > a')
    ?.textContent
}

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/B/BitView/assets/logo.png',
}

presence.on('UpdateData', async () => {
  // Functions and consts.
  const { href, search, pathname } = document.location
  const presenceData: PresenceData = {
    name: 'BitView',
    type: ActivityType.Watching,
    largeImageKey: ActivityAssets.Logo,
  }
  const baseViewingPresence = () => {
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = 'Viewing'
    presenceData.startTimestamp = browsingTimestamp
  }
  const baseSearchPresence = () => {
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = 'Searching'
    presenceData.startTimestamp = browsingTimestamp
  }
  const baseBrowsing = (browsingIn: string) => {
    baseSearchPresence()
    presenceData.details = 'Browsing through'
    presenceData.state = `${browsingIn}`
  }

  if (pathname === '/') {
    // Home Page
    presenceData.details = 'Viewing home page'
    presenceData.startTimestamp = browsingTimestamp
  }

  if (pathname.includes('watch') && document.querySelector('video')) {
    const video = document.querySelector('video')!

    presenceData.details = document.querySelector('#watch-vid-title')?.children[1] // Video name
    presenceData.state = document.querySelector('#watch-channel-stats > a'); // Channel name
    [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(video)
    presenceData.buttons = [
      {
        label: 'Watch Video',
        url: href,
      },
      {
        label: 'View Channel',
        url: getChannelURL(),
      },
    ]

    if (video.paused) {
      presenceData.smallImageKey = Assets.Pause
      presenceData.smallImageText = 'Paused'
      delete presenceData.endTimestamp
    }
    else {
      const isLooping = document
        .querySelector('#watch-player-div')
        ?.children[4]
        ?.getAttribute('class')
        ?.includes('loop') // video.loop doesn't work.

      presenceData.smallImageKey = isLooping ? Assets.Repeat : Assets.Play

      presenceData.smallImageText = isLooping ? 'On loop' : 'Playing'
    }
  }
  else if (pathname.includes('user')) {
    // Viewing a Channel.
    presenceData.details = VIEW_PAGES.get('channel')
    presenceData.state = document
      .querySelector('#main-channel-left > div')
      ?.children[1]
      ?.querySelector('div') // Channel name

    presenceData.largeImageKey = getChannelAvatar()
    presenceData.smallImageKey = ActivityAssets.Logo
    presenceData.smallImageText = `${getChannelSuscribers()} Suscribers`
    presenceData.buttons = [{ label: 'View Channel', url: href }]
    presenceData.startTimestamp = browsingTimestamp
  }
  else if (pathname.includes('results')) {
    // Searching.
    presenceData.details = 'Searching for:'
    presenceData.state = Object.fromEntries(
      new URLSearchParams(search).entries(),
    ).search // Query String "search"
    baseSearchPresence()
  }
  else if (pathname.includes('my') || pathname.includes('viewing')) {
    // my_videos, my_subscriptons... and viewing_historial
    baseViewingPresence()
    presenceData.details = VIEW_PAGES.get(pathname.split('_')[1]!) || 'Viewing a page'
  }
  else if (pathname.includes('inbox')) {
    baseViewingPresence()
    presenceData.details = VIEW_PAGES.get('inbox')
  }
  else if (['guidelines', 'terms', 'privacy'].includes(pathname.slice(1))) {
    baseViewingPresence()
    presenceData.details = VIEW_PAGES.get(pathname.slice(1))
  }
  else if (pathname.includes('browse')) {
    baseBrowsing('all videos list')
  }
  else if (pathname.includes('groups')) {
    baseBrowsing('all groups list')
  }
  else if (pathname.includes('channels')) {
    baseBrowsing('all channels list')
  }
  else if (pathname.includes('partners')) {
    baseBrowsing('partners list')
  }
  else if (pathname.includes('blog')) {
    baseBrowsing('the blog')
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
