import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '1555895308649500783',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.imgur.com/dKBCFwR.png',
}

async function getStrings() {
  return presence.getStrings({
    play: 'general.playing',
    pause: 'general.paused',
    browse: 'general.browsing',
    viewHome: 'general.viewHome',
    searchFor: 'general.searchFor',
    buttonViewEpisode: 'general.buttonViewEpisode',
    live: 'general.live',
    buttonWatchStream: 'general.buttonWatchStream',
  })
}

// The real player lives in a same-origin iframe; the page's own <video> is only a thumbnail placeholder
function getPlayerVideo() {
  const playerDocument = document.querySelector<HTMLIFrameElement>('iframe[src="/player"]')?.contentDocument
  return playerDocument?.querySelector<HTMLVideoElement>('video.vjs-tech') ?? playerDocument?.querySelector('video')
}

// The thumbnail goes through the site's image proxy; use the original CDN image instead
function getThumbnailImage() {
  const poster = document.querySelector<HTMLVideoElement>('video.thumbnail')?.poster
  return poster ? new URL(poster).searchParams.get('src') : null
}

let oldLang: string | null = null
let strings: Awaited<ReturnType<typeof getStrings>>

presence.on('UpdateData', async () => {
  const { pathname, href } = document.location
  const [newLang, buttons, cover, hidePaused, browsing] = await Promise.all([
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('cover'),
    presence.getSetting<boolean>('hidePaused'),
    presence.getSetting<boolean>('browsing'),
  ])

  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }

  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    details: strings.browse,
  }

  if (pathname === '/') {
    if (!browsing)
      return presence.clearActivity()

    presenceData.details = strings.viewHome
  }
  else if (pathname.startsWith('/search/')) {
    presenceData.details = strings.searchFor
    presenceData.state = decodeURIComponent(pathname.split('/')[2] ?? '')
    presenceData.smallImageKey = Assets.Search
  }
  else if (/^\/vod\/\d+\/[^/]+\/[^/]+/.test(pathname)) {
    const video = getPlayerVideo()
    const title = document.querySelector('h1.title')?.textContent?.trim()

    if (video && title) {
      if (hidePaused && video.paused)
        return presence.clearActivity()

      presenceData.details = title
      presenceData.state = document.querySelector('h2.subtitle_section')?.textContent?.trim()

      if (cover)
        presenceData.largeImageKey = getThumbnailImage() ?? ActivityAssets.Logo

      presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
      presenceData.smallImageText = video.paused ? strings.pause : strings.play

      if (video.paused) {
        delete presenceData.startTimestamp
      }
      else {
        [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(video)
      }

      if (buttons)
        presenceData.buttons = [{ label: strings.buttonViewEpisode, url: href }]
    }
  }
  else if (pathname.startsWith('/channel/watch/')) {
    const video = getPlayerVideo()
    // Strip the leading channel number, e.g. "54 三立新聞LIVE"
    const channel = document.querySelector('h1.title_section')?.textContent?.trim().replace(/^\d+\s+/, '')

    if (video && channel) {
      if (hidePaused && video.paused)
        return presence.clearActivity()

      presenceData.details = channel
      presenceData.state = document.querySelector('h2.subtitle')?.textContent?.trim()

      if (cover)
        presenceData.largeImageKey = getThumbnailImage() ?? ActivityAssets.Logo

      presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Live
      presenceData.smallImageText = video.paused ? strings.pause : strings.live

      if (video.paused)
        delete presenceData.startTimestamp

      if (buttons)
        presenceData.buttons = [{ label: strings.buttonWatchStream, url: href }]
    }
  }
  else if (!browsing) {
    return presence.clearActivity()
  }

  presence.setActivity(presenceData)
})
