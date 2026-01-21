import { ActivityType } from 'premid'

const presence = new Presence({
  clientId: '1463157769053016239',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)
let pausedTimestamp: number | null = null

enum CustomAssets {
  Logo = 'https://iili.io/friz2yB.png',
  LogoNoBG = 'https://iili.io/frizFTP.png',
}

const presenceData: PresenceData = {
  largeImageKey: CustomAssets.Logo,
  type: ActivityType.Watching,
}

presence.on('UpdateData', async () => {
  const { pathname, href } = document.location

  const [
    showWhileMain,
    showWhileWatching,
  ] = await Promise.all([
    presence.getSetting<boolean>('showWhileMain'),
    presence.getSetting<boolean>('showWhileWatching'),
  ])

  const inOtherPages = pathname === '' || pathname === '/' || pathname.startsWith('/browse') || pathname.startsWith('/discover')
  // Browsing the site
  if (inOtherPages) {
    let currentPage = pathname === '' || pathname === '/' ? 'homepage' : pathname.slice(1)
    if (currentPage.startsWith('discover'))
      currentPage = 'discover page'
    if (currentPage.startsWith('browse'))
      currentPage = 'browse page'

    presenceData.details = 'P-Stream'
    presenceData.state = `In the ${currentPage}`
    presenceData.startTimestamp = browsingTimestamp
    presenceData.endTimestamp = undefined
    presenceData.largeImageKey = CustomAssets.Logo
    presenceData.largeImageText = 'P-Stream'
    presenceData.smallImageKey = undefined
    presenceData.name = 'P-Stream'

    if (showWhileMain)
      presence.setActivity(presenceData)
    else presence.clearActivity()
    return
  }

  // Watching a video
  const video = document.querySelector('video') as HTMLVideoElement | null
  if (pathname.startsWith('/media') && video) {
    if (href.includes('tmdb-movie'))
      presenceData.name = document.title
    else if (href.includes('tmdb-tv'))
      presenceData.name = document.title.split(' - ')[0]
    else
      presenceData.name = 'P-Stream'

    presenceData.details = document.title
    presenceData.state = 'Loading...'

    const isPlaying = !video.paused && !video.ended && video.readyState > 2

    if (navigator.mediaSession) {
      presenceData.largeImageKey = navigator.mediaSession.metadata?.artwork?.[0]?.src
      presenceData.smallImageKey = CustomAssets.LogoNoBG
      presenceData.smallImageText = 'P-Stream'
    }

    if (isPlaying) {
      // presenceData.smallImageKey = Assets.Play
      // presenceData.smallImageText = 'Playing'
      presenceData.startTimestamp = Math.floor(Date.now() / 1000) - Math.floor(video.currentTime)
      presenceData.endTimestamp = presenceData.startTimestamp + Math.floor(video.duration)
      presenceData.state = `Watching`
      pausedTimestamp = null // Reset paused timestamp when playing
    }
    else {
      // presenceData.smallImageKey = Assets.Pause
      // presenceData.smallImageText = 'Paused'
      presenceData.state = `Paused`
      if (!pausedTimestamp) {
        pausedTimestamp = Math.floor(Date.now() / 1000)
      }
      // When paused, we show the timestamp when the video was paused
      presenceData.startTimestamp = pausedTimestamp
      presenceData.endTimestamp = undefined
    }

    if (showWhileWatching)
      presence.setActivity(presenceData)
    else presence.clearActivity()
  }
})
