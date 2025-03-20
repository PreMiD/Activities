import { Assets } from 'premid'

const presence = new Presence({
  clientId: '702668334990098523',
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
  }
}

presence.on('UpdateData', async () => {
  const path = location.pathname.replace(/\/?$/, '/')
  const video = document.querySelector<HTMLVideoElement>('video')
  const search = document.querySelector<HTMLInputElement>('input')
  const [showSearchInfo, showBrowseInfo, showVideoInfo, format] = await Promise.all(
    [
      presence.getSetting<boolean>('search'),
      presence.getSetting<boolean>('browse'),
      presence.getSetting<boolean>('video'),
      presence.getSetting<string>('show-format'),
    ],
  )
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/T/TheSite/assets/logo.png',
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
      if (status === 'play') {
        const [startTimestamp, endTimestamp] = presence.getTimestamps(
          video.currentTime,
          video.duration,
        );
        [presenceData.startTimestamp, presenceData.endTimestamp] = [
          startTimestamp,
          endTimestamp,
        ]
      }
    }
  }

  /* Browsing Info */
  if (showBrowseInfo) {
    if (path.includes('/person')) {
      presenceData.details = 'Viewing Person'
      presenceData.state = getElement('.person-page-block h2')
    }
    if (path.includes('/account')) {
      presenceData.details = 'Viewing'
      presenceData.state = `Account (${getElement('.account-nav > .active')})`
    }
    if (path.includes('/request')) {
      presenceData.details = 'Viewing'
      presenceData.state = `Requests (${getElement('.nav-tabs > .active')})`
    }
    if (path.includes('/collections')) {
      const title = getElement('.page-videolist > h1')

      presenceData.details = 'Browsing'
      presenceData.state = 'Collections'
      if (title !== 'Loading...') {
        presenceData.details = 'Browsing Collection'
        presenceData.state = title
      }
    }

    const detailsObj = setObject(path)!
    presenceData.details = detailsObj.details
    presenceData.state = detailsObj.state
  }

  /* Video Info */
  if (showVideoInfo) {
    const wl = path.includes('/list')
    const wlMovie = wl && getElement('.media-body .genre')

    if (wlMovie || path.includes('/movies')) {
      const menu = document.querySelector<HTMLElement>('.mv-movie-info')
      const title: string = getElement('.mv-movie-title > span')

      if (menu) {
        if (menu.style.display === 'none') {
          await parseVideo()
          presenceData.details = 'Watching Movie'
          presenceData.state = title
        }
        else {
          presenceData.details = 'Viewing Movie Details'
          presenceData.state = title
        }
      }
    }
    /* Non Watch Later */
    if (path.includes('/shows')) {
      const menu = document.querySelector<HTMLElement>('.mv-movie-info')
      const regex = getElement('.mv-movie-title > span > span > strong').match(
        /S(?<season>\d{1,4})E(?<episode>\d{1,4})/,
      )
      const title: string = getElement('.mv-movie-title > span > a')
      if (title !== 'Loading...') {
        const { season } = regex?.groups ?? {}
        const { episode } = regex?.groups ?? {}
        const state = format
          .replace('%show%', title)
          .replace('%season%', season ?? '')
          .replace('%episode%', episode ?? '')

        if (menu) {
          if (menu.style.display === 'none') {
            await parseVideo()
            presenceData.details = 'Watching TV Show'
            presenceData.state = state
          }
          else {
            presenceData.details = 'Viewing TV Show Details'
            presenceData.state = state
          }
        }
      }
      else {
        presenceData.details = 'Viewing TV Show Details'
        presenceData.state = getElement('.mv-movie-title > span')
      }
    }
    /* Watch Later */
    if (wl && !wlMovie) {
      const menu = document.querySelector<HTMLElement>('.mv-movie-info')
      const regex = getElement(
        '.full-title > .content > .seq > em',
      ).match(/S(?<season>\d{1,4})E(?<episode>\d{1,4})/)
      const title: string = getElement('.full-title > .content > .title')
      if (title !== 'Loading...') {
        const { season } = regex?.groups ?? {}
        const { episode } = regex?.groups ?? {}
        const state = format
          .replace('%show%', title)
          .replace('%season%', season ?? '')
          .replace('%episode%', episode ?? '')

        if (menu) {
          if (menu.style.display === 'none') {
            await parseVideo()
            presenceData.details = 'Watching TV Show'
            presenceData.state = state
          }
          else {
            presenceData.details = 'Viewing TV Show Details'
            presenceData.state = state
          }
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
