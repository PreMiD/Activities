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

let cacheSeason: {
  text: string
  title: string
  episodeDesc: string
  banner: string
} = {
  text: '',
  title: '',
  episodeDesc: '',
  banner: ActivityAssets.Logo,
}

let cacheEpisode: {
  text: string
  title: string
  episode: string
  banner: string
  season: string
} = {
  text: '',
  title: '',
  episode: '',
  banner: ActivityAssets.Logo,
  season: '',
}

async function getSeasonInfo(text: string) {
  if (text === cacheSeason.text && cacheSeason.title !== '') {
    return {
      nameSerie: cacheSeason.title,
      episodeDesc: cacheSeason.episodeDesc,
      bannerImg: cacheSeason.banner,
    }
  }
  const bannerImg = document.querySelector('meta[property=\'og:image\']')?.getAttribute('content') || ActivityAssets.Logo
  const nameSerie = document.querySelector('h1')?.textContent || ''
  const episodeDesc = document.querySelector('.desc')?.textContent || 'Viewing Serie'

  cacheSeason = {
    banner: bannerImg,
    title: nameSerie,
    episodeDesc,
    text,
  }

  return {
    nameSerie,
    episodeDesc,
    bannerImg,
  }
}

async function getEpisodeInfo(text: string) {
  if (text === cacheEpisode.text) {
    return {
      nameSerie: cacheEpisode.title,
      numberEpisode: cacheEpisode.episode,
      seasonSerie: cacheEpisode.season,
      bannerImg: cacheEpisode.banner,
    }
  }
  const bannerImg = document.querySelector('meta[property=\'og:image\']')?.getAttribute('content') || ActivityAssets.Logo
  const nameSerie = document.querySelector('.vjs-dock-title')?.textContent || ''
  const numberEpisode = document.querySelector('.vjs-dock-description')?.textContent || 'Episode 1'
  const seasonSerie = 'Season 1'

  cacheEpisode = {
    banner: bannerImg,
    title: nameSerie,
    episode: numberEpisode,
    season: seasonSerie,
    text,
  }

  return {
    nameSerie,
    numberEpisode,
    seasonSerie,
    bannerImg,
  }
}

presence.on('UpdateData', async () => {
  const { pathname } = document.location

  const currentLang = navigator.language.toLowerCase().startsWith('es') ? 'es' : 'en'
  if (!strings || oldLang !== currentLang) {
    strings = await getStrings()
    oldLang = currentLang
  }

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
  if (pathname.includes('/video/')) {
    const videoPage = document.querySelector('#play-container')

    if (videoPage) {
      const episodeInfo = await getEpisodeInfo(pathname)
      if (episodeInfo) {
        presenceData.name = episodeInfo.nameSerie
        presenceData.details = episodeInfo.nameSerie
        presenceData.state = 'Watching on Kocowa'
        presenceData.largeImageKey = episodeInfo.bannerImg
        presenceData.largeImageText = `${episodeInfo.seasonSerie.toString()}, ${episodeInfo.numberEpisode.toString()}`

        const videoEl = document.querySelector<HTMLVideoElement>('video.vjs-tech')
        if (videoEl && !Number.isNaN(videoEl.duration)) {
          const [startTs, endTs] = getTimestampsFromMedia(videoEl)
          if (!videoEl.paused) {
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
    const genereName = document.querySelector('.dropdown-item.active')?.textContent?.trim() || ''
    presenceData.details = `${strings.NAV_DRAMA_DETAILS} KDramas`
    presenceData.state = `${strings.NAV_DRAMA_STATE} ${genereName}`
    presenceData.smallImageText = `${strings.NAV_DRAMA_STATE} ${genereName}`
    presence.setActivity(presenceData)
    return
  }
  else if (pathname.includes('/catalog/121')) {
    const orderView = 'Variety'
    presenceData.details = strings.NAV_VARIETY_DETAILS
    presenceData.state = `${strings.NAV_VARIETY_STATE} ${orderView}`
    presenceData.smallImageText = `${strings.NAV_VARIETY_STATE} ${orderView}`
    presence.setActivity(presenceData)
    return
  }
  else if (pathname.includes('/catalog/122')) {
    const orderView = 'KPOP'
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
  else if (pathname.includes('/season/')) {
    const seasonInfo = await getSeasonInfo(pathname)
    if (seasonInfo) {
      presenceData.details = `${strings.NAV_SEASON_DETAILS} ${seasonInfo.nameSerie}`
      presenceData.state = seasonInfo.episodeDesc
      presenceData.smallImageText = `${strings.NAV_SEASON_DETAILS} ${seasonInfo.nameSerie}`
      presenceData.largeImageKey = seasonInfo.bannerImg
    }
    presence.setActivity(presenceData)
    return
  }
  presence.setActivity(presenceData)
})
