import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1481962585212584007',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

let oldLang: string = ''
async function getStrings() {
  return presence.getStrings({
    play: 'general.playing',
    pause: 'general.paused',
    live: 'general.live',
    browse: 'general.browsing',
    ad: 'youtube.ad',
    watchingLive: 'general.watchingLive',
    watchingVid: 'general.watchingVid',
    watchStream: 'general.buttonWatchStream',
    watchVideo: 'general.buttonWatchVideo',
  })
}

function parseTimeToSeconds(timeStr: string) {
  let hours = 0
  let minutes = 0
  let seconds = 0
  const times = timeStr.split(':')
  switch (times.length) {
    case 3:
      [hours, minutes, seconds] = times.map(Number) as [number, number, number]
      break
    case 2:
      [minutes, seconds] = times.map(Number) as [number, number]
      break
    case 1:
      seconds = Number(times[0] ?? 0)
      break
  }
  return (hours * 3600) + (minutes * 60) + seconds
}

enum ActivityAssets {
  Logo = 'https://i.imgur.com/u090RB8.png',
}

let strings: Awaited<ReturnType<typeof getStrings>>

presence.on('UpdateData', async () => {
  const [newLang, showStreamerLogo] = await Promise.all([
    presence.getSetting<string>('lang'),
    presence.getSetting<boolean>('logo'),
  ])

  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }
  const presenceData: PresenceData = {
    details: strings.browse,
    largeImageKey: ActivityAssets.Logo,
    smallImageKey: Assets.Search,
    startTimestamp: browsingTimestamp,
    type: ActivityType.Watching,
  }

  const { pathname, href } = document.location

  switch (pathname.split('/')[2]) {
    case 'live':
    case 'vods': {
      const liveStatus = pathname.split('/')[2] === 'live'
      const streamTitle = liveStatus ? document.querySelector('[class^="live_title"]')?.textContent : document.querySelector('[class^="video_information"]>h2')?.textContent
      const streamerName = document.querySelector('[class^="user_name"]')?.textContent
      const streamerLogo = document.querySelector<HTMLImageElement>('.StreamerCardView>[class^="streamer_info"]>[class^="user_avatar"]>a>picture>source')?.srcset
      const streamPlaying = Boolean(document.querySelector('button.vjs-playing'))
      presenceData.details = streamTitle ?? undefined
      presenceData.state = streamerName ?? undefined
      presenceData.largeImageKey = showStreamerLogo ? (streamerLogo ?? undefined) : ActivityAssets.Logo
      presenceData.smallImageKey = liveStatus ? Assets.Live : (streamPlaying ? Assets.Play : Assets.Pause)
      presenceData.smallImageText = liveStatus ? strings.live : (streamPlaying ? strings.play : strings.pause)
      presenceData.buttons = [{ url: href, label: liveStatus ? strings.watchStream : strings.watchVideo }]
      if (!liveStatus) {
        const nowTimestamp = document.querySelector('.vjs-unified-time-current')?.textContent ?? ''
        const durationTimestamp = document.querySelector('.vjs-unified-time-duration')?.textContent ?? ''
        const [start, end] = getTimestamps(
          parseTimeToSeconds(nowTimestamp),
          parseTimeToSeconds(durationTimestamp),
        )
        presenceData.startTimestamp = start
        presenceData.endTimestamp = end
      }
      else {
        delete presenceData.endTimestamp
      }
      break
    }
  }

  presence.setActivity(presenceData)
})
