import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1459797444278620384',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

let iframePlayback = false
let currTime = 0
let durTime = 0
let isPaused = true

enum ActivityAssets {
  Logo = 'https://imgur.com/nkyTI9D.png',
  Gif = 'https://i.imgur.com/0X67ZB7.gif',
}

let cache: {
  text: string
  nombreAnime: string
  episodioAnime: string
  seasonAnime: string
  bannerImg: string | null | undefined
} = {
  text: '',
  nombreAnime: '',
  episodioAnime: '',
  seasonAnime: '',
  bannerImg: '',
}

async function getAnimeData(text: string) {
  if (text === cache.text && cache.nombreAnime !== '' && cache.bannerImg !== ActivityAssets.Logo) {
    return {
      nombreAnime: cache.nombreAnime,
      episodioAnime: cache.episodioAnime,
      seasonAnime: cache.seasonAnime,
      bannerImg: cache.bannerImg,
    }
  }

  const nombreAnime = document.querySelector('h1')?.textContent?.trim() || ''
  const episodioAnime = document.querySelector('p')?.textContent?.trim() || ''
  const seasonAnime = 'Season 1'
  const bannerImg = ActivityAssets.Logo

  cache = {
    text,
    nombreAnime,
    episodioAnime,
    seasonAnime,
    bannerImg,
  }

  return {
    nombreAnime,
    episodioAnime,
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

  const presenceData: PresenceData = {
    name: 'Voxani',
    details: 'Browsing Voxani',
    state: 'Browsing anime content',
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    smallImageKey: Assets.Reading,
    type: ActivityType.Watching,
  }

  if (pathname.includes('/watch/')) {
    const animeData = await getAnimeData(pathname)
    if (animeData) {
      presenceData.name = animeData.nombreAnime || 'Voxani'
      presenceData.details = animeData.nombreAnime || ''
      presenceData.state = 'Watching on Voxani'
      presenceData.largeImageKey = animeData.bannerImg
      presenceData.largeImageText = `${animeData.seasonAnime}, ${animeData.episodioAnime}`

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
  else if (pathname.includes('/anime')) {
    const animeName = document.querySelector('h1')?.textContent?.trim() || 'Voxani'
    presenceData.details = 'Browsing Anime'
    presenceData.state = `Looking: ${animeName}`
    presenceData.smallImageText = 'Browsing Anime'
  }
  else if (pathname.includes('/home')) {
    presenceData.details = 'Browsing Home'
    presenceData.state = 'Viewing the home page'
    presenceData.smallImageText = 'Browsing Home'
  }
  else if (pathname.includes('/discover')) {
    presenceData.details = 'Browsing Discover'
    presenceData.state = 'Exploring new anime'
    presenceData.smallImageText = 'Browsing Discover'
  }
  else if (pathname.includes('/browse')) {
    presenceData.details = 'Browsing Anime'
    presenceData.state = 'Looking through anime titles'
    presenceData.smallImageText = 'Browsing Anime'
  }
  else if (pathname.includes('/schedule')) {
    presenceData.details = 'Viewing Schedule'
    presenceData.state = 'Checking upcoming releases'
    presenceData.smallImageText = 'Viewing Schedule'
  }
  else if (pathname.includes('/my-list')) {
    presenceData.details = 'Viewing My List'
    presenceData.state = 'Managing personal anime list'
    presenceData.smallImageText = 'Viewing My List'
  }
  presence.setActivity(presenceData)
})
