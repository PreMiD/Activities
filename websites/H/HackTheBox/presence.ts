interface DashboardSettings {
  showRank: boolean
  showGlobalRanking: boolean
  showFlags: boolean
}

const presence = new Presence({
  clientId: '1453343201061638175',
})

const ASSETS = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/H/HackTheBox/assets/logo.png',
  machines: 'https://cdn.rcd.gg/PreMiD/websites/H/HackTheBox/assets/0.png',
  challenges: 'https://cdn.rcd.gg/PreMiD/websites/H/HackTheBox/assets/1.png',
  sherlocks: 'https://cdn.rcd.gg/PreMiD/websites/H/HackTheBox/assets/2.png',
  tracks: 'https://cdn.rcd.gg/PreMiD/websites/H/HackTheBox/assets/3.png',
  prolabs: 'https://cdn.rcd.gg/PreMiD/websites/H/HackTheBox/assets/4.png',
  fortress: 'https://cdn.rcd.gg/PreMiD/websites/H/HackTheBox/assets/5.png',
  seasonal: 'https://cdn.rcd.gg/PreMiD/websites/H/HackTheBox/assets/6.png',
  homepage: 'https://cdn.rcd.gg/PreMiD/websites/H/HackTheBox/assets/7.png',
  rankings: 'https://cdn.rcd.gg/PreMiD/websites/H/HackTheBox/assets/8.png',
  starting: 'https://cdn.rcd.gg/PreMiD/websites/H/HackTheBox/assets/9.png',
}

function getUsername(): string {
  const userElement = document.querySelector('span.htb-text-primary.htb-heading-xl.htb-font-bold')
  const name = userElement?.textContent?.trim()
  return name ? `Username: ${name}` : 'Browsing Dashboard'
}

function getBrowsingState(context: string): string {
  const params = new URLSearchParams(window.location.search)
  const tab = params.get('tab')

  const states: Record<string, string> = {
    retired: 'retired',
    unreleased: 'unreleased',
    favorites: 'favorite',
    active: 'active',
  }

  const stateType = tab && states[tab] ? states[tab] : 'all'
  return `Browsing ${stateType} ${context}`
}

function getResourceName(index: number): string | null {
  const parts = window.location.pathname.split('/')
  return parts[index] ? decodeURIComponent(parts[index]) : null
}

function getDashboardStat(labelText: string): string | null {
  const label = Array.from(document.getElementsByTagName('dt')).find(el =>
    el.textContent?.includes(labelText),
  )
  return label?.nextElementSibling?.textContent?.trim() || null
}

function getHomePageDetails(settings: DashboardSettings) {
  const parts: string[] = []

  if (settings.showRank) {
    const rank = document.querySelector('h3.htb-heading-xl')?.textContent
    if (rank)
      parts.push(`Rank: '${rank}'`)
  }

  if (settings.showGlobalRanking) {
    const globalRank = getDashboardStat('Global Ranking')
    if (globalRank)
      parts.push(`Global: ${globalRank}`)
  }
  if (settings.showFlags) {
    const flags = getDashboardStat('Flags')
    if (flags)
      parts.push(`Flags: ${flags}`)
  }
  return parts.length > 0 ? parts.join(' | ') : 'Browsing Dashboard'
}

function getMachineDetails() {
  const name = getResourceName(2) || 'Unknown Machine'
  const statusEl = document.querySelector('.htb-status--green')
  const machineImg = document.querySelector('.avatar-icon-name-details img')
  const src = machineImg?.getAttribute('src')

  const avatar = (src && src.startsWith('http')) ? src : null

  return {
    details: statusEl ? `Playing Machine '${name}'` : `Looking at '${name}' Machine`,
    state: statusEl
      ? `${statusEl?.previousElementSibling?.textContent?.trim() || 'Server'} - Online`
      : 'Status: Offline',
    avatar,
  }
}

function getProlabDetails() {
  const name = document.querySelector('[data-test-id="navigation-header--title"]')?.textContent?.trim()

  if (name) {
    return `Browsing/Solving '${name}' Prolab`
  }
}

presence.on('UpdateData', async () => {
  const [showRank, showGlobalRanking, showFlags] = await Promise.all([
    presence.getSetting<boolean>('showRank'),
    presence.getSetting<boolean>('showGlobalRanking'),
    presence.getSetting<boolean>('showFlags'),
  ])

  const settings: DashboardSettings = {
    showRank,
    showGlobalRanking,
    showFlags,
  }

  const path = window.location.pathname
  const parts = path.split('/').filter(Boolean)
  const root = parts[0]
  const resource = parts[1]

  const presenceData: PresenceData = {
    largeImageKey: ASSETS.logo,
    largeImageText: 'HackTheBox',
  } as PresenceData

  switch (`/${root}`) {
    case '/home':
      presenceData.details = getUsername()
      presenceData.state = getHomePageDetails(settings)
      presenceData.smallImageKey = ASSETS.homepage
      presenceData.smallImageText = 'Homepage'
      break

    case '/login':
      presenceData.details = 'Logging in'
      break

    case '/register':
      presenceData.details = 'Creating new account'
      break

    case '/rankings':
      presenceData.details = 'Looking at the rankings'
      presenceData.smallImageKey = ASSETS.rankings
      presenceData.smallImageText = 'Rankings'
      break

    case '/seasonal':
      presenceData.details = 'Browsing the season'
      presenceData.smallImageKey = ASSETS.seasonal
      presenceData.smallImageText = 'Seasonal'
      break

    case '/fortresses':
      presenceData.details = 'Browsing fortresses'
      presenceData.smallImageKey = ASSETS.fortress
      presenceData.smallImageText = 'Fortresses'
      break

    case '/tracks':
      presenceData.state = 'Browsing tracks'
      presenceData.smallImageKey = ASSETS.tracks
      presenceData.smallImageText = 'Tracks'
      break

    case '/starting-point':
      presenceData.state = 'Browsing starting points'
      presenceData.smallImageKey = ASSETS.starting
      presenceData.smallImageText = 'Starting Point'
      break

    case '/machines':
      presenceData.smallImageKey = ASSETS.machines
      presenceData.smallImageText = 'Machines'

      if (resource) {
        const machineData = getMachineDetails()

        presenceData.details = machineData.details
        presenceData.state = machineData.state

        if (machineData.avatar) {
          presenceData.smallImageKey = machineData.avatar
          presenceData.smallImageText = decodeURIComponent(resource)
        }
      }
      else {
        presenceData.state = getBrowsingState('machines')
      }
      break

    case '/challenges':
      presenceData.smallImageKey = ASSETS.challenges
      presenceData.smallImageText = 'Challenges'
      if (resource) {
        const name = getResourceName(2)
        presenceData.state = name ? `Solving Challenge: '${name}'` : 'Solving Challenge'
      }
      else {
        presenceData.state = getBrowsingState('challenges')
      }
      break

    case '/sherlocks':
      presenceData.smallImageKey = ASSETS.sherlocks
      presenceData.smallImageText = 'Sherlocks'
      if (resource) {
        const name = getResourceName(2)
        presenceData.state = name ? `Solving Sherlock: '${name}'` : 'Solving Sherlock'
      }
      else {
        presenceData.state = getBrowsingState('Sherlocks')
      }
      break

    case '/prolabs':
      presenceData.smallImageKey = ASSETS.prolabs
      presenceData.smallImageText = 'Prolabs'
      if (resource) {
        presenceData.details = getProlabDetails()
      }
      else {
        presenceData.details = 'Browsing Prolabs'
      }
      break

    case '/users':
      if (resource) {
        presenceData.details = 'Looking at profile'
      }
      break

    default:

      break
  }

  presence.setActivity(presenceData)
})
