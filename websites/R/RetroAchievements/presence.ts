import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1496589220515680326',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const pathname = document.location.pathname
  const strings = await presence.getStrings({
    buttonViewProfile: 'general.buttonViewProfile',
    buttonViewGame: 'general.buttonViewGame',
  })

  const presenceData: PresenceData = {
    largeImageKey: 'https://i.imgur.com/dFegUxW.png',
    startTimestamp: browsingTimestamp,
  }

  // Home
  if (pathname === '/' || pathname === '') {
    presenceData.details = 'Homepage'
  }
  // Achievement page
  else if (pathname.includes('/achievement/')) {
    const achievementTitle = document.querySelector('p[class*="pb-[3px]"]')?.textContent?.trim() ||
                            document.querySelector('h1')?.textContent?.trim() ||
                            document.querySelector('.pagetitle')?.textContent?.trim() ||
                            document.title.split(' - ')[0]?.trim()
    presenceData.details = 'Viewing Achievement'
    presenceData.state = achievementTitle || 'Achievement Details'
    presenceData.buttons = [{ label: 'View Achievement', url: document.location.href }]
  }
  // Game page
  else if (pathname.includes('/game/')) {
    const gameTitle = document.querySelector('h1')?.textContent?.trim() ||
    document.querySelector('.pagetitle')?.textContent?.trim()
    presenceData.details = 'Viewing Game'
    presenceData.state = gameTitle || 'Game Page'
    presenceData.buttons = [{ label: strings.buttonViewGame, url: document.location.href }]
  }
  // User profile
  else if (pathname.includes('/user/')) {
    const usernameFromUrl = pathname.split('/user/')[1]?.split('/')[0]
    const usernameFromPage = document.querySelector('h1')?.textContent?.trim() ||
    document.querySelector('.username')?.textContent?.trim()
    const username = usernameFromPage || usernameFromUrl
    presenceData.details = 'Viewing User Profile'
    presenceData.state = username ? decodeURIComponent(username) : 'User Profile'
    presenceData.buttons = [{ label: strings.buttonViewProfile, url: document.location.href }]
  }
  // Games list / System games
  else if (pathname.startsWith('/games') || pathname.includes('/system/') && pathname.includes('/games')) {
    const searchQuery = new URL(document.location.href).searchParams.get('filter[title]')
    if (searchQuery) {
      presenceData.details = 'Searching for Games'
      presenceData.state = searchQuery
      presenceData.smallImageKey = Assets.Search
    } else {
      presenceData.details = 'Browsing Games'
    }
  }
  // Forums
  else if (pathname === '/forum.php' || pathname.startsWith('/viewforum.php')) {
    presenceData.details = 'In Forums'
  }
  // Settings
  else if (pathname.includes('/settings')) {
    presenceData.details = 'Managing Account'
  }
  // Downloads
  else if (pathname.includes('/downloads')) {
    presenceData.details = 'Viewing Emulators'
  }
  // Hubs
  else if (pathname === '/hubs' || pathname.match(/\/hub\/\d+/)) {
    if (pathname === '/hubs') {
      presenceData.details = 'Viewing Hubs'
    } else {
      const hubTitle = document.querySelector('div.flex.items-center.gap-2')?.textContent?.trim()
      presenceData.details = 'Viewing a Hub'
	  // TODO: - Add button to view hub
	  // 	   - state should be the hub title
    }
  }
  // Default fallback
  else {
    presenceData.details = 'Browsing RetroAchievements'
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else
    presence.clearActivity()
})
