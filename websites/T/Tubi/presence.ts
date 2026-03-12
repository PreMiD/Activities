import { Assets } from 'premid'

const presence = new Presence({
  clientId: '503557087041683458',
})
const browingTimestamp = Math.floor(Date.now() / 1000)
async function getStrings() {
  return presence.getStrings(
    {
      play: 'general.playing',
      paused: 'general.paused',
      browse: 'general.browsing',
      live: 'general.live',
      buttonWatchVideo: 'general.buttonWatchVideo',
      buttonWatchLive: 'general.buttonWatchStream',
      viewCategory: 'general.viewCategory',
      search: 'general.searchFor',
    },

  )
}
enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/T/Tubi/assets/logo.png',
}
let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    name: 'Tubi',
  }
  const video = document.querySelector<HTMLVideoElement>('video')
  const search = document.querySelector<HTMLInputElement>('[type="search"]')
  const { href, pathname } = document.location
  const [newLang, privacy, buttons, covers] = await Promise.all([
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('covers'),
  ])
  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }

  if (privacy) {
    presenceData.details = strings.browse
    return
  }
  if (search?.value) {
    presenceData.details = strings.search
    presenceData.state = search.value
    presenceData.smallImageKey = Assets.Search
  }
  else if (pathname.includes('/category/')) {
    presenceData.details = strings.viewCategory
    presenceData.state = document.querySelector<HTMLMetaElement>(
      '[property="og:title"]',
    )?.content
  }
  else if (video && !Number.isNaN(video.duration)) {
    presenceData.largeImageKey = document.querySelector<HTMLMetaElement>(
      'meta[property="og:image"]',
    )?.content
    presenceData.details = document.querySelector<HTMLMetaElement>(
      'meta[property="og:title"]',
    )?.content
    if (!pathname.includes('live')) {
      presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
      presenceData.smallImageText = video.paused
        ? strings.paused
        : strings.play;
      [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(
        Math.floor(video.currentTime),
        Math.floor(video.duration),
      )
      presenceData.buttons = [
        {
          label: strings.buttonWatchVideo,
          url: href,
        },
      ]
    }
    else {
      presenceData.buttons = [
        {
          label: strings.buttonWatchLive,
          url: href,
        },
      ]
      presenceData.smallImageText = strings.live
      presenceData.smallImageKey = Assets.Live
    }
    presenceData.startTimestamp = browingTimestamp

    if (video.paused) {
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
    }
  }
  else {
    presenceData.details = strings.browse
  }

  if (!buttons)
    delete presenceData.buttons
  if (!covers)
    presenceData.largeImageKey = ActivityAssets.Logo
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
