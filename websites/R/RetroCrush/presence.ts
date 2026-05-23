import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '1382022650720686181',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/R/RetroCrush/assets/0.gif',
}

async function videoActive() {
  return !!document.querySelector('#v-player_html5_api')
}

let seasonCache = {
  animeName: '',
  seasonId: '',
  bannerUrl: '',
}

function getSeasonIdFromUrl(url: string): string | null | undefined {
  const match = url.match(/\/details\/([^/?#]+)/)
  return match ? match[1] : null
}

async function getSeasonInformation(seasonId: string) {
  if (seasonCache.seasonId === seasonId && seasonCache.animeName !== '') {
    return seasonCache
  }
  const rawTitle: string | null = document.location.href
    .match(/\/details\/[^/]+\/([^?]+)/)?.[1] ?? null

  const seasonTitle: string | null = rawTitle ? rawTitle.split('-').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : ''
  const bannerUrl = document!.querySelector<HTMLElement>('#main-container > div > div:nth-child(1)')!.style!.backgroundImage!.match(/url\("(.+?)"\)/)![1] || ActivityAssets.Logo

  if (seasonTitle) {
    seasonCache = {
      animeName: seasonTitle,
      seasonId,
      bannerUrl,
    }
  }
  return seasonCache
}

let cacheEpisode = {
  epTitle: '',
  anTitle: '',
  episodeId: '',
  isPlaying: false,
}

function getVideoIdFromUrl(url: string): string | null | undefined {
  const match = url.match(/\/watch\/([^/]+)/)
  return match ? match[1] : null
}

async function getAnimeInformation(episodeId: string) {
  if (cacheEpisode.episodeId === episodeId && cacheEpisode.epTitle !== '' && cacheEpisode.anTitle !== '') {
    return cacheEpisode
  }

  const rawTitle: string | null = document.location.href
    .match(/\/watch\/[^/]+\/([^?]+)/)?.[1] ?? null

  const animeTitle: string | null = rawTitle ? rawTitle.split('-').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : ''

  const titleEpisode = document.querySelector('#assetTitleContainer')?.textContent || ''

  const buttonPlay = document.querySelector('#custom_control_bar_container > div > div.play-btn-slot > span.playResume')?.getAttribute('aria-label')
  const isPlaying = buttonPlay === 'Pause'

  if (titleEpisode && animeTitle) {
    cacheEpisode = {
      epTitle: titleEpisode,
      anTitle: animeTitle,
      episodeId,
      isPlaying,
    }
  }
  return cacheEpisode
}

let cacheLive = {
  urlName: '',
  programName: '',
  programDesc: '',
}

async function getLiveInformation(urlName: string) {
  const programName = document.querySelector('#livetv_channel_heading')?.textContent?.replace(/\s*\([^)]*\)\s*$/, '')?.trim() || ''
  const programDesc = document.querySelector('#livetv_channel_desc')?.textContent || ''

  if (!programName || !programDesc)
    return cacheLive

  if (urlName !== cacheLive.urlName || programName !== cacheLive.programName) {
    cacheLive = {
      urlName,
      programName,
      programDesc,
    }
  }
  return cacheLive
}

presence.on('UpdateData', async () => {
  const { pathname, href, search } = document.location

  const presenceData: PresenceData = {
    details: 'Browsing...',
    state: 'Home Page',
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    smallImageKey: Assets.Viewing,
    type: ActivityType.Watching,
  }

  if (pathname.includes('/livetv')) {
    const urlParams = new URLSearchParams(search)
    const nameChannel = urlParams.get('q') || 'RetroCrush'
    if (nameChannel) {
      const liveInfo = await getLiveInformation(nameChannel)
      if (liveInfo && liveInfo.programName) {
        presenceData.name = liveInfo.programName
        presenceData.details = `${nameChannel} TV`
        presenceData.state = liveInfo.programDesc
        presence.setActivity(presenceData)
        return
      }
    }
  }
  else if (pathname.includes('/movies')) {
    presenceData.details = 'Searching Movies!'
    presenceData.state = 'All Categories'
    presenceData.largeImageText = `Watching Movies`
    presenceData.smallImageKey = Assets.Search
  }
  else if (pathname.includes('/shows')) {
    presenceData.details = 'Watching Shows!'
    presenceData.state = 'All Categories'
    presenceData.largeImageText = `Watching Shows`
    presenceData.smallImageKey = Assets.Search
  }
  else if (pathname.includes('/genres')) {
    const urlParams = new URLSearchParams(search)
    const categoryName = urlParams.get('q')
    presenceData.details = 'Searching Shows!'
    presenceData.state = `Looking: ${categoryName?.toUpperCase()}`
    presenceData.largeImageText = `Watching Generes`
    presenceData.smallImageKey = Assets.Reading
  }
  else if (pathname.includes('/watchlist')) {
    presenceData.details = 'Browsing Watchlists!'
    presenceData.state = 'From My Profile'
    presenceData.largeImageText = `Browsing Watchlists`
    presenceData.smallImageKey = Assets.Reading
  }
  else if (pathname.includes('/find')) {
    const searchData = document.querySelector('#searchox_input > div > div.input_first_col > input')?.getAttribute('value') || ''
    presenceData.details = 'Browsing New Titles'
    presenceData.state = `Searching: ${searchData}`
    presenceData.largeImageText = `Searching`
    presenceData.smallImageKey = Assets.Search
  }
  else if (pathname.includes('/details/')) {
    const seasonId = getSeasonIdFromUrl(href)
    if (seasonId) {
      const seasonInfo = await getSeasonInformation(seasonId)
      if (seasonInfo && seasonInfo.animeName) {
        presenceData.details = seasonInfo.animeName
        presenceData.state = 'Viewing Description'
        presenceData.largeImageText = 'Watching Description'
        presenceData.largeImageKey = seasonInfo.bannerUrl
        presenceData.smallImageKey = Assets.Reading

        presence.setActivity(presenceData)
        return
      }
    }
  }
  const isVideoPage = await videoActive()
  if (isVideoPage) {
    const episodeId = getVideoIdFromUrl(href)
    if (episodeId) {
      const episodeInfo = await getAnimeInformation(episodeId)
      if (episodeInfo && episodeInfo.anTitle && episodeInfo.epTitle) {
        if (episodeInfo.anTitle !== episodeInfo.epTitle) {
          presenceData.name = episodeInfo.anTitle
        }
        if (episodeInfo.anTitle === seasonCache.animeName) {
          presenceData.largeImageKey = seasonCache.bannerUrl
        }
        presenceData.details = episodeInfo.epTitle
        presenceData.state = 'RetroCrush'
        presenceData.largeImageText = 'Watching Anime'

        const videoEl = document.querySelector<HTMLVideoElement>('#v-player_html5_api')
        if (videoEl && !Number.isNaN(videoEl.duration)) {
          const [startTs, endTs] = getTimestampsFromMedia(videoEl)
          if (!videoEl.paused && !videoEl.ended) {
            presenceData.smallImageKey = Assets.Play
            presenceData.smallImageText = 'Playing'
            presenceData.startTimestamp = startTs
            presenceData.endTimestamp = endTs
          }
          else {
            presenceData.smallImageKey = Assets.Pause
            presenceData.smallImageText = 'Paused'
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
