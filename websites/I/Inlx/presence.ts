import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1346148451645264018',
})
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
  browse: 'general.browsing',
  search: 'general.searching',
})
function getElement(query: string): string {
  const element = document.querySelector(query)
  return element?.textContent?.replace(/^\s+|\s+$/g, '') ?? 'Loading...'
}
function videoStatus(video: HTMLVideoElement): string {
  return video.paused ? Assets.Pause : Assets.Play
}

let oldUrl: string
let elapsed: number
let searchText = ''
let searchElapsed = 0

function setObject(path: string) {
  switch (path) {
    case '/': {
      return {
        details: 'Browsing',
      }
    }
    case '/login/': {
      return {
        details: 'Logging in',
      }
    }
    case '/password/forgot': {
      return {
        details: 'Forgot Password',
      }
    }
    case '/pages/kodi_plugin': {
      return {
        details: 'Viewing',
        state: 'Kodi Plugin',
      }
    }
    case '/pages/contact': {
      return {
        details: 'Viewing',
        state: 'Contact',
      }
    }
    case '/pages/faq': {
      return {
        details: 'Viewing',
        state: 'FAQ',
      }
    }
    case '/pages/terms': {
      return {
        details: 'Viewing',
        state: 'Terms of Service',
      }
    }
    case '/pages/privacy': {
      return {
        details: 'Viewing',
        state: 'Privacy Info',
      }
    }
    case '/pages/cookies': {
      return {
        details: 'Viewing',
        state: 'Cookie Info',
      }
    }
    case '/pages/social_terms': {
      return {
        details: 'Viewing',
        state: 'Social Terms',
      }
    }
    case '/account/gifts': {
      return {
        details: 'Redeeming',
        state: 'Gift-Code',
      }
    }
    case '/account/favorites/': {
      return {
        details: 'Viewing',
        state: 'Favorites',
      }
    }
    case '/account/playlist/wl/': {
      return {
        details: 'Viewing',
        state: 'Watch Later',
      }
    }
    case '/account/pin': {
      return {
        details: 'Logging In',
        state: 'Via PIN',
      }
    }
    case '/premium/primary': {
      return {
        details: 'Buying',
        state: 'Premium',
      }
    }
    case '/movies/': {
      return {
        details: 'Browsing',
        state: 'Movies',
      }
    }
    case '/shows/': {
      return {
        details: 'Browsing',
        state: 'TV Shows',
      }
    }
    case '/schedule/': {
      return {
        details: 'Viewing',
        state: 'Schedule',
      }
    }
    case '/sets/children': {
      return {
        details: 'Viewing Set',
        state: 'Children',
      }
    }
    case '/sets/comedies': {
      return {
        details: 'Viewing Set',
        state: 'Comedies',
      }
    }
    case '/sets/action': {
      return {
        details: 'Viewing Set',
        state: 'Action',
      }
    }
    case '/sets/dramas': {
      return {
        details: 'Viewing Set',
        state: 'Dramas',
      }
    }
    case '/sets/romance': {
      return {
        details: 'Viewing Set',
        state: 'Romance',
      }
    }
    case '/sets/sci-fi': {
      return {
        details: 'Viewing Set',
        state: 'Science Fiction',
      }
    }
    case '/sets/horror': {
      return {
        details: 'Viewing Set',
        state: 'Horror',
      }
    }
    default: {
      return {
        details: 'Browsing',
        state: 'Unknown Page',
      }
    }
  }
}

presence.on('UpdateData', async () => {
  const path = location.pathname.replace(/\/?$/, '/')
  const video = document.querySelector<HTMLVideoElement>('video')
  const search = document.querySelector<HTMLInputElement>('input')
  const [showSearchInfo, showBrowseInfo, showVideoInfo] = await Promise.all([
    presence.getSetting<boolean>('search'),
    presence.getSetting<boolean>('browse'),
    presence.getSetting<boolean>('video'),
  ])
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/I/Inlx/assets/logo.png',
    type: ActivityType.Watching,
    name: 'Inlx',
  }

  if (oldUrl !== path) {
    oldUrl = path
    elapsed = Math.floor(Date.now() / 1000)
  }

  if (elapsed)
    presenceData.startTimestamp = elapsed

  const parseVideo = async (): Promise<void> => {
    if (video) {
      const status = videoStatus(video)
      presenceData.smallImageKey = status

      // Format the current time and duration
      const formatTime = (seconds: number): string => {
        const hrs = Math.floor(seconds / 3600)
        const mins = Math.floor((seconds % 3600) / 60)
        const secs = Math.floor(seconds % 60)

        if (hrs > 0) {
          return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`
      }

      const progressHolder = document.querySelector<HTMLElement>('.vjs-progress-holder')
      if (progressHolder) {
        const progressText = progressHolder.getAttribute('aria-valuetext')
        if (progressText) {
          presenceData.state = `${presenceData.state} (${progressText})`
        }
        else {
          const currentTime = formatTime(video.currentTime)
          const duration = formatTime(video.duration)
          presenceData.state = `${presenceData.state} (${currentTime}/${duration})`
        }
      }

      if (status === Assets.Play) {
        const [startTimestamp, endTimestamp] = getTimestamps(
          video.currentTime,
          video.duration,
        )
        presenceData.startTimestamp = startTimestamp
        presenceData.endTimestamp = endTimestamp

        const posterElement = document.querySelector('.movie-poster')
          || document.querySelector('.vjs-poster')
        if (posterElement) {
          const posterUrl = posterElement.getAttribute('src')
          if (posterUrl) {
            const fullPosterUrl = posterUrl.startsWith('//') ? `https:${posterUrl}` : posterUrl
            presenceData.largeImageKey = fullPosterUrl
          }
        }
      }
    }
  }

  /* Browsing Info */
  if (showBrowseInfo) {
    if (path.includes('/person')) {
      presenceData.details = 'Viewing Person'
      presenceData.state = getElement('.person-page-block h2')
    }
    else if (path.includes('/account')) {
      presenceData.details = 'Viewing'
      presenceData.state = `Account (${getElement('.account-nav > .active')})`
    }
    else if (path.includes('/request')) {
      presenceData.details = 'Viewing'
      presenceData.state = `Requests (${getElement('.nav-tabs > .active')})`
    }
    else if (path.includes('/latest')) {
      presenceData.details = 'Browsing Latest'
      presenceData.state = 'Finding something new...'
    }
    else if (path.includes('/collections')) {
      const title = getElement('.page-videolist > h1')

      presenceData.details = 'Browsing'
      presenceData.state = 'Collections'
      if (title !== 'Loading...') {
        presenceData.details = 'Browsing Collection'
        presenceData.state = title
      }
    }
    else {
      const detailsObj = setObject(path)

      if (detailsObj) {
        presenceData.details = detailsObj.details
        presenceData.state = detailsObj.state
      }
      else {
        presenceData.details = 'Browsing'
        presenceData.state = 'Unknown Page'
      }
    }
  }

  /* Video Info */
  if (showVideoInfo) {
    const wl = path.includes('/list')
    const wlMovie = wl && getElement('.media-body .genre')

    // Movies handling
    if (path.includes('/movies')) {
      presenceData.name = 'Movies on Inlx'
      const menu = document.querySelector<HTMLElement>('.mv-movie-info')

      const titleElement = document.querySelector('.vjs-movie-title.full .full-title .content .title')
        || document.querySelector('.mv-movie-title > span')

      const posterElement = document.querySelector('.movie-poster')
      let posterUrl = null

      if (posterElement) {
        posterUrl = posterElement.getAttribute('src')

        if (posterUrl) {
          const fullPosterUrl = posterUrl.startsWith('//') ? `https:${posterUrl}` : posterUrl
          presenceData.largeImageKey = fullPosterUrl
        }
      }

      const title = titleElement?.textContent?.trim() ?? 'Browsing'
      const yearMatch = title.match(/\((\d{4})\)$/)
      let movieTitle = title
      let year = ''

      if (yearMatch) {
        movieTitle = title.replace(/\s*\(\d{4}\)$/, '').trim()
        year = yearMatch[1] ?? 'Unknown Year'
      }

      if (menu) {
        if (menu.style.display === 'none') {
          await parseVideo()
          presenceData.details = movieTitle
          presenceData.state = year
        }
        else {
          presenceData.details = `Viewing ${movieTitle}`
          presenceData.state = year
        }
      }
      else {
        await parseVideo()
        presenceData.details = movieTitle
        presenceData.state = year
      }

      if (title === 'Browsing') {
        presenceData.details = 'Browsing Movies'
        presenceData.state = 'Finding something worthy...'
      }
    }

    // TV Shows handling
    else if (path.includes('/shows')) {
      presenceData.name = 'TV on Inlx'
      const menu = document.querySelector<HTMLElement>('.mv-movie-info')

      const titleElement = document.querySelector('.vjs-movie-title .full-title .content .title')
        || document.querySelector('.mv-movie-title > span > a')
      const episodeElement = document.querySelector('.vjs-movie-title .full-title .content .seq em')
        || document.querySelector('.mv-movie-title > span > span > strong')
      const episodeTitleElement = document.querySelector('.vjs-movie-title .full-title .content .episode-title')

      const posterElement = document.querySelector('.movie-poster')
      let posterUrl = null

      if (posterElement) {
        posterUrl = posterElement.getAttribute('src')

        if (posterUrl) {
          const fullPosterUrl = posterUrl.startsWith('//') ? `https:${posterUrl}` : posterUrl
          presenceData.largeImageKey = fullPosterUrl
        }
      }

      // Extract title and episode info
      const title = titleElement?.textContent?.trim() ?? 'Browsing'
      const episodeInfo = episodeElement?.textContent?.trim() ?? ''
      const episodeTitle = episodeTitleElement?.textContent?.trim() ?? ''

      // Parse season and episode numbers
      const regex = episodeInfo.match(/S(?<season>\d{1,4})E(?<episode>\d{1,4})/)
      const { season, episode } = regex?.groups ?? {}

      if (menu) {
        if (menu.style.display === 'none') {
          await parseVideo()
          presenceData.details = title
          presenceData.state = `S${season || '?'}:E${episode || '?'}${episodeTitle ? ` - ${episodeTitle}` : ''}`
        }
        else {
          presenceData.details = `Viewing ${title}`
          presenceData.state = `S${season || '?'}:E${episode || '?'}${episodeTitle ? ` - ${episodeTitle}` : ''}`
        }
      }
      else {
        await parseVideo()
        presenceData.details = title
        presenceData.state = `S${season || '?'}:E${episode || '?'}${episodeTitle ? ` - ${episodeTitle}` : ''}`
      }

      if (title === 'Browsing') {
        presenceData.details = 'Browsing Shows'
        presenceData.state = 'Searching for my next binge...'
      }
    }

    /* Watch Later */
    if (wl && !wlMovie) {
      presenceData.name = 'TV on Inlx'
      const menu = document.querySelector<HTMLElement>('.mv-movie-info')
      const regex = getElement(
        '.full-title > .content > .seq > em',
      ).match(/S(?<season>\d{1,4})E(?<episode>\d{1,4})/)
      const title: string = getElement('.full-title > .content > .title')

      if (title !== 'Loading...') {
        const { season } = regex?.groups ?? {}
        const { episode } = regex?.groups ?? {}

        const episodeTitle = getElement('.full-title > .content > .episode-title') || ''

        if (menu) {
          if (menu.style.display === 'none') {
            await parseVideo()
            presenceData.details = title
            presenceData.state = `S${season || '?'}:E${episode || '?'}${episodeTitle ? ` - ${episodeTitle}` : ''}`
          }
          else {
            presenceData.details = `Viewing ${title}`
            presenceData.state = `S${season || '?'}:E${episode || '?'}${episodeTitle ? ` - ${episodeTitle}` : ''}`
          }
        }
        if (title === 'Browsing') {
          presenceData.details = 'Browsing Shows'
          presenceData.state = 'Searching for my next binge...'
        }
      }
      else {
        presenceData.details = 'Viewing TV Show Details'
        presenceData.state = getElement('.mv-movie-title > span')
      }
    }
  }

  /* Search Info */
  if (showSearchInfo) {
    if (search?.value !== searchText) {
      searchText = search?.value ?? ''
      searchElapsed = Date.now()
    }
    if (
      (Date.now() - searchElapsed <= 5000 || path.includes('/search'))
      && searchText.length > 0
    ) {
      presenceData.details = 'Searching'
      presenceData.state = searchText
      presenceData.startTimestamp = elapsed
      delete presenceData.endTimestamp
    }
  }

  if (presenceData.details && typeof presenceData.details === 'string') {
    if (presenceData.details.match('(Browsing|Viewing)')) {
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = (await strings).browse
    }
    if (presenceData.details.includes('Searching')) {
      presenceData.smallImageKey = Assets.Search
      presenceData.smallImageText = (await strings).search
    }

    presence.setActivity(presenceData)
  }
  else {
    presence.setActivity()
  }
})
