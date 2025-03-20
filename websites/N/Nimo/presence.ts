import { Assets } from 'premid'

let elapsed = Math.floor(Date.now() / 1000)
let oldLang = 'en'
let prevUrl = document.location.href

const presence = new Presence({
  clientId: '939877915032682576',
})
function getElement(query: string): string | undefined {
  return document.querySelector(query)?.textContent ?? undefined
}
async function getStrings() {
  return presence.getStrings(
    {
      play: 'general.playing',
      pause: 'general.paused',
      live: 'general.live',
      viewHome: 'general.viewHome',
      browse: 'general.browsing',
      watchingLive: 'general.watchingLive',
      watchingVid: 'general.watchingVid',
      viewCategory: 'general.viewCategory',
      viewTheir: 'twitch.viewTheir',
      channelSettings: 'twitch.channelSettings',
      followList: 'twitch.followList',
      channelAnaly: 'twitch.channelAnaly',
      streamSum: 'twitch.streamSum',
      dashboard: 'twitch.dashboard',
      dashboardManage: 'twitch.dashboardManage',
      achievements: 'twitch.achievements',
      camp: 'twitch.camp',
      campBasic: 'twitch.campBasic',
      campSetup: 'twitch.campSetup',
      viewFollow: 'twitch.viewFollow',
      activity: 'twitch.activity',
      colls: 'twitch.colls',
      esport: 'twitch.esports',
      searchingFor: 'general.searchFor',
      searchingSomething: 'general.searchSomething',
      search: 'general.search',
      watchStream: 'general.buttonWatchStream',
      watchVideo: 'general.buttonWatchVideo',
    },
    oldLang,
  )
}

let strings: Awaited<ReturnType<typeof getStrings>>

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/N/Nimo/assets/logo.png',
    startTimestamp: elapsed,
  }
  const { pathname, href } = document.location
  const [
    showTimestamps,
    newLang,
    privacy,
    vidDetail,
    vidState,
    streamDetail,
    streamState,
    profilePic,
    buttons,
  ] = await Promise.all([
    presence.getSetting<boolean>('timestamp'),
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<string>('vidDetail'),
    presence.getSetting<string>('vidState'),
    presence.getSetting<string>('streamDetail'),
    presence.getSetting<string>('streamState'),
    presence.getSetting<boolean>('profilePic'),
    presence.getSetting<boolean>('buttons'),
  ])
  const title = getElement(
    ':is(div.nimo-rm_title-text > h3, #meta-info > div.video-info h1, .nimo-player__room-meta_title-text)',
  )
  const streamer = getElement(
    ':is(div.nimo-rm_sub-title > h1, #meta-info div.anchor-name.n-as-text-over > a > h2, .nimo-player__room-meta__nick)',
  )
  const game = getElement('div.nimo-anchor-broadcast-game > a > h4')

  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }

  if (href !== prevUrl) {
    prevUrl = href
    elapsed = Math.floor(Date.now() / 1000)
  }

  if (pathname === '/') {
    presenceData.details = strings.viewHome
  }
  else if (pathname.startsWith('/game')) {
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = strings.browse
    presenceData.details = strings.browse
    if (!privacy) {
      presenceData.details = strings.viewCategory
      presenceData.state = document.querySelector<HTMLHeadingElement>(
        ':is(#root div.n-fx1 div > h1, div.game-ahb-info > h1)',
      )?.textContent
    }
  }
  else if (pathname.startsWith('/esports')) {
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = strings.browse
    presenceData.details = strings.browse
    if (!privacy)
      presenceData.details = strings.esport
  }
  else if (pathname.startsWith('/search')) {
    presenceData.details = strings.searchingSomething
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = strings.search
    if (!privacy) {
      presenceData.details = strings.searchingFor
      presenceData.state = document
        .querySelector('div.searchTip > span:nth-child(4)')
        ?.textContent
        ?.replaceAll('"', '')
    }
  }
  else if (pathname.startsWith('/i')) {
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = strings.browse
    presenceData.details = strings.browse
    if (!privacy) {
      delete presenceData.smallImageKey
      delete presenceData.smallImageText
      presenceData.details = strings.viewTheir
      presenceData.state = strings.channelSettings
      if (pathname.includes('/streamercamp')) {
        presenceData.details = strings.camp
        presenceData.smallImageKey = Assets.Reading
        presenceData.smallImageText = strings.browse
        delete presenceData.state
        if (pathname.includes('/quickstart'))
          presenceData.state = strings.campBasic
        else if (pathname.includes('/resources'))
          presenceData.state = strings.campSetup
      }
      else if (pathname.includes('/home')) {
        presenceData.state = strings.dashboard
      }
      else if (pathname.includes('/my-subscribe')) {
        presenceData.details = strings.viewFollow
        delete presenceData.state
      }
      else if (pathname.includes('/followers')) {
        presenceData.state = strings.followList
      }
      else if (pathname.includes('/channel-analytics')) {
        presenceData.state = strings.channelAnaly
      }
      else if (pathname.includes('/live-end')) {
        presenceData.state = strings.streamSum
      }
      else if (
        pathname.includes('/stream-manager')
        || pathname.includes('/live-preview')
        || pathname.includes('/stream-targets')
        || pathname.includes('/stream-url')
      ) {
        presenceData.details = strings.dashboardManage
        delete presenceData.state
      }
      else if (
        pathname.includes('/anchor-level')
        || pathname.includes('/my-growth')
      ) {
        presenceData.state = strings.achievements
      }
      else if (pathname.includes('/fans-club')) {
        presenceData.state = strings.activity
      }
      else if (pathname.includes('/video')) {
        presenceData.state = strings.colls
      }
    }
  }
  else if (title && streamer) {
    if (
      document.querySelector('#nimo-player div.time-label-control.control-item')
    ) {
      const { duration, currentTime, paused } = document.querySelector<HTMLVideoElement>('video')!
      if (!privacy) {
        presenceData.details = vidDetail
          .replace('%title%', title)
          .replace('%uploader%', streamer)
        presenceData.state = vidState
          .replace('%title%', title)
          .replace('%uploader%', streamer)

        delete presenceData.startTimestamp

        if (!paused) {
          [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(currentTime, duration)
        }

        presenceData.buttons = [
          { label: strings.watchVideo, url: document.URL },
        ]
      }
      else {
        presenceData.details = strings.watchingVid
      }
      presenceData.smallImageKey = paused ? Assets.Pause : Assets.Play
      presenceData.smallImageText = paused ? strings.pause : strings.play
    }
    else {
      if (!privacy) {
        presenceData.details = streamDetail
          .replace('%title%', title)
          .replace('%streamer%', streamer)
          .replace('%game%', game ?? '')
        presenceData.state = streamState
          .replace('%title%', title)
          .replace('%streamer%', streamer)
          .replace('%game%', game ?? '')
        presenceData.buttons = [
          { label: strings.watchStream, url: document.URL },
        ]
      }
      else {
        presenceData.details = strings.watchingLive
      }
      presenceData.smallImageKey = Assets.Live
      presenceData.smallImageText = strings.live
    }
    if (profilePic) {
      presenceData.largeImageKey = document
        .querySelector<HTMLImageElement>(
          ':is(#meta-info a > span > picture > img, #root div.nimo-room__theater-section span > a > span > picture > img)',
        )
        ?.src
        .replace('w120', 'w300')
    }
  }
  if (!showTimestamps) {
    delete presenceData.startTimestamp
    delete presenceData.endTimestamp
  }
  if (!buttons)
    delete presenceData.buttons
  presence.setActivity(presenceData)
})
