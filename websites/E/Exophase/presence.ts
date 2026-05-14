import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1492272145685020712',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

function getProfilePlatform(pathname: string): string | null {
  const knownPlatforms: Record<string, string> = {
    psn: 'PlayStation',
    xbox: 'Xbox',
    steam: 'Steam',
    retro: 'RetroAchievements',
    android: 'Google Play',
    epic: 'Epic Games',
    nintendo: 'Nintendo',
    blizzard: 'Blizzard',
    gog: 'GOG',
    origin: 'EA',
    ea: 'EA',
  }

  const segments = pathname.split('/').filter(Boolean) as string[]

  if (segments.length < 2)
    return null

  if (segments[0] === 'user')
    return null

  if (segments[1] === 'user') {
    const platformKey = segments[0] ?? ''
    return knownPlatforms[platformKey] ?? platformKey.replace(/[-_]/g, ' ').replace(/\b\w/g, char => char.toUpperCase())
  }

  return null
}

presence.on('UpdateData', async () => {
  const pathname = document.location.pathname
  const strings = await presence.getStrings({
    buttonViewProfile: 'general.buttonViewProfile',
    buttonViewGame: 'general.buttonViewGame',
  })

  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/E/Exophase/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  // Home
  if (pathname === '/' || pathname === '') {
    presenceData.details = 'Browsing Exophase'
    presenceData.state = 'Home'
  }
  // User
  else if (pathname.includes('/user/')) {
    const usernameFromUrl = pathname.split('/user/')[1]?.split('/')[0]
    const usernameFromPage = document.querySelector('.column-username h2')?.textContent?.trim()
    const username = usernameFromPage || usernameFromUrl
    const platform = getProfilePlatform(pathname)
    presenceData.details = platform ? `Viewing ${platform} Profile` : 'Viewing Profile'
    presenceData.state = username ? decodeURIComponent(username) : 'User Profile'
    presenceData.buttons = [{ label: strings.buttonViewProfile, url: document.location.href }]
  }
  // Game page
  else if (pathname.includes('/game/')) {
    const gameTitle = document.querySelector('h2.me-2 a')?.textContent?.trim()
    presenceData.details = 'Viewing Game'
    presenceData.state = gameTitle || 'Game Page'
    presenceData.buttons = [{ label: strings.buttonViewGame, url: document.location.href }]
  }
  // Specific achievement/trophy
  else if (pathname.includes('/achievement/') || pathname.includes('/trophy/')) {
    const achievementTitle = document.querySelector('.award-title a')?.textContent?.trim()
    const isTrophy = pathname.includes('/trophy/')
    presenceData.details = isTrophy ? 'Viewing Trophy' : 'Viewing Achievement'
    presenceData.state = achievementTitle || (isTrophy ? 'Trophy Details' : 'Achievement Details')
    presenceData.buttons = [{ label: isTrophy ? 'View Trophy' : 'View Achievement', url: document.location.href }]
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
