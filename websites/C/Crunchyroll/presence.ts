import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '608065709741965327',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/C/Crunchyroll/assets/logo.png',

  OpenBook = 'https://cdn.rcd.gg/PreMiD/websites/C/Crunchyroll/assets/0.png',
}

async function getStrings() {
  return presence.getStrings(
    {
      play: 'general.playing',
      pause: 'general.paused',
      browse: 'general.browsing',
      reading: 'general.reading',
      viewPage: 'general.viewPage',
      viewManga: 'general.viewManga',
      viewSeries: 'general.buttonViewSeries',
      watchEpisode: 'general.buttonViewEpisode',
      readingArticle: 'general.readingArticle',
      viewCategory: 'general.viewCategory',
      chapter: 'general.chapter',
      search: 'general.search',
      manga: 'general.manga',
      page: 'general.page',
    },

  )
}

let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null
let playback: boolean = false
const browsingTimestamp = Math.floor(Date.now() / 1000)

let iFrameVideo: boolean,
  currentTime: number,
  duration: number,
  paused: boolean

interface iFrameData {
  iFrameVideoData: {
    iFrameVideo: boolean
    currTime: number
    dur: number
    paused: boolean
  }
}

presence.on('iFrameData', (inc: unknown) => {
  const data = inc as iFrameData
  playback = data.iFrameVideoData !== null

  if (playback) {
    ({
      iFrameVideo,
      currTime: currentTime,
      dur: duration,
      paused,
    } = data.iFrameVideoData)
  }
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    type: ActivityType.Watching,
    startTimestamp: browsingTimestamp,
  }
  const { href, pathname } = window.location
  const [newLang, showCover, showBrowsingActivity] = await Promise.all([
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('cover'),
    presence.getSetting<boolean>('browsingActivity'),
  ])

  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }

  if (
    iFrameVideo !== false
    && !Number.isNaN(duration)
    && pathname.includes('/watch/')
  ) {
    const videoTitle = document.querySelector<HTMLHeadingElement>('a > h4')?.textContent
    presenceData.smallImageKey = paused ? Assets.Pause : Assets.Play
    presenceData.smallImageText = paused ? strings.pause : strings.play;
    [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(Math.floor(currentTime), Math.floor(duration))

    presenceData.details = videoTitle ?? 'Title not found...'
    presenceData.state = document.querySelector<HTMLHeadingElement>('h1.title')?.textContent

    presenceData.largeImageKey = document.querySelector<HTMLMetaElement>('[property=\'og:image\']')
      ?.content ?? ActivityAssets.Logo

    if (paused) {
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
    }

    if (videoTitle) {
      presenceData.buttons = [
        {
          label: strings.watchEpisode,
          url: href,
        },
        {
          label: strings.viewSeries,
          url: document.querySelector<HTMLAnchorElement>('.show-title-link')?.href ?? '',
        },
      ]
    }
  }
  else if (pathname.includes('/series') && showBrowsingActivity) {
    presenceData.details = strings.viewPage
    presenceData.state = document.querySelector<HTMLHeadingElement>('h1.title')?.textContent
    presenceData.largeImageKey = document.querySelector<HTMLMetaElement>('[property=\'og:image\']')?.content ?? ActivityAssets.Logo
    presenceData.buttons = [
      {
        label: strings.viewSeries,
        url: href,
      },
    ]
  }
  else if (pathname.includes('/search') && showBrowsingActivity) {
    presenceData.details = strings.search
    presenceData.state = document.querySelector<HTMLInputElement>('input[class^="search-input"]')?.value
    presenceData.smallImageKey = Assets.Search
  }
  else if (pathname.includes('/simulcasts') && showBrowsingActivity) {
    presenceData.details = strings.viewPage
    presenceData.state = `${
      document.querySelector('h1 + div span')?.textContent
    } ${document.querySelector('h1')?.textContent}`
  }
  else if (pathname.includes('/videos') && showBrowsingActivity) {
    presenceData.details = strings.viewCategory
    presenceData.state = document.querySelector('h1')?.textContent
  }
  else if (/\/anime-.*?\/\d{4}\//.test(pathname) && showBrowsingActivity) {
    presenceData.details = strings.readingArticle
    presenceData.state = document.querySelector<HTMLHeadingElement>(
      '.crunchynews-header',
    )?.textContent
    if (showCover) {
      presenceData.largeImageKey = document.querySelector<HTMLImageElement>('.mug')?.src
    }
  }
  else if (showBrowsingActivity) {
    presenceData.details = strings.browse
    presenceData.startTimestamp = browsingTimestamp

    delete presenceData.state
    delete presenceData.smallImageKey
  }
  else {
    return presence.clearActivity()
  }

  if (!showCover)
    presenceData.largeImageKey = ActivityAssets.Logo

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.clearActivity()
})
