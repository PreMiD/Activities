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
      readingAnArticle: 'general.readingAnArticle',
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
  const [newLang, showCover, showBrowsingActivity, showTitleAsPresence, hideWhenPaused] = await Promise.all([
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('cover'),
    presence.getSetting<boolean>('browsingActivity'),
    presence.getSetting<boolean>('titleAsPresence'),
    presence.getSetting<boolean>('hideWhenPaused'),
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
    const videoTitle = document.querySelector<HTMLHeadingElement>('a > h4')?.textContent ?? 'Title not found...'
    presenceData.smallImageKey = paused ? Assets.Pause : Assets.Play
    presenceData.smallImageText = paused ? strings.pause : strings.play;
    [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(Math.floor(currentTime), Math.floor(duration))

    let [season, episode] = [-1, -1]
    const infos = document.head?.querySelectorAll('script[type="application/ld+json"]')
    if (infos) {
      for (const info of infos) {
        const json = JSON.parse(info.innerHTML) as InfoScript
        if (json && json['@id']) {
          episode = json.episodeNumber
          season = json.partOfSeason.seasonNumber
          break
        }
      }
    }

    let episodeName = document.querySelector<HTMLHeadingElement>('h1.title')?.textContent

    if (season !== -1 && episode !== -1) {
      presenceData.largeImageText = `Season ${season}, Episode ${episode}`
      episodeName = episodeName?.replace(`E${episode} - `, '')
    }

    if (showTitleAsPresence)
      presenceData.name = videoTitle
    else
      presenceData.details = videoTitle

    presenceData.state = episodeName

    presenceData.largeImageKey = document.querySelector<HTMLMetaElement>('[property=\'og:image\']')
      ?.content ?? ActivityAssets.Logo

    if (paused) {
      if (hideWhenPaused)
        return presence.clearActivity()
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
    presenceData.state = document.querySelector<HTMLHeadingElement>('h1[class^="heading--"]')?.textContent

    let rating = document.querySelector('[class*=" star-rating-average-data__label"]')?.textContent
    rating = rating?.replace('(', '').replace(')', '')

    const _stars = rating?.split(' ')[0]
    const _rating = rating?.split(' ')[1]

    if (rating) {
      rating = `${_stars} • ${_rating}`
      presenceData.largeImageText = rating
    }

    presenceData.largeImageKey = document.head?.querySelector<HTMLMetaElement>('[property="og:image"]')?.content ?? ActivityAssets.Logo
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
  else if (/\/news\/.*?\/\d{4}\//.test(pathname) && showBrowsingActivity) {
    const headline = document.querySelector<HTMLHeadingElement>('[class^="articleDetail_headline"]')?.textContent
    if (headline) {
      presenceData.details = `${strings.readingArticle} ${document.querySelector<HTMLHeadingElement>('[class^="articleDetail_headline"]')?.textContent}`
      presenceData.state = document.querySelector<HTMLHeadingElement>('[class^="articleDetail_leadtext"]')?.textContent
    }
    else {
      presenceData.details = strings.readingAnArticle
    }

    if (showCover) {
      presenceData.largeImageKey = document.querySelector<HTMLImageElement>('[class^="ArticleThumbnail_articleThumbnail"] > div > picture > img')?.src
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

  presence.setActivity(presenceData)
})

interface InfoScript {
  '@id': string
  'episodeNumber': number
  'partOfSeason': {
    seasonNumber: number
  }
}
