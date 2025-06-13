import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '1380893917121220750',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/K/KOCOWA/assets/0.gif',
}

let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null
const browsingTimestamp = Math.floor(Date.now() / 1000)

async function getStrings() {
  return presence.getStrings({
    NAV_ROOT_DETAILS: 'general.browsing',
    NAV_ROOT_STATE: 'general.viewHome',

    NAV_HOME_DETAILS: 'general.browsing',
    NAV_HOME_STATE: 'general.viewHome',

    NAV_SEARCH_DETAILS: 'general.search',
    NAV_SEARCH_STATE: 'general.searchFor',

    NAV_NOW_DETAILS: 'general.browsing',
    NAV_NOW_STATE: 'general.search',

    NAV_DRAMA_DETAILS: 'general.search',
    NAV_DRAMA_STATE: 'general.viewCategory',

    NAV_VARIETY_DETAILS: 'general.browsing',
    NAV_VARIETY_STATE: 'general.searchFor',

    NAV_KPOP_DETAILS: 'general.browsing',
    NAV_KPOP_STATE: 'general.searchFor',

    NAV_LIVE_DETAILS: 'general.browsing',
    NAV_LIVE_STATE: 'general.waitingLive',

    NAV_SEASON_DETAILS: 'general.view',
    NAV_SEASON_STATE: 'general.viewAnime',

    NAV_PAUSED_STATE: 'general.paused',
    NAV_PLAYED_STATE: 'general.playing',
  })
}

let cacheSeason = {
  title: '',
  description: '',
  bannerUrl: '',
  seasonId: '',
}

function extractSeasonId(urlStr: string): string | null | undefined {
  try {
    const pathname = new URL(urlStr).pathname
    const parts = pathname.split('/')

    if (parts.length >= 4 && parts[2] === 'season') {
      return parts[3]
    }
    return null
  }
  catch {
    return null
  }
}

async function getSeasonInfo(seasonId: string) {
  const titleSeason = document.querySelector('h2')?.textContent?.trim() || document.querySelector('[class*="media-title"]')?.textContent?.trim() || document.querySelector('h1')?.textContent?.trim() || ''
  const descSeason = document.querySelector('[class*="media-summary"]')?.textContent?.trim() || document.querySelector('[class*="description"]')?.textContent?.trim() || ''
  const heroImageElement = document.querySelector<HTMLElement>('.hero-image-wrapper')
  const imageUrl = heroImageElement?.style.backgroundImage.match(/url\("(.*?)"\)/)?.[1] || ''

  const seasonInfo = {
    title: titleSeason,
    description: descSeason,
    bannerUrl: imageUrl,
    seasonId,
  }
  if (titleSeason !== '' && descSeason !== '') {
    cacheSeason = seasonInfo
  }
  return cacheSeason
}

let cacheEpisode = {
  title: '',
  episode: '',
  banner: '',
  isPlaying: false,
  episodeId: '',
}

function extractEpisodeId(urlStr: string): string | null | undefined {
  try {
    const pathname = new URL(urlStr).pathname
    const parts = pathname.split('/')

    if (parts.length >= 5 && parts[2] === 'media') {
      return parts[3]
    }
    return null
  }
  catch {
    return null
  }
};

async function getEpisodeInfo(episodeId: string) {
  if (cacheEpisode.episodeId === episodeId && cacheEpisode.title !== '' && cacheEpisode.episode !== '') {
    return cacheEpisode
  }
  const bannerUrl = document.querySelector(`span.card-img-holder[id='${episodeId}']`)?.querySelector('img')?.getAttribute('src')
  const titleEpisode = document.querySelector('.vjs-dock-title')?.textContent || ''
  const numberEpisode = document.querySelector('.vjs-dock-description')?.textContent || ''
  const tooltipText = document.querySelector('#kcp-player-328 > div.vjs-control-bar-wrapper > div > button.vjs-play-control.vjs-control.vjs-button.vjs-custom-play-control.vjs-playing > span.vjs-control-text')?.textContent?.trim()
  const isPlaying = tooltipText === 'Pause'
  if (titleEpisode && numberEpisode) {
    cacheEpisode = {
      title: titleEpisode,
      episode: numberEpisode,
      banner: bannerUrl || ActivityAssets.Logo,
      isPlaying,
      episodeId,
    }
  }
  return cacheEpisode
}

presence.on('UpdateData', async () => {
  const { pathname, href } = document.location

  const currentLang = navigator.language.toLowerCase().startsWith('es') ? 'es' : 'en'
  if (!strings || oldLang !== currentLang) {
    strings = await getStrings()
    oldLang = currentLang
  }
  const pathSegments = pathname.toLowerCase().split('/')
  const lastSegment = pathSegments[pathSegments.length - 1]

  const presenceData: PresenceData = {
    details: strings.NAV_ROOT_DETAILS,
    state: strings.NAV_ROOT_STATE,
    largeImageKey: ActivityAssets.Logo,
    largeImageText: 'KOCOWA',
    smallImageKey: Assets.Reading,
    smallImageText: strings.NAV_ROOT_STATE,
    type: ActivityType.Watching,
    startTimestamp: browsingTimestamp,
  }
  if (lastSegment === 'main') {
    const presenceData: PresenceData = {
      details: strings.NAV_HOME_DETAILS,
      state: strings.NAV_HOME_STATE,
      largeImageKey: ActivityAssets.Logo,
      largeImageText: 'KOCOWA',
      smallImageKey: Assets.Reading,
      smallImageText: strings.NAV_HOME_STATE,
      type: ActivityType.Watching,
      startTimestamp: browsingTimestamp,
    }
    presence.setActivity(presenceData)
    return
  }
  else if (pathname.includes('search')) {
    presenceData.details = strings.NAV_SEARCH_DETAILS
    presenceData.state = `${strings.NAV_SEARCH_STATE} KDramas!`
    presenceData.smallImageText = `${strings.NAV_SEARCH_STATE} KDramas!`
    presence.setActivity(presenceData)
    return
  }
  else if (pathname.includes('/catalog/119')) {
    presenceData.details = strings.NAV_NOW_DETAILS
    presenceData.state = strings.NAV_NOW_STATE
    presenceData.smallImageText = strings.NAV_NOW_STATE
    presence.setActivity(presenceData)
    return
  }
  else if (pathname.includes('/catalog/120')) {
    const genereName = document.querySelector('#app > div > div:nth-child(2) > div > div:nth-child(5) > div > div > div.list-utils-wrapper.genre-filter > ol > li:nth-child(2) > div > button > span')?.textContent?.trim() || ''
    presenceData.details = `${strings.NAV_DRAMA_DETAILS} KDramas`
    presenceData.state = `${strings.NAV_DRAMA_STATE} ${genereName}`
    presenceData.smallImageText = `${strings.NAV_DRAMA_STATE} ${genereName}`
    presence.setActivity(presenceData)
    return
  }
  else if (pathname.includes('/catalog/121')) {
    const orderView = document.querySelector('#app > div > div:nth-child(2) > div > div:nth-child(5) > div > div > div.list-utils-wrapper > div > div > button')?.textContent?.trim() || ''
    presenceData.details = strings.NAV_VARIETY_DETAILS
    presenceData.state = `${strings.NAV_VARIETY_STATE} ${orderView}`
    presenceData.smallImageText = `${strings.NAV_VARIETY_STATE} ${orderView}`
    presence.setActivity(presenceData)
    return
  }
  else if (pathname.includes('/catalog/122')) {
    const orderView = document.querySelector('#app > div > div:nth-child(2) > div > div:nth-child(5) > div > div > div.list-utils-wrapper > div > div > button')?.textContent?.trim() || ''
    presenceData.details = strings.NAV_KPOP_DETAILS
    presenceData.state = `${strings.NAV_KPOP_STATE} ${orderView}`
    presenceData.smallImageText = `${strings.NAV_KPOP_STATE} ${orderView}`
    presence.setActivity(presenceData)
    return
  }
  else if (pathname.includes('live')) {
    presenceData.details = strings.NAV_LIVE_DETAILS
    presenceData.state = strings.NAV_LIVE_STATE
    presenceData.smallImageText = strings.NAV_LIVE_STATE
    presence.setActivity(presenceData)
    return
  }
  else if (pathname.includes('season')) {
    const seasonId = extractSeasonId(href)
    if (seasonId) {
      const seasonInfo = await getSeasonInfo(seasonId)
      if (seasonInfo && seasonInfo.title) {
        presenceData.details = `${strings.NAV_SEASON_DETAILS} ${seasonInfo.title}`
        presenceData.state = seasonInfo.description
        presenceData.smallImageText = `${strings.NAV_SEASON_DETAILS} ${seasonInfo.title}`
        presenceData.largeImageKey = seasonInfo.bannerUrl || ActivityAssets.Logo
      }
      presence.setActivity(presenceData)
      return
    }
  }
  else if (document.querySelector('#play-container')) {
    const episodeId = extractEpisodeId(href)
    if (episodeId) {
      const episodeInfo = await getEpisodeInfo(episodeId)
      if (episodeInfo && episodeInfo.title) {
        presenceData.name = episodeInfo.title
        presenceData.details = episodeInfo.episode
        presenceData.state = 'KOCOWA'
        presenceData.largeImageKey = episodeInfo.banner || ActivityAssets.Logo
        const videoEl = document.querySelector<HTMLVideoElement>('video.vjs-tech')

        if (videoEl && !Number.isNaN(videoEl.duration)) {
          const [startTs, endTs] = getTimestampsFromMedia(videoEl)
          if (!videoEl.paused && !videoEl.ended) {
            presenceData.smallImageKey = Assets.Play
            presenceData.smallImageText = strings.NAV_PLAYED_STATE
            presenceData.startTimestamp = startTs
            presenceData.endTimestamp = endTs
          }
          else {
            presenceData.smallImageKey = Assets.Pause
            presenceData.smallImageText = strings.NAV_PAUSED_STATE
            delete presenceData.startTimestamp
            delete presenceData.endTimestamp
          }
        }
        presence.setActivity(presenceData)
        return
      }
    }
  }
  presence.setActivity(presenceData)
})
