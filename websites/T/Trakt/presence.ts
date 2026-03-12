const presence = new Presence({
  clientId: '968880591003082783',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/T/Trakt/assets/logo.png',
}
presence.on('UpdateData', async () => {
  let presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  const { pathname, href } = document.location
  const pages: Record<string, PresenceData> = {
    '/': { details: 'Browsing the home page' },
    '/dashboard': { details: 'Browsing dashboard' },
    '/shows/trending': { state: 'Trending shows' },
    '/shows/popular': { state: 'Popular shows' },
    '/shows/recommended': { state: 'Recommended shows' },
    '/shows/anticipated': { state: 'Anticipated shows' },
    '/shows/watched': { state: 'The most watched shows' },
    '/shows/collected': { state: 'The most collected shows' },
    '/movies/trending': { state: 'Trending movies' },
    '/movies/popular': { state: 'Popular movies' },
    '/movies/recommended': { state: 'Recommended movies' },
    '/movies/anticipated': { state: 'Anticipated movies' },
    '/movies/watched': { state: 'The most watched movies' },
    '/movies/collected': { state: 'The most collected movies' },
    '/movies/boxoffice': { state: 'Top 10 grossing movies' },
    '/calendars/my': { details: 'Browsing my calendar' },
    '/calendars/my/shows': {
      details: 'Browsing their calendar',
      state: 'Shows',
    },
    '/calendars/my/premieres': {
      details: 'Browsing their calendar',
      state: 'Premieres',
    },
    '/calendars/my/new-shows': {
      details: 'Browsing their calendar',
      state: 'New shows',
    },
    '/calendars/my/movies': {
      details: 'Browsing their calendar',
      state: 'Movies',
    },
    '/calendars/my/dvd': {
      details: 'Browsing their calendar',
      state: 'DVD & Blu-ray',
    },
    '/calendars/shows': {
      details: 'Browsing calendar',
      state: 'Shows',
    },
    '/calendars/premieres': {
      details: 'Browsing calendar',
      state: 'Premieres',
    },
    '/calendars/new-shows': {
      details: 'Browsing calendar',
      state: 'New shows',
    },
    '/calendars/movies': {
      details: 'Browsing calendar',
      state: 'Movies',
    },
    '/calendars/dvd': {
      details: 'Browsing calendar',
      state: 'DVD & Blu-ray',
    },
    '/discover': { details: 'Finding new shows/movies' },
    '/apps': { details: 'Browsing apps' },
    '/vip': { details: 'Browsing VIP features' },
    '/settings': { details: 'Browsing settings' },
    '/auth/signin': { details: 'Registering on Trakt' },
    '/auth/login': { details: 'Logging in to Trakt' },
    '/widgets': { details: 'Browsing widgets' },
  }
  const imagePath = document.querySelector('img.real')?.getAttribute('src')

  for (const [path, data] of Object.entries(pages)) {
    if (pathname.includes(path))
      presenceData = { ...presenceData, ...data } as PresenceData
  }

  if (pathname.includes('/users')) {
    const username = document.querySelector(
      '#avatar-wrapper > .emojis-supported > a',
    )?.textContent
    presenceData.buttons = [{ label: 'Check profile', url: href }]
    if (pathname.includes('/history'))
      presenceData.details = `Browsing ${username}'s history`
    else if (pathname.includes('/progress'))
      presenceData.details = `Browsing ${username}'s progress`
    else if (pathname.includes('/collection'))
      presenceData.details = `Browsing ${username}'s collection`
    else if (pathname.includes('/ratings'))
      presenceData.details = `Browsing ${username}'s ratings`
    else if (pathname.includes('/lists'))
      presenceData.details = `Browsing ${username}'s lists`
    else if (pathname.includes('/comments'))
      presenceData.details = `Browsing ${username}'s comments`
    else if (pathname.includes('/network'))
      presenceData.details = `Browsing ${username}'s friends`
    else presenceData.details = `Browsing ${username}'s profile`
  }
  else if (pathname.includes('/shows/')) {
    if (pathname.includes('/episodes/')) {
      presenceData.details = document
        .querySelector(
          '#summary-wrapper > div.container.summary > div > div > div.col-md-10.col-md-offset-2.col-sm-9.col-sm-offset-3.mobile-title > h2 > a:nth-child(1)',
        )
        ?.textContent
        ?.replace(':', '')
      presenceData.state = `${
        document.querySelector(
          '#summary-wrapper > div.container.summary > div > div > div.col-md-10.col-md-offset-2.col-sm-9.col-sm-offset-3.mobile-title > h1 > span.main-title-sxe',
        )?.textContent
      }: ${
        document.querySelector(
          '#summary-wrapper > div.container.summary > div > div > div.col-md-10.col-md-offset-2.col-sm-9.col-sm-offset-3.mobile-title > h1 > span.main-title',
        )?.textContent
      }`
      presenceData.largeImageKey = imagePath
      presenceData.smallImageKey = ActivityAssets.Logo
      presenceData.buttons = [{ label: 'Check episode', url: href }]
    }
    else if (pathname.includes('/seasons/')) {
      presenceData.details = 'Browsing season'
      presenceData.state = `${
        document.querySelector('#level-up-link')?.textContent
      }: ${
        document.querySelector(
          '#summary-wrapper > div.container.summary > div > div > div.col-md-10.col-md-offset-2.col-sm-9.col-sm-offset-3.mobile-title > h1',
        )?.firstChild?.textContent
      }`
      presenceData.largeImageKey = imagePath
      presenceData.smallImageKey = ActivityAssets.Logo
      presenceData.buttons = [{ label: 'Check season', url: href }]
    }
    else {
      try {
        presenceData.details = 'Browsing TV show'
        presenceData.state = document.querySelector(
          '#summary-wrapper > div.container.summary > div > div > div.col-md-10.col-md-offset-2.col-sm-9.col-sm-offset-3.mobile-title > h1',
        )?.firstChild?.textContent
        presenceData.largeImageKey = imagePath
        presenceData.smallImageKey = ActivityAssets.Logo
        presenceData.buttons = [{ label: 'Check TV show', url: href }]
      }
      catch {
        presenceData.details = 'Browsing'
      }
    }
  }
  else if (pathname.includes('/movies')) {
    try {
      presenceData.details = 'Browsing movie'
      presenceData.state = document.querySelector(
        '#summary-wrapper > div.container.summary > div > div > div.col-md-10.col-md-offset-2.col-sm-9.col-sm-offset-3.mobile-title > h1',
      )?.childNodes[0]?.textContent
      presenceData.largeImageKey = imagePath
      presenceData.smallImageKey = ActivityAssets.Logo
      presenceData.buttons = [{ label: 'Check movie', url: href }]
    }
    catch {
      presenceData.details = 'Browsing'
    }
  }
  else if (pathname.includes('/people')) {
    presenceData.details = 'Browsing actor'
    presenceData.state = document.querySelector(
      '#summary-wrapper > div.container.summary > div > div > div.col-md-10.col-md-offset-2.col-sm-9.col-sm-offset-3.mobile-title > h1',
    )?.textContent
    presenceData.largeImageKey = imagePath
    presenceData.smallImageKey = ActivityAssets.Logo
    presenceData.buttons = [{ label: 'Check actor', url: href }]
  }
  else if (pathname.includes('/search')) {
    presenceData.details = 'Searching for'
    presenceData.state = new URLSearchParams(window.location.search).get(
      'query',
    )
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
