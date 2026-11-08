import { ActivityType, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '1232944311415603281',
})
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
  )
}
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/C/CHZZK/assets/0.png',
}

enum ChzzkAssets {
  Browse = 'https://cdn.rcd.gg/PreMiD/websites/C/CHZZK/assets/1.png',
  Live = 'https://cdn.rcd.gg/PreMiD/websites/C/CHZZK/assets/2.png',
  Play = 'https://cdn.rcd.gg/PreMiD/websites/C/CHZZK/assets/3.png',
  Pause = 'https://cdn.rcd.gg/PreMiD/websites/C/CHZZK/assets/4.png',
}

// CHZZK renders fully-hashed CSS module class names (e.g. `_title_1aj24_25`) that
// change on every deploy, so page metadata is read from the public API instead of
// scraping the DOM. The `<video>` element (stable player class) is still used for
// VOD progress and paused state.
const API_BASE = 'https://api.chzzk.naver.com/service/v3'

interface ChannelInfo {
  channelName?: string
  channelImageUrl?: string
}
interface LiveDetail {
  liveTitle?: string
  status?: string
  openDate?: string
  channel?: ChannelInfo
}
interface VideoDetail {
  videoTitle?: string
  channel?: ChannelInfo
}

const cache = new Map<string, { data: unknown, expires: number }>()
const inFlight = new Map<string, Promise<unknown>>()

async function fetchInfo<T>(
  key: string,
  url: string,
  ttl: number,
): Promise<T | null> {
  const cached = cache.get(key)
  if (cached && cached.expires > Date.now())
    return cached.data as T | null

  let promise = inFlight.get(key)
  if (!promise) {
    promise = fetch(url, { headers: { Accept: 'application/json' } })
      .then(res => res.json())
      .then((json) => {
        const data = json?.content ?? null
        cache.set(key, { data, expires: Date.now() + ttl })
        return data
      })
      .catch(() => null)
      .finally(() => inFlight.delete(key))
    inFlight.set(key, promise)
  }
  return (await promise) as T | null
}

// CHZZK `openDate` is "YYYY-MM-DD HH:mm:ss" in KST (UTC+9); convert to a
// timezone-independent unix timestamp (seconds) for the elapsed-time counter.
function kstToUnix(date: string): number {
  const p = date.match(/\d+/g)?.map(Number)
  if (!p || p.length < 6)
    return Math.floor(Date.now() / 1000)
  return Math.floor(
    (Date.UTC(p[0]!, p[1]! - 1, p[2]!, p[3]!, p[4]!, p[5]!)
      - 9 * 60 * 60 * 1000) / 1000,
  )
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
    smallImageKey: ChzzkAssets.Browse,
    startTimestamp: browsingTimestamp,
    type: ActivityType.Watching,
  }
  const { pathname, href } = document.location
  const [, route, id] = pathname.split('/')
  const video = document.querySelector('video')

  // Best-effort ad detection kept from the previous implementation.
  const adPlaying = !!document.querySelector<HTMLElement>(
    'div.ad_info_area',
  )?.offsetParent

  switch (route) {
    case 'live': {
      if (!id)
        break
      if (adPlaying) {
        presenceData.details = strings.ad
        presenceData.smallImageKey = ChzzkAssets.Play
        presenceData.smallImageText = strings.play
        break
      }

      const info = await fetchInfo<LiveDetail>(
        `live:${id}`,
        `${API_BASE}/channels/${id}/live-detail`,
        30_000,
      )
      if (!info || info.status !== 'OPEN')
        break

      presenceData.details = info.liveTitle
      presenceData.state = info.channel?.channelName
      presenceData.largeImageKey
        = showStreamerLogo && info.channel?.channelImageUrl
          ? info.channel.channelImageUrl
          : ActivityAssets.Logo
      presenceData.smallImageKey = ChzzkAssets.Live
      presenceData.smallImageText = strings.live
      presenceData.buttons = [{ url: href, label: strings.watchStream }]

      if (showElapsedTime && info.openDate)
        presenceData.startTimestamp = kstToUnix(info.openDate)

      if (video?.paused) {
        presenceData.smallImageKey = ChzzkAssets.Pause
        presenceData.smallImageText = strings.pause
        delete presenceData.startTimestamp
      }
      break
    }
    case 'video': {
      if (!id)
        break
      if (adPlaying) {
        presenceData.details = strings.ad
        presenceData.smallImageKey = ChzzkAssets.Play
        presenceData.smallImageText = strings.play
        break
      }

      const info = await fetchInfo<VideoDetail>(
        `video:${id}`,
        `${API_BASE}/videos/${id}`,
        600_000,
      )
      if (!info)
        break

      presenceData.details = info.videoTitle
      presenceData.state = info.channel?.channelName
      presenceData.largeImageKey
        = showStreamerLogo && info.channel?.channelImageUrl
          ? info.channel.channelImageUrl
          : ActivityAssets.Logo
      presenceData.smallImageKey = ChzzkAssets.Play
      presenceData.smallImageText = strings.play
      presenceData.buttons = [{ url: href, label: strings.watchVideo }]

      if (video) {
        [presenceData.startTimestamp, presenceData.endTimestamp]
          = getTimestampsFromMedia(video)

        if (video.paused) {
          presenceData.smallImageKey = ChzzkAssets.Pause
          presenceData.smallImageText = strings.pause
          delete presenceData.startTimestamp
          delete presenceData.endTimestamp
        }
      }
      break
    }
  }
  presence.setActivity(presenceData)
})
