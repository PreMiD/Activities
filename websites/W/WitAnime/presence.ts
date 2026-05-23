import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1403819105928220845',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/W/WitAnime/assets/logo.png',
}

let cacheEpisode: {
  text: string
  numberEpisode: number
  seasonAnime: string
  nameAnime: string
  bannerImg: string
  nameAnimeUrl: string
} = {
  text: '',
  numberEpisode: 1,
  seasonAnime: '',
  nameAnime: '',
  bannerImg: ActivityAssets.Logo,
  nameAnimeUrl: '',
}

async function getEpisodeInfo(text: string) {
  if (text === cacheEpisode.text) {
    return {
      nameAnime: cacheEpisode.nameAnime,
      numberEpisode: cacheEpisode.numberEpisode,
      seasonAnime: cacheEpisode.seasonAnime,
      bannerImg: cacheEpisode.bannerImg,
      nameAnimeUrl: cacheEpisode.nameAnimeUrl,
    }
  }

  const rawTitle = document.querySelector('a[href*=\'/anime/\']')?.textContent
  let nameAnime = rawTitle?.replace(/\s+\d+(?:st|nd|rd|th)\s+Season$/i, '').trim() || ''
  nameAnime = nameAnime.replace(/\s*\([^)]*\)/g, '').trim()
  const seasonMatch = rawTitle?.match(/(\d+)(?:st|nd|rd|th)\s+Season$/i)
  const seasonAnime = seasonMatch ? `Season ${seasonMatch[1]}` : 'Season 1'
  const rawUrl = document.location.href
  const urlMatch = rawUrl.match(/\/episode\/([^/]+?)(?:-الحلقة-|-%d8%|$)/)
  const nameAnimeUrl = urlMatch?.[1] || ''
  const episodeTitle = document.querySelector('body > div.main-section > div > h3')?.textContent
  const episodeMatch = episodeTitle?.match(/الحلقة\s+(\d+)/)
  const numberEpisode = episodeMatch?.[1] ? Number.parseInt(episodeMatch[1]) : 1
  const urlMatchBanner = document.location.href

  let bannerImg: string = ActivityAssets.Logo
  if (cacheEpisode.nameAnimeUrl === nameAnimeUrl && cacheEpisode.bannerImg !== ActivityAssets.Logo) {
    bannerImg = cacheEpisode.bannerImg
  }
  else {
    try {
      let slugForFetch = nameAnimeUrl
      if (!slugForFetch) {
        const decoded = decodeURIComponent(urlMatchBanner)
        const m = decoded.match(/\/episode\/([^/]+?)(?:-الحلقة-|-episode-)(\d+)\//i)
          || decoded.match(/\/anime\/([^/]+)\/?/i)
        slugForFetch = m?.[1] || ''

        if (!slugForFetch) {
          const href = document.querySelector<HTMLAnchorElement>('a[href*=\'/anime/\']')?.getAttribute('href') || ''
          const m2 = href.match(/\/anime\/([^/]+)\/?/i)
          slugForFetch = m2?.[1] || ''
        }
      }
      slugForFetch = slugForFetch
        ? (() => {
            slugForFetch = decodeURIComponent(slugForFetch)
            return slugForFetch
              .trim()
              .toLowerCase()
              .replace(/[^\p{L}\p{N}\-]+/gu, '-')
              .replace(/-+/g, '-')
              .replace(/^-|-$/g, '')
          })()
        : ''

      if (!slugForFetch) {
        console.warn('getEpisodeInfo: i cant get slug for the banner — skipping fetch.')
        bannerImg = ActivityAssets.Logo
      }
      else {
        const fetchUrl = `https://witanime.day/anime/${encodeURIComponent(slugForFetch)}/`
        const res = await fetch(fetchUrl, { credentials: 'include' })
        if (res.ok) {
          const html = await res.text()
          const doc = new DOMParser().parseFromString(html, 'text/html')
          const img = doc.querySelector('body > div.second-section > div > div > div.anime-info-right > div > img')?.getAttribute('src')
          bannerImg = img || ActivityAssets.Logo
        }
      }
    }
    catch (e) {
      console.error('Error fetching banner:', e)
      bannerImg = ActivityAssets.Logo
    }
  }

  cacheEpisode = {
    text,
    nameAnime,
    seasonAnime,
    numberEpisode,
    bannerImg,
    nameAnimeUrl,
  }

  return {
    nameAnime,
    seasonAnime,
    numberEpisode,
    bannerImg,
    nameAnimeUrl,
  }
}

let iframePlayback = false
let currTime = 0
let durTime = 0
let isPaused = true

presence.on('iFrameData', (data: any) => {
  if (data.iFrameVideoData) {
    iframePlayback = true
    currTime = data.iFrameVideoData.currTime
    durTime = data.iFrameVideoData.dur
    isPaused = data.iFrameVideoData.paused
  }
})

presence.on('UpdateData', async () => {
  const { pathname, href, search } = document.location
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    smallImageKey: Assets.Play,
    type: ActivityType.Watching,
  }
  presenceData.details = 'Browsing'
  presenceData.state = 'Viewing HomePage'
  presenceData.largeImageText = 'Viewing HomePage'
  presenceData.smallImageKey = Assets.Reading

  if (pathname.includes('/episode/')) {
    const player = document.querySelector('#iframe-container')
    if (player) {
      const episodeData = href
      if (episodeData) {
        const dataEpisode = await getEpisodeInfo(episodeData)
        if (dataEpisode && dataEpisode.nameAnime !== '') {
          const titleElement = document.querySelector('a[href*=\'/anime/\']')?.textContent
          const isMovie = titleElement?.includes('(') && titleElement?.includes(')')
          if (isMovie) {
            presenceData.details = `Watching Movie`
          }
          else {
            presenceData.details = `${dataEpisode.seasonAnime} - Episode ${dataEpisode.numberEpisode}`
          }
          presenceData.name = dataEpisode.nameAnime
          presenceData.state = 'WitAnime <3'
          presenceData.largeImageKey = dataEpisode.bannerImg

          if (iframePlayback) {
            presenceData.smallImageKey = isPaused ? Assets.Pause : Assets.Play
            presenceData.smallImageText = isPaused ? 'Paused' : 'Playing'
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
  }
  else if (pathname.includes('/anime/')) {
    presenceData.details = 'Viewing Description:'
    presenceData.state = document.querySelector('body > div.second-section > div > div > div.anime-info-left > div > h1')?.textContent?.trim() || ''
    presenceData.largeImageText = 'Viewing Description'
    presenceData.largeImageKey = document.querySelector('body > div.second-section > div > div > div.anime-info-right > div > img')?.getAttribute('src') || ActivityAssets.Logo
    presenceData.smallImageKey = Assets.Reading
  }
  else if (decodeURIComponent(pathname).includes('/مواعيد-الحلقات/')) {
    presenceData.details = 'Browsing'
    presenceData.state = 'Viewing Episode Schedule'
    presenceData.largeImageText = 'Viewing Programming'
    presenceData.smallImageKey = Assets.Search
  }
  else if (decodeURIComponent(pathname).includes('/قائمة-الانمي/')) {
    presenceData.details = 'Browsing'
    presenceData.state = 'Viewing Anime List'
    presenceData.largeImageText = 'Viewing Anime List'
    presenceData.smallImageKey = Assets.Search
  }
  else if (decodeURIComponent(pathname).includes('/anime-season/')) {
    presenceData.details = 'Browsing'
    presenceData.state = 'Viewing Season List'
    presenceData.largeImageText = 'Viewing Season List'
    presenceData.smallImageKey = Assets.Search
  }
  else if (pathname.includes('/anime-type/movie/')) {
    presenceData.details = 'Browsing'
    presenceData.state = 'Viewing Movie List'
    presenceData.largeImageText = 'Viewing Movie List'
    presenceData.smallImageKey = Assets.Search
  }
  else if (pathname.includes('/contact-us/')) {
    presenceData.details = 'Browsing'
    presenceData.state = 'Viewing Contact Us'
    presenceData.largeImageText = 'Viewing Contact Us'
    presenceData.smallImageKey = Assets.Reading
  }
  else if (pathname === '/' && search.includes('search_param=animes')) {
    const urlParams = new URLSearchParams(search)
    const searchQuery = urlParams.get('s')

    presenceData.details = 'Browsing'
    presenceData.state = searchQuery ? `Searching for: ${searchQuery}` : 'Searching animes'
    presenceData.largeImageText = 'Browsing'
    presenceData.smallImageKey = Assets.Search
  }
  presence.setActivity(presenceData)
})
