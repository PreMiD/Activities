import { ActivityType, Assets, getTimestamps, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '1481962585212584007',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

let oldLang: string = ''
async function getStrings() {
  return presence.getStrings(
    {
      play: 'general.playing',
      pause: 'general.paused',
      live: 'general.live',
      browse: 'general.browsing',
      ad: 'youtube.ad',
      watchingLive: 'general.watchingLive',
      watchingVid: 'general.watchingVid',
      watchStream: 'general.buttonWatchStream',
      watchVideo: 'general.buttonWatchVideo',
    },
    oldLang,
  )
}

function parseTimeToSeconds(timeStr: string) {
  let hours = 0, minutes = 0, seconds = 0
  const times = timeStr.split(':')
  switch (times.length) {
    case 3:
      [hours, minutes, seconds] = times.map(Number) as [number, number, number];
      break
    case 2:
      [minutes, seconds] = times.map(Number) as [number, number];
      break
    case 1:
      seconds = Number(times[0])
      break
  }
  return (hours * 3600) + (minutes * 60) + (seconds);
}

enum ActivityAssets {
  Logo = 'https://i.imgur.com/u090RB8.png',
}

let strings: Awaited<ReturnType<typeof getStrings>>
presence.on('UpdateData', async () => {
  const [newLang, showStreamerLogo, showElapsedTime] = await Promise.all([
    presence.getSetting<string>('lang'),
    presence.getSetting<boolean>('logo'),
    presence.getSetting<boolean>('time'),
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
  
  const { pathname, href } = document.location;

  switch (pathname.split('/')[2]) {
    case 'live':
    case 'vods':
      const liveStatus = pathname.split('/')[2] === 'live'
      const streamTitle = liveStatus ? document.querySelector('[class^="live_title"]')?.textContent : document.querySelector('[class^="video_information"]>h2')?.textContent,
        streamerName = document.querySelector('[class^="user_name"]')?.textContent,
        streamerLogo = document.querySelector<HTMLImageElement>('.StreamerCardView>[class^="streamer_info"]>[class^="user_avatar"]>a>picture>source')?.srcset,
        streamPlaying = document.querySelector("button.vjs-playing") ? true : false
      presenceData.details = streamTitle
      presenceData.state = streamerName
      presenceData.largeImageKey = showStreamerLogo ? streamerLogo : ActivityAssets.Logo
      presenceData.smallImageKey = liveStatus ? Assets.Live : (streamPlaying ? Assets.Play : Assets.Pause)
      presenceData.smallImageText = liveStatus ? strings.live : (streamPlaying ? strings.play : strings.pause)
      presenceData.buttons = [{ url: href, label: liveStatus ? strings.watchStream : strings.watchVideo }]
      if (!liveStatus && showElapsedTime) {
        const nowTimestamp = document.querySelector(".vjs-unified-time-current")?.textContent ?? "",
          durationTimestamp = document.querySelector(".vjs-unified-time-duration")?.textContent ?? "";
        [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(parseTimeToSeconds(nowTimestamp), parseTimeToSeconds(durationTimestamp))
      } else {
        delete presenceData.startTimestamp
        delete presenceData.endTimestamp
      }
      break
  }

  presence.setActivity(presenceData)
})
