import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1459829773613137921',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/0-9/4Anime/assets/logo.png',
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

async function getBanner(text: string, key: number) {
  if (key === 1) {
    const bannerImg = document.querySelector('.thumb')?.querySelector('img')?.getAttribute('src')
    if (bannerImg) {
      return bannerImg
    }
    else {
      return ActivityAssets.Logo
    }
  }
  else {
    const bannerImg = document.querySelector('.thumbook')?.querySelector('img')?.getAttribute('src') || ActivityAssets.Logo
    return bannerImg
  }
}

async function getAnimeData(text: string) {
  if (text === cacheEpisode.text && cacheEpisode.nameAnime !== '' && cacheEpisode.episodeAnime !== '') {
    return {
      episodeAnime: cacheEpisode.episodeAnime,
      nameAnime: cacheEpisode.nameAnime,
      seasonAnime: cacheEpisode.seasonAnime,
      bannerImg: cacheEpisode.bannerImg,
    }
  }

  const episodeAnime = document.querySelector('.server-left')?.querySelector('b')?.textContent || ''

  const nameAnime = document.querySelector('.infox')?.querySelector('.infolimit')?.querySelector('h2')?.textContent || ''
  const seasonAnime = 'Season 1'
  const bannerImg = await getBanner(text, 1)

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
  const { pathname } = document.location
  const fullPath = pathname
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    smallImageKey: Assets.Reading,
    type: ActivityType.Watching,
    details: 'Browsing 4Anime',
    state: 'Home Page',
  }
  const videoPage = document.querySelector('.video-content')

  if (videoPage) {
    const infoAnime = await getAnimeData(fullPath)
    if (infoAnime) {
      presenceData.name = infoAnime.nameAnime
      presenceData.details = infoAnime.nameAnime
      presenceData.state = 'Watching on 4Anime'
      presenceData.largeImageText = `${infoAnime.seasonAnime.toString()}, ${infoAnime.episodeAnime.toString()}`
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
  else if (pathname.includes('/anime/')) {
    presenceData.name = '4Anime'
    presenceData.details = document.querySelector('.infox')?.querySelector('.entry-title')?.textContent
    presenceData.state = 'Viewing Anime Details'
    presenceData.largeImageKey = await getBanner(pathname, 2)
  }
  presence.setActivity(presenceData)
})
