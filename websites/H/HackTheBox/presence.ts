interface DashboardSettings {
  showRank: boolean
  showGlobalRanking: boolean
  showFlags: boolean
}

const presences: Record<string, PresenceData> = {
  '/challenges/{}': {},
  '/sherlocks/{}': {},
  '/machines/{}': {},
  '/prolabs/{}': {},
  '/users/{}': { details: 'Looking at profile' },
  '/challenges': {},
  '/sherlocks': {},
  '/home': { details: 'Homepage' },
  '/machines': {},
  '/login': { details: 'Logging in' },
  '/register': { details: 'Creating new account' },
  '/prolabs': { details: 'Browsing Prolabs' },
  '/fortresses': { details: 'Browsing fortresses' },
  '/starting-point': { details: 'Starting Point', state: 'Browsing starting points' },
  '/seasonal': { details: 'Browsing the season' },
  '/rankings': { details: 'Looking at the rankings' },
  '/tracks': { details: 'Tracks', state: 'Browsing tracks' },
}

const presence = new Presence({
  clientId: '1453343201061638175',
})

function getDashboardStat(labelText: string): string | null {
  const label = Array.from(document.querySelectorAll('dt'))
    .find(el => el.textContent?.includes(labelText))
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
  let name = 'Unknown Machine'
  const parts = window.location.pathname.split('/machines/')

  if (parts.length > 1) {
    const rawName = parts[1]
    if (rawName) {
      name = decodeURIComponent(rawName)
    }
  }

  const statusEl = document.querySelector('.htb-status')
  const statusText = statusEl?.textContent?.trim() || 'Offline'
  const isOnline = statusText.toLowerCase().includes('online')
  const serverName = statusEl?.previousElementSibling?.textContent?.trim()

  if (isOnline && serverName) {
    return {
      details: `Playing Machine '${name}'`,
      state: `${serverName} - Online`,
    }
  }
  else {
    return {
      details: `Looking at '${name}' Machine`,
      state: 'Status: Offline',
    }
  }
}

function getChallengeDetails() {
  const parts = window.location.pathname.split('/challenges/')

  if (parts.length > 1) {
    const rawName = parts[1]

    if (rawName) {
      const name = decodeURIComponent(rawName)
      return `Solving Challenge: '${name}'`
    }
  }

  return 'Solving Challenge'
}

function getSherlockDetails() {
  const parts = window.location.pathname.split('/sherlocks/')

  if (parts.length > 1) {
    const rawName = parts[1]

    if (rawName) {
      const name = decodeURIComponent(rawName)
      return `Solving Sherlock: '${name}'`
    }
  }

  return 'Solving Sherlock'
}

function getChallengeState(): string {
  const href = window.location.href

  if (href.includes('tab=retired'))
    return 'Browsing retired challenges'
  if (href.includes('tab=unreleased'))
    return 'Browsing unreleased machines'
  if (href.includes('tab=favorites'))
    return 'Browsing favorite challenges'
  if (href.includes('tab=active'))
    return 'Browsing active challenges'

  return 'Browsing all challenges'
}
function getMachineState() {
  const href = window.location.href

  if (href.includes('tab=retired'))
    return 'Browsing retired machines'
  if (href.includes('tab=unreleased'))
    return 'Browsing unreleased machines'
  if (href.includes('tab=favorites'))
    return 'Browsing favorite machines'
  if (href.includes('tab=active'))
    return 'Browsing active machines'
  return 'Browsing all machines'
}
function getSherlockState(): string {
  const href = window.location.href

  if (href.includes('tab=retired'))
    return 'Browsing retired Sherlocks'
  if (href.includes('tab=unreleased'))
    return 'Browsing unreleased Sherlocks'
  if (href.includes('tab=favorites'))
    return 'Browsing favorite Sherlocks'
  if (href.includes('tab=active'))
    return 'Browsing active Sherlocks'

  return 'Browsing all Sherlocks'
}

function getProlabDetails() {
  const name = document.querySelector('[data-test-id="navigation-header--title"]')?.textContent?.trim()

  if (name) {
    return `Browsing/Solving '${name}' Prolab`
  }
}

presence.on('UpdateData', async () => {
  let presenceData: PresenceData = {}

  const settings: DashboardSettings = {
    showRank: await presence.getSetting<boolean>('showRank'),
    showGlobalRanking: await presence.getSetting<boolean>('showGlobalRanking'),
    showFlags: await presence.getSetting<boolean>('showFlags'),
  }

  for (const [path, data] of Object.entries(presences)) {
    presenceData = {
      ...presenceData,
      largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/H/HackTheBox/assets/logo.png',
    }

    const isMatch = window.location.pathname.includes(path)
      || new RegExp(path.replace(/\{\}/g, '.*'), 'g').test(window.location.pathname)

    if (isMatch) {
      presenceData = { ...presenceData, ...data }

      if (path === '/challenges') {
        presenceData.state = getChallengeState()
      }
      else if (path === '/sherlocks') {
        presenceData.state = getSherlockState()
      }
      else if (path === '/machines') {
        presenceData.state = getMachineState()
      }
      else if (path === '/home') {
        presenceData.state = getHomePageDetails(settings)
      }
      else if (path.includes('{}')) {
        if (path === '/machines/{}') {
          const machineData = getMachineDetails()
          presenceData = { ...presenceData, ...machineData }
        }
        if (path === '/prolabs/{}') {
          presenceData.details = getProlabDetails()
          delete presenceData.state
        }
        if (path === '/challenges/{}')
          presenceData.state = getChallengeDetails()
        if (path === '/sherlocks/{}')
          presenceData.state = getSherlockDetails()
        if (path === '/users/{}')
          presenceData.details = 'Looking at profile'
      }

      break
    }
  }

  presence.setActivity(presenceData)
})
