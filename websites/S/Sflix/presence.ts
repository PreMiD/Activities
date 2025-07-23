import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1322565714128797798',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/S/Sflix/assets/logo.png',
}

let video: VideoInfo = {
  duration: 0,
  currTime: 0,
  paused: true,
}

presence.on(
  'iFrameData',
  (data) => {
    video = data as VideoInfo
  },
)

interface VideoInfo {
  duration: number
  currTime: number
  paused: boolean
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    type: ActivityType.Watching,
    startTimestamp: browsingTimestamp,
  }
  const [privacy, thumbnail, browsingStatus, hideWhenPaused, titleAsPresence] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('thumbnail'),
    presence.getSetting<boolean>('browsingStatus'),
    presence.getSetting<boolean>('hideWhenPaused'),
    presence.getSetting<boolean>('titleAsPresence'),
  ])
  const variables = await presence.getPageVariable('currPage')
  const { pathname } = document.location

  if (variables.currPage === 'watch') {
    const showTitle = document.querySelector('.heading-name')?.textContent
    const thumbnailURL = document
      .querySelector(`img[title*="${showTitle}"]`)
      ?.getAttribute('src')

    const currSeason = document.getElementById('current-season')?.textContent
    const season = currSeason?.match('Season ([0-9]*)')?.at(0)

    const currEpisode = document.querySelector('.on-air > div > .episode-number')?.textContent
    const ep = currEpisode?.match('Episode ([0-9]*)')?.at(0)

    if (titleAsPresence)
      presenceData.name = privacy ? 'Sflix' : `${showTitle}`
    else if (!privacy)
      presenceData.details = showTitle
    if (!privacy) {
      presenceData.state = document.querySelector('.on-air div h3')?.textContent ?? ''
    }
    presenceData.largeImageKey = thumbnail && thumbnailURL && !privacy ? thumbnailURL : ActivityAssets.Logo
    if (season && ep)
      presenceData.largeImageText = `${season}, ${ep}`

    if (!video.paused && !Number.isNaN(video.duration)) {
      if (!privacy) {
        [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(video.currTime, video.duration)
      }
      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = 'Playing'
    }
    else {
      if (hideWhenPaused)
        return presence.clearActivity()

      presenceData.smallImageKey = Assets.Pause
      presenceData.smallImageText = 'Paused'
      presenceData.startTimestamp = browsingTimestamp
      delete presenceData.endTimestamp
    }
  }
  else if (browsingStatus) {
    switch (variables.currPage) {
      case '': {
        if (pathname.startsWith('/search')) {
          presenceData.details = 'Searching'
          presenceData.smallImageKey = Assets.Search
          presenceData.smallImageText = 'Searching'
          if (!privacy) {
            presenceData.state = document.querySelector('h2[class*=\'cat-heading\']')?.textContent?.split('"')[1] || document.querySelector('h2[class*=\'cat-heading\']')?.textContent
          }
        }
        else if (pathname.startsWith('/android-movies-apk')) {
          presenceData.details = 'Checking the Android App'
          presenceData.smallImageKey = Assets.Reading
          presenceData.smallImageText = 'Browsing'
        }
        else if (pathname.startsWith('/filter')) {
          presenceData.details = 'Searching with filters'
          presenceData.smallImageKey = Assets.Reading
          presenceData.smallImageText = 'Browsing'
        }
        else if (pathname.startsWith('/terms')) {
          presenceData.details = 'Checking the Terms Of Service'
          presenceData.smallImageKey = Assets.Reading
          presenceData.smallImageText = 'Browsing'
        }
        else if (pathname.startsWith('/contact')) {
          presenceData.details = 'Contacting Sflix Support'
          presenceData.smallImageKey = Assets.Reading
          presenceData.smallImageText = 'Browsing'
        }
        else if (pathname.startsWith('/tv-show')) {
          presenceData.details = 'Checking Popular TV Shows'
          presenceData.smallImageKey = Assets.Reading
          presenceData.smallImageText = 'Browsing'
        }
        else if (pathname.startsWith('/movie')) {
          presenceData.details = 'Checking Popular Movies'
          presenceData.smallImageKey = Assets.Reading
          presenceData.smallImageText = 'Browsing'
        }
        else if (pathname.startsWith('/country')) {
          const title = document
            .querySelector('h2[class=\'cat-heading\']')
            ?.textContent
          presenceData.details = 'Checking Movies & TV Shows from Country'
          presenceData.state = title
          presenceData.smallImageKey = Assets.Reading
          presenceData.smallImageText = 'Browsing'
        }
        else if (pathname.startsWith('/top-imdb')) {
          presenceData.details = 'Checking the Top IMDB rated'

          const paramsString = window.location.search
          const searchParams = new URLSearchParams(paramsString)
          if (searchParams.has('type')) {
            const type = searchParams.get('type')
            if (type === 'tv') {
              presenceData.state = 'TV Shows'
            }
            else if (type === 'movie') {
              presenceData.state = 'Movies'
            }
          }
          else {
            presenceData.state = 'Movies & TV Shows'
          }
        }
        break
      }
      case 'home_search':
      case 'home': {
        presenceData.details = 'Browsing'
        presenceData.state = 'Home'
        presenceData.smallImageKey = Assets.Reading
        presenceData.smallImageText = 'Browsing'
        break
      }
      case 'detail': {
        const title = document.querySelector('.heading-name')?.textContent
        presenceData.details = 'Browsing'
        if (!privacy)
          presenceData.state = title
        if (thumbnail) {
          presenceData.largeImageKey = document.querySelector(`img[title="${title}"]`)?.getAttribute('src')
        }
        presenceData.smallImageKey = Assets.Reading
        presenceData.smallImageText = 'Browsing'
        break
      }
      case 'genre': {
        const title = document
          .querySelector('h2[class=\'cat-heading\']')
          ?.textContent
        presenceData.details = 'Checking Movies & TV Shows from Genre'
        presenceData.state = title?.replace(' Movies and TV Shows', '')
        presenceData.smallImageKey = Assets.Reading
        presenceData.smallImageText = 'Browsing'
      }
    }
  }
  else {
    return presence.clearActivity()
  }
  presence.setActivity(presenceData)
})
