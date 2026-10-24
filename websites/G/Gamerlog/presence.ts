const presence = new Presence({
  clientId: '1562957522816606298',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.ibb.co/rYjNWTr/rsz-1gamerlog-logo-dcstibz3.png',
}

const TRAILING_SLASH_REGEX = /\/+$/

const libraryTabs: Record<string, string> = {
  played: 'Already Played Games',
  playing: 'Currently Playing',
  backlog: 'To-Play Games',
  wishlist: 'Wishlisted Games',
  dropped: 'Dropped Games',
}

const profileTabs: Record<string, string> = {
  'library': 'Their Library',
  'ratings': 'Their Ratings',
  'featured-lists': 'Their Lists',
  'activity': 'Their Activity',
  'reviews': 'Their Reviews',
  'followers': 'Their Followers',
  'following': 'Their Following',
}

const statsPages: Record<string, string> = {
  '/newdna': 'Gaming DNA',
  '/library/timeline': 'Timelined Games',
  '/library/rating-distribution': 'Rating distribution',
  '/library/developer-loyalty': 'Developer loyalty',
  '/compare': 'Comparing their Stats to others',
  '/stats/platforms': 'Platforms',
}

const REVIEW_BOX = 'textarea[placeholder="What did you think of this game?"]'

function getPageTitle(): string | undefined {
  return document.querySelector('h1')?.textContent?.trim() || undefined
}

function getGameInfo() {
  const title = getPageTitle()
  if (!title)
    return undefined

  const cover = Array.from(document.images).find(img => img.alt === title)?.src
  const developer = document.querySelector('a[href*="/developer/"]')?.textContent?.trim()

  return { title, cover, developer }
}

presence.on('UpdateData', async () => {
  const hideOwnName = await presence.getSetting<boolean>('hideOwnName')
  const path = document.location.pathname.replace(TRAILING_SLASH_REGEX, '') || '/'
  const segments = path.split('/').filter(Boolean)

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    details: 'Browsing Home',
  }

  const isGamePage = segments[0] === 'game' && !!segments[1]
  const game = isGamePage ? getGameInfo() : undefined

  if (document.querySelector(REVIEW_BOX)) {
    presenceData.details = 'Writing a review'
    if (game) {
      presenceData.state = game.title
      if (game.cover) {
        presenceData.largeImageKey = game.cover
        presenceData.smallImageKey = ActivityAssets.Logo
        presenceData.smallImageText = 'Gamerlog'
      }
    }
  }
  else if (isGamePage) {
    presenceData.details = game ? `Viewing ${game.title}` : 'Viewing a game'
    if (game?.developer)
      presenceData.state = `by ${game.developer}`
    if (game?.cover) {
      presenceData.largeImageKey = game.cover
      presenceData.smallImageKey = ActivityAssets.Logo
      presenceData.smallImageText = 'Gamerlog'
    }
  }
  else if (path === '/search') {
    presenceData.details = 'Searching Gamerlog'
  }
  else if (path === '/news') {
    presenceData.details = 'Reading gaming news'
  }
  else if (path === '/achievements') {
    presenceData.details = 'Viewing achievements'
  }
  else if (path === '/notifications') {
    presenceData.details = 'Checking notifications'
  }
  else if (path === '/lists') {
    presenceData.details = 'Viewing their lists'
  }
  else if (statsPages[path]) {
    presenceData.details = 'Viewing their stats'
    presenceData.state = statsPages[path]
  }
  else if (segments[0] === 'library' && segments[1] === 'developer' && segments[2]) {
    presenceData.details = 'Viewing a studio'
    presenceData.state = decodeURIComponent(segments[2])
  }
  else if (segments[0] === 'developer' && segments[1]) {
    presenceData.details = 'Viewing a studio'
    presenceData.state = decodeURIComponent(segments[1])
  }
  else if (segments[0] === 'library') {
    presenceData.details = 'Viewing their library'
    presenceData.state = libraryTabs[segments[1] ?? ''] ?? 'All games'
  }
  else if ((segments[0] === 'list' || segments[0] === 'tier-list') && segments[1]) {
    const title = getPageTitle()
    presenceData.details = segments[0] === 'tier-list' ? 'Viewing a tier list' : 'Viewing a list'
    if (title)
      presenceData.state = title
  }
  else if (segments[0] === 'profile') {
    if (!segments[1]) {
      const name = document.querySelector('h2.font-bold.text-foreground.text-lg')?.textContent?.trim()
      presenceData.details = !hideOwnName && name ? `Viewing ${name}'s profile` : 'Viewing their profile'
    }
    else {
      presenceData.details = 'Viewing a profile'
      const tab = profileTabs[segments[2] ?? '']
      if (tab)
        presenceData.state = tab
    }
  }
  presence.setActivity(presenceData)
})
