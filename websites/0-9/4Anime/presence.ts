import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1459829773613137921',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://imgur.com/cQ3grYp.png',
}

let iframePlayback = false
let currTime = 0
let durTime = 0
let isPaused = true

let cacheEpisode: {
  text: string
  episodeAnime: string
  nameAnime: string
  seasonAnime: string
  bannerImg: string | undefined | null
} = {
  text: '',
  episodeAnime: '1',
  nameAnime: '',
  bannerImg: ActivityAssets.Logo,
  seasonAnime: '',
}

let cacheDescription: {
  text: string
  nameAnime: string
  epDesc: string
  bannerImg: string | undefined | null
} = {
  text: '',
  nameAnime: '',
  bannerImg: ActivityAssets.Logo,
  epDesc: '',
}

async function getBanner(text: string) {
  if (text.includes('/watch/')) {
    const url = text
    const cleanPath = url.replace(/^\/watch/, '')
    const res = await fetch(`https://4anime.gg${cleanPath}`)
    const html = await res.text()
    const doc = new DOMParser().parseFromString(html, 'text/html')
    const bannerImg = doc.querySelector('.anime_poster')?.querySelector('img')?.getAttribute('src')
    if (bannerImg) {
      return bannerImg
    }
    else {
      return ActivityAssets.Logo
    }
  }
  else {
    const bannerImg = document.querySelector('.anime_poster')?.querySelector('img')?.getAttribute('src') || ActivityAssets.Logo
    return bannerImg
  }
}

async function getDescriptionData(text: string) {
  if (text === cacheDescription.text) {
    return {
      nameAnime: cacheDescription.nameAnime,
      bannerImg: cacheDescription.bannerImg,
      epDesc: cacheDescription.epDesc,
    }
  }

  const nameAnime = document.querySelector('.anime_name')?.textContent || '4Anime'
  const bannerImg = await getBanner(text)
  const epDesc = document.querySelector('.description')?.querySelector('.show')?.textContent || ''

  cacheDescription = {
    text,
    nameAnime,
    bannerImg,
    epDesc,
  }

  return {
    nameAnime,
    epDesc,
    bannerImg,
  }
}

async function getAnimeData(text: string) {
  if (text === cacheEpisode.text && cacheEpisode.nameAnime !== '') {
    return {
      episodeAnime: cacheEpisode.episodeAnime,
      nameAnime: cacheEpisode.nameAnime,
      seasonAnime: cacheEpisode.seasonAnime,
      bannerImg: cacheEpisode.bannerImg,
    }
  }

  const episodeAnime = `${document.querySelector('.item.ep-item.active')?.textContent}` || '1'

  const nameAnime = document.querySelector('.anime_breadcrumb li:nth-child(3) a')?.textContent || '4Anime'
  const seasonAnime = 'Season 1'
  const bannerImg = await getBanner(text)

  cacheEpisode = {
    text,
    episodeAnime,
    nameAnime,
    seasonAnime,
    bannerImg,
  }

  return {
    nameAnime,
    episodeAnime,
    seasonAnime,
    bannerImg,
  }
}

presence.on('iFrameData', (data: any) => {
  if (data.iFrameVideoData) {
    iframePlayback = true
    currTime = data.iFrameVideoData.currTime
    durTime = data.iFrameVideoData.dur
    isPaused = data.iFrameVideoData.paused
  }
})

presence.on('UpdateData', async () => {
  const { pathname, search } = document.location
  const fullPath = pathname + search
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    smallImageKey: Assets.Reading,
    type: ActivityType.Watching,
    details: 'Browsing on 4Anime',
    state: 'Home Page',
  }

  const descriptionPage = document.querySelector('.anime_detail_box')
  const videoPage = document.querySelector('.page-watch')

  if (pathname.includes('/home')) {
    presenceData.details = 'Browsing 4Anime'
    presenceData.state = 'Home Page'
  }
  else if (videoPage) {
    const infoAnime = await getAnimeData(fullPath)
    if (infoAnime) {
      presenceData.name = infoAnime.nameAnime || '4Anime'
      presenceData.details = infoAnime.nameAnime
      presenceData.state = 'Watching on 4Anime'
      presenceData.largeImageText = `${infoAnime.seasonAnime.toString()}, Episode ${infoAnime.episodeAnime.toString()}`
      presenceData.largeImageKey = infoAnime.bannerImg

      if (iframePlayback) {
        presenceData.smallImageKey = isPaused ? Assets.Pause : Assets.Play
        presenceData.smallImageText = isPaused ? 'Pausado' : 'Reproduciendo'
      }

      if (!isPaused) {
        const [startTs, endTs] = getTimestamps(
          Math.floor(currTime),
          Math.floor(durTime),
        )
        presenceData.startTimestamp = startTs
        presenceData.endTimestamp = endTs
      }
      else {
        delete presenceData.startTimestamp
        delete presenceData.endTimestamp
      }
    }
  }
  else if (pathname.includes('/browse')) {
    presenceData.details = 'Browsing'
    presenceData.state = 'Viewing Categories'
  }
  else if (pathname.includes('/genre')) {
    presenceData.details = 'Browsing'
    presenceData.state = 'Viewing Animes By Genre'
  }
  else if (pathname.includes('/genre')) {
    presenceData.details = 'Browsing'
    presenceData.state = 'Viewing Animes By Genre'
  }
  else if (pathname.includes('/search')) {
    presenceData.details = 'Browsing'
    presenceData.state = 'Searching Animes'
  }
  else if (descriptionPage) {
    const descData = await getDescriptionData(pathname)
    if (descData) {
      presenceData.name = '4Anime'
      presenceData.details = descData.nameAnime
      presenceData.state = 'Viewing Anime Details'
      presenceData.largeImageKey = descData.bannerImg
    }
  }
  presence.setActivity(presenceData)
})
