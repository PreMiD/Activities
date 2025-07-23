import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1396840102650581123',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/A/AttackerTV/assets/logo.png',
}

let cacheMovie: {
  text: string
  nameMovie: string
  year: string
  bannerImg: string
} = {
  text: '',
  nameMovie: '',
  year: '',
  bannerImg: ActivityAssets.Logo,
}

async function getMovieInfo(text: string) {
  if (text === cacheMovie.text) {
    return {
      nameMovie: cacheMovie.nameMovie,
      year: cacheMovie.year,
      bannerImg: cacheMovie.bannerImg,
    }
  }

  const nameMovie = document.querySelector('.detail_page-infor .dp-i-c-right h2 a')?.textContent || ''
  const releaseText = document.querySelector('.detail_page-infor .dp-i-c-right .row-line')?.textContent || ''
  const year = releaseText?.match(/\b\d{4}\b/)?.[0] || ''
  const bannerElement = document.querySelector('.detail_page-infor .dp-i-c-poster img')?.getAttribute('src')
  const bannerImg = bannerElement || ActivityAssets.Logo

  cacheMovie = {
    text,
    nameMovie,
    year,
    bannerImg,
  }

  return {
    nameMovie,
    year,
    bannerImg,
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
  const { pathname } = document.location
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    smallImageKey: Assets.Play,
    type: ActivityType.Watching,
  }

  presenceData.details = 'Browsing'
  presenceData.state = 'Viewing HomePage'
  presenceData.largeImageText = 'Viewing HomePage'

  const player = document.querySelector('#watch-iframe')
  if (player) {
    const dataMovie = document.querySelector('.detail_page-infor .dp-i-c-right h2 a')?.textContent || ''
    const movieData = await getMovieInfo(dataMovie)
    if (movieData && movieData.nameMovie !== '') {
      if (pathname.includes('watch-movie')) {
        presenceData.name = movieData.nameMovie
        presenceData.details = `${movieData.nameMovie} - ${movieData.year}`
        presenceData.state = 'AttackerTV MOVIES'
        presenceData.largeImageKey = movieData.bannerImg
        presenceData.largeImageText = movieData.nameMovie
      }
      if (pathname.includes('watch-tv')) {
        const titleParts = movieData.nameMovie.split(' - Season ')
        const showName = titleParts[0] || movieData.nameMovie
        const seasonInfo = document.querySelector('.breadcrumb-item.active')?.textContent?.match(/Season\s+\d+\s+-\s+Episode\s+\d+/)?.[0] || ''

        presenceData.name = showName
        presenceData.details = seasonInfo
        presenceData.state = 'AttackerTV SERIES'
        presenceData.largeImageKey = movieData.bannerImg
        presenceData.largeImageText = movieData.nameMovie
      }

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
  if (pathname.includes('/genre')) {
    const rawGenre = pathname?.split('/')?.pop()
    if (rawGenre) {
      const genre = rawGenre.charAt(0).toUpperCase() + rawGenre.slice(1)
      presenceData.details = 'Browsing'
      presenceData.state = `Viewing The Genre : ${genre}`
      presenceData.largeImageText = `Viewing Genre: ${genre}`
    }
    else {
      presenceData.details = 'Browsing'
      presenceData.state = 'Viewing Genres'
      presenceData.largeImageText = 'Viewing Genres'
    }
  }
  else if (pathname.includes('/country')) {
    const rawCountry = pathname?.split('/')?.pop()
    if (rawCountry) {
      const country = rawCountry.toUpperCase()
      presenceData.details = 'Browsing'
      presenceData.state = `Viewing The Country : ${country}`
      presenceData.largeImageText = `Viewing Country: ${country}`
    }
    else {
      presenceData.details = 'Browsing'
      presenceData.state = 'Viewing Country'
      presenceData.largeImageText = 'Viewing Country'
    }
  }
  else if (pathname.includes('/movie')) {
    presenceData.details = 'Browsing'
    presenceData.state = 'Viewing Movies'
    presenceData.largeImageText = 'Viewing Movies'
  }
  else if (pathname.includes('/tv-show')) {
    presenceData.details = 'Browsing'
    presenceData.state = 'Viewing TV Shows'
    presenceData.largeImageText = 'Viewing TV Shows'
  }
  else if (pathname.includes('/top-imdb')) {
    presenceData.details = 'Browsing'
    presenceData.state = 'Viewing Top IMDB'
    presenceData.largeImageText = 'Viewing Top IMDB'
  }
  else if (pathname.includes('/android-movies-apk')) {
    presenceData.details = 'Browsing'
    presenceData.state = 'Viewing HomePage'
    presenceData.largeImageText = 'Viewing HomePage'
  }
  else if (pathname.includes('/search')) {
    const rawSearch = pathname?.split('/')?.pop()
    if (rawSearch) {
      const search = rawSearch.charAt(0).toUpperCase() + rawSearch.slice(1)
      presenceData.details = 'Browsing'
      presenceData.state = `Searching : ${search}`
      presenceData.largeImageText = `Searching: ${search}`
    }
    else {
      presenceData.details = 'Browsing'
      presenceData.state = 'Searching Movies/TV Shows'
      presenceData.largeImageText = 'Searching Movies/TV Shows'
    }
  }
  presence.setActivity(presenceData)
})
