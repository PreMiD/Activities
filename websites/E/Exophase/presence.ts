import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1492272145685020712',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const pathname = document.location.pathname
  const href = document.location.href

  const presenceData: PresenceData = {
    largeImageKey: 'https://i.imgur.com/VoTEoEt.png',
    startTimestamp: browsingTimestamp,
  }

  // Home
  if (pathname === '/' || pathname === '') {
    presenceData.details = 'Browsing Exophase'
    presenceData.state = 'Home'
  }
  // User
  else if (pathname.includes('/user/')) {
    const username = pathname.split('/user/')[1]?.split('/')[0]
    presenceData.details = 'Viewing Profile'
    presenceData.state = username ? decodeURIComponent(username) : 'User Profile'
  }
  // Game page
  else if (pathname.includes('/game/')) {
    const gameTitle = document.querySelector('h2.me-2 a')?.textContent?.trim()
    presenceData.details = 'Viewing Game'
    presenceData.state = gameTitle || 'Game Page'
  }
  // Specific achievement/trophy
  else if (pathname.includes('/achievement/') || pathname.includes('/trophy/')) {
    const achievementTitle = document.querySelector('.award-title a')?.textContent?.trim()
    const isTrophy = pathname.includes('/trophy/')
    presenceData.details = isTrophy ? 'Viewing Trophy' : 'Viewing Achievement'
    presenceData.state = achievementTitle || (isTrophy ? 'Trophy Details' : 'Achievement Details')
  }
  // Leaderboards
  else if (pathname.includes('/leaderboard')) {
    presenceData.details = 'Browsing Leaderboards'
  }
  // Search
  else if (pathname.includes('/games/') && new URL(document.location.href).searchParams.has('q')) {
    const searchQuery = new URL(document.location.href).searchParams.get('q')
    presenceData.details = 'Searching Games'
    presenceData.state = searchQuery || 'Searching'
    presenceData.smallImageKey = Assets.Search
  }
  // Forums/Community
  else if (pathname.includes('/forums') || pathname.includes('/threads')) {
    const threadTitle = document.querySelector('h1, .thread-title')
    presenceData.details = 'In Forums'
    presenceData.state = threadTitle ? threadTitle.textContent || 'Reading Forum' : 'Browsing Forums'
  }
  // Account/Settings
  else if (pathname.includes('/account')) {
    presenceData.details = 'Managing Account'
    presenceData.state = 'Account Settings'
  }
  // Default fallback
  else {
    presenceData.details = 'Browsing Exophase'
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else
    presence.clearActivity()
})
