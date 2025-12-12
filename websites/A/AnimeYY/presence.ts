import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1443845787254784105',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://imgur.com/Hi7H5ee.png',
}

let iframePlayback = false
let currTime = 0
let durTime = 0
let isPaused = true

let cacheVideo: {
  text: string
  numberEpisode: string
  nameAnime: string
} = {
  text: '',
  numberEpisode: '1',
  nameAnime: '',
}

async function getAniMovie(text: string) {
  if (text === cacheVideo.text) {
    return {
      nameAnime: cacheVideo.nameAnime,
      numberEpisode: cacheVideo.numberEpisode,
    }
  }

  const nameAnime = document.querySelector('#title-detail-manga')?.textContent || 'Watching a Anime'
  const numberEpisodeElement = document.querySelector(`#chapter_${text}`)
  const numberEpisode = numberEpisodeElement?.textContent || 'Watching a Episode'

  cacheVideo = {
    text,
    nameAnime,
    numberEpisode,
  }

  return {
    nameAnime,
    numberEpisode,
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
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    smallImageKey: Assets.Reading,
    type: ActivityType.Watching,
  }

  const player = document.querySelector('#video-container')
    || document.querySelector('#video-container > div > div.plyr__video-wrapper')
    || document.querySelector('#anime_player > iframe')

  if (player) {
    const urlAnime = pathname
    const matchResult = urlAnime.match(/-(\d+)\/?$/)
    const AnimeURL = matchResult?.[1]
    if (AnimeURL) {
      const animeData = await getAniMovie(AnimeURL)
      if (animeData) {
        presenceData.name = animeData.nameAnime
        presenceData.details = animeData.nameAnime
        presenceData.state = `Episode ${animeData.numberEpisode}`
      }

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

  if (pathname.includes('/hot/')) {
    presenceData.details = 'Browsing AnimeYY'
    presenceData.state = 'Exploring trending animes'
  }
  else if (pathname.includes('/follow/') && !pathname.includes('/unread/')) {
    presenceData.details = 'Browsing AnimeYY'
    presenceData.state = 'Checking followed anime'
  }
  else if (pathname.includes('/follow/unread/')) {
    presenceData.details = 'Browsing AnimeYY'
    presenceData.state = 'Reviewing unread updates'
  }
  else if (pathname.includes('/history/')) {
    presenceData.details = 'Browsing AnimeYY'
    presenceData.state = 'Reviewing watch history'
  }
  else if (pathname.includes('/genres/')) {
    presenceData.details = 'Browsing AnimeYY'
    presenceData.state = 'Exploring anime by genre'
  }
  else if (pathname.includes('/profile/') || pathname.includes('/user/')) {
    presenceData.details = 'Browsing AnimeYY'
    presenceData.state = 'Viewing profile settings'
  }
  else if (/-\d+\/?$/.test(pathname) && !pathname.includes('/epi-')) {
    const nameAnime = document.querySelector('#title-detail-manga')?.textContent?.trim()
      || 'Viewing anime details'

    presenceData.details = nameAnime
    presenceData.state = 'Viewing description'
  }
  else if (pathname === '/' || pathname === '') {
    presenceData.details = 'Browsing AnimeYY'
    presenceData.state = 'Looking for something to watch'
  }
  presence.setActivity(presenceData)
})
