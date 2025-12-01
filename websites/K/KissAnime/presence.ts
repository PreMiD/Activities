import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1444847266631254027',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://imgur.com/riHuhlT.png',
}

let iframePlayback = false
let currTime = 0
let durTime = 0
let isPaused = true

let cacheDescription: {
  text: string
  nameAnime: string
  urlImage: string
} = {
  text: '',
  nameAnime: '',
  urlImage: ActivityAssets.Logo,
}

let cacheAnime: {
  text: string
  numberEpisode: string
  nameAnime: string
  numberSeason: string
  imgUrl: string
} = {
  text: '',
  numberEpisode: '1',
  nameAnime: '',
  numberSeason: '1',
  imgUrl: ActivityAssets.Logo,
}

interface AnimeInfo {
  title: string
  season: number
}

async function getBanner(text: string) {
  const baseUrl = text.replace(/\/(?:Episode-\d|Movie|Special|Episode-Movie-HD-Fan-Sub|Episode-Movie-HD-Bad-Sub|-Preview).*$/, '/')
  if (baseUrl) {
    const response = await fetch(baseUrl)
    const html = await response.text()
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const bannerImg = doc.querySelector<HTMLImageElement>('#rightside img.cover_anime, #rightside .cover_anime img')?.getAttribute('src')
    return bannerImg || ActivityAssets.Logo
  }
}

export function parseAnime(url: string): AnimeInfo | null {
  const mainRegex = /\/Anime\/(?<raw>[^/]+)(?:\/|$)/i
  const mainMatch = url.match(mainRegex)

  if (!mainMatch || !mainMatch.groups) {
    return null
  }

  const raw = mainMatch.groups.raw
  if (!raw) {
    return null
  }

  const cleanedRaw = raw.replace(/-(?:ova|sub|dub)[^/]*$/i, '')
  const seasonRegex = /^(?<title>.+)-Season-(?<season>\d+)$/i
  const seasonMatch = cleanedRaw.match(seasonRegex)

  if (seasonMatch?.groups) {
    const title = seasonMatch.groups.title ?? ''
    const seasonStr = seasonMatch.groups.season ?? '1'

    return {
      title: title.replace(/-/g, ' '),
      season: Number(seasonStr),
    }
  }

  const finalRegex = /^(?<title>.+)-FINAL-SEASON$/i
  const finalMatch = cleanedRaw.match(finalRegex)

  if (finalMatch?.groups) {
    const title = finalMatch.groups.title ?? ''

    return {
      title: title.replace(/-/g, ' '),
      season: 1,
    }
  }

  return {
    title: cleanedRaw.replace(/-/g, ' '),
    season: 1,
  }
}

async function getDescriptionData(text: string) {
  if (text === cacheDescription.text) {
    return {
      nameAnime: cacheDescription.nameAnime,
      urlImage: cacheDescription.urlImage,
    }
  }

  const descData = parseAnime(text)
  const descImg = await getBanner(text)
  const nameAnime = descData?.title || 'Watching a Anime'
  const urlImage = descImg || ActivityAssets.Logo

  cacheDescription = {
    text,
    nameAnime,
    urlImage,
  }

  return {
    nameAnime,
    urlImage,
  }
}

async function getAnimeData(text: string) {
  if (text === cacheAnime.text) {
    return {
      nameAnime: cacheAnime.nameAnime,
      numberEpisode: cacheAnime.numberEpisode,
      numberSeason: cacheAnime.numberSeason,
      imgUrl: cacheAnime.imgUrl,
    }
  }

  const dataAnime = parseAnime(text)
  const imageAnime = await getBanner(text)

  const nameAnime = dataAnime?.title || 'Watching a Anime'
  const numberSeason = dataAnime?.season.toString() || 'Season 1'

  const episodelist = document.querySelector<HTMLOptionElement>('#selectEpisode option[selected]')

  const numberEpisode = episodelist?.value.match(/Episode-(\d+)/)?.[1] || '1'

  const imgUrl = imageAnime || ActivityAssets.Logo

  cacheAnime = {
    text,
    numberEpisode,
    nameAnime,
    numberSeason,
    imgUrl,
  }

  return {
    text,
    numberEpisode,
    nameAnime,
    numberSeason,
    imgUrl,
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

  const video = document.querySelector('#player_container')

  if (video) {
    const animeData = await getAnimeData(pathname)
    if (animeData) {
      presenceData.name = animeData.nameAnime
      presenceData.details = animeData.nameAnime
      presenceData.state = `Watching KissAnime`
      presenceData.largeImageKey = animeData.imgUrl
      presenceData.largeImageText = `Season ${animeData.numberSeason.toString()}, Episode ${animeData.numberEpisode.toString()}`
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

  if (pathname.includes('/kissanime-home')) {
    presenceData.details = 'Browsing Homepage'
    presenceData.state = 'Looking for an anime to watch'
  }
  else if (pathname.includes('/AnimeListOnline')) {
    presenceData.details = 'Browsing Anime List'
    presenceData.state = 'Looking for an anime to watch'
  }
  else if (pathname.includes('/Schedule')) {
    presenceData.details = 'Browsing Homepage'
    presenceData.state = 'Looking for schedule animes'
  }
  else if (pathname.includes('/ReportError')) {
    presenceData.details = 'Browsing Homepage'
    presenceData.state = 'Reporting an error on the site'
  }
  else if (pathname.includes('/Search')) {
    presenceData.details = 'Browsing Homepage'
    presenceData.state = 'Searching for an anime'
  }
  else if (/^\/Anime\/[^/]+\/?$/.test(pathname) && !pathname.includes('/Episode-')) {
    const dataDesc = await getDescriptionData(pathname)
    if (dataDesc) {
      presenceData.details = dataDesc.nameAnime || 'Browsing KissAnime'
      presenceData.state = 'Viewing description'
      presenceData.largeImageKey = dataDesc.urlImage || ActivityAssets.Logo
    }
  }

  presence.setActivity(presenceData)
})
