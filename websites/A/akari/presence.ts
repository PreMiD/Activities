import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '1474040762185547939',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://a.rafasu.com/akari-mid.png',
}

presence.on('UpdateData', async () => {
  const path = document.location.pathname
  const pageTitle = document.title.replace(/ - akari$/, '').trim()
  const isHomePage = pageTitle === 'akari'

  if (path.startsWith('/p/')) {
    const video = document.querySelector<HTMLVideoElement>('video')
    const isPlaying = video ? !video.paused && !video.ended : false

    const presenceData: PresenceData = {
      type: ActivityType.Watching,
      largeImageKey: ActivityAssets.Logo,
      largeImageText: 'akari',
      details: 'Watching',
      state: isHomePage ? 'an episode' : pageTitle,
      smallImageKey: isPlaying ? Assets.Play : Assets.Pause,
      smallImageText: isPlaying ? 'Playing' : 'Paused',
      startTimestamp: browsingTimestamp,
    }

    if (video && isPlaying && video.duration) {
      const [startTime, endTime] = getTimestampsFromMedia(video)
      presenceData.startTimestamp = startTime
      presenceData.endTimestamp = endTime
    }

    presence.setActivity(presenceData)
  }
  else {
    let details = 'Browsing'
    let state: string

    if (path.startsWith('/s/') || path.startsWith('/ss/')) {
      state = isHomePage ? 'a series' : pageTitle
    }
    else if (path.startsWith('/u/')) {
      const username = path.split('/')[2]
      details = 'Viewing a profile'
      state = username ? `@${username}` : 'a profile'
    }
    else if (path.startsWith('/genre') || path.startsWith('/tag')) {
      state = isHomePage ? 'a category' : pageTitle
    }
    else if (path === '/v' || path.startsWith('/v?')) {
      state = 'Videos'
    }
    else {
      state = isHomePage ? 'Home' : pageTitle
    }

    const presenceData: PresenceData = {
      largeImageKey: ActivityAssets.Logo,
      details,
      state,
      smallImageKey: Assets.Search,
      smallImageText: 'Browsing',
      startTimestamp: browsingTimestamp,
    }

    presence.setActivity(presenceData)
  }
})
