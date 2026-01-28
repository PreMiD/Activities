import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1380971258384089180',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

let iframePlayback = false
let currTime = 0
let durTime = 0
let isPaused = true

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/A/AniHQ/assets/logo.png',
}

let cacheAnime: {
  text: string
  numberEpisode: string
  seasonAnime: string
  nameAnime: string
  bannerImg: string
  epDesc: string | undefined | null
} = {
  text: '',
  numberEpisode: 'Episode 1',
  seasonAnime: '',
  nameAnime: '',
  bannerImg: ActivityAssets.Logo,
  epDesc: '',
}

interface AnimeInfo {
  title: string
  episode: string
}

async function parseAnimeInfo(raw: string | null): Promise<AnimeInfo> {
  if (!raw) {
    return { title: '', episode: '' }
  }
  const cleaned = raw
    .replace(/^\/watch\//, '')
    .replace(/\/$/, '')

  const episodeMatch = cleaned.match(/episode[- ]?(\d+)/i)
  const episodeNumber = episodeMatch ? episodeMatch[1] : ''
  const episode = episodeNumber ? `Episode ${episodeNumber}` : ''

  const title = cleaned
    .replace(/episode[- ]?\d.*$/gi, '')
    .replace(/\b(?:english|hindi|telugu|tamil)\b/gi, '')
    .replace(/\b(?:subbed|dubbed)\b/gi, '')
    .replace(/\b\d{4}\b/g, '')
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, c => c.toUpperCase())

  return {
    title,
    episode,
  }
}

function getGenreFromPath(path: string): string {
  const genre = path.split('/')[2] || ''
  return genre.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

async function getAnimeData(text: string) {
  if (text === cacheAnime.text) {
    return {
      nameAnime: cacheAnime.nameAnime,
      numberEpisode: cacheAnime.numberEpisode,
      seasonAnime: cacheAnime.seasonAnime,
      bannerImg: cacheAnime.bannerImg,
      epDesc: cacheAnime.epDesc,
    }
  }
  const seasonAnime = 'Season 1'
  const animeInfo = await parseAnimeInfo(text)
  const nameAnime = animeInfo.title || ''
  const numberEpisode = animeInfo.episode || 'Episode 1'
  const epDesc = document.querySelector('.anime-synopsis')?.querySelector('p')?.textContent?.trim() || 'Viewing on AnimeHQ'
  const bannerImg = document.querySelector('.anime-featured.relative.isolate')?.querySelector('img')?.getAttribute('src') || ActivityAssets.Logo

  cacheAnime = {
    nameAnime,
    numberEpisode,
    epDesc,
    bannerImg,
    text,
    seasonAnime,
  }

  return {
    nameAnime,
    numberEpisode,
    epDesc,
    bannerImg,
    seasonAnime,
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
    details: 'Browsing AniHQ',
    state: 'Viewing Home Page',
    largeImageKey: ActivityAssets.Logo,
    smallImageKey: Assets.Reading,
    type: ActivityType.Watching,
    startTimestamp: browsingTimestamp,
  }

  if (pathname.includes('/watch/')) {
    const videoPage = document.querySelector('.episode-player-info')
    if (videoPage) {
      const animeData = await getAnimeData(pathname)
      if (animeData) {
        presenceData.name = animeData.nameAnime || 'AniHQ'
        presenceData.details = animeData.nameAnime || ''
        presenceData.state = animeData.epDesc || 'Viewing on AniHQ'
        presenceData.largeImageText = `${animeData.seasonAnime.toString()}, ${animeData.numberEpisode.toString()}`
        presenceData.largeImageKey = animeData.bannerImg

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
  }
  else if (pathname.startsWith('/search')) {
    presenceData.details = 'Searching...'
    presenceData.state = 'Finding Anime'
  }
  else if (pathname.startsWith('/genre/')) {
    const genreName = getGenreFromPath(pathname)
    presenceData.details = 'Browsing Genre'
    presenceData.state = genreName
  }
  else if (pathname.startsWith('/anime/')) {
    presenceData.details = 'Browsing Anime'
    presenceData.state = 'Viewing Anime Description'
  }
  presence.setActivity(presenceData)
})
