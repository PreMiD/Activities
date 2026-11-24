const presence = new Presence({
  clientId: '1566160406680965120',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/O/Old%20Light/assets/logo.png',
}

const dialogStates: Record<string, string> = {
  'dispatch-dialog': 'Sending a fleet',
  'send-dialog': 'Sending resources',
  'scrap-dialog': 'At the scrapyard',
  'market-dialog': 'Trading on the market',
  'deal-dialog': 'Proposing a deal',
  'reports-modal': 'Reading reports',
  'messages-modal': 'Reading messages',
  'galaxy-map-modal': 'Viewing the galaxy map',
}

function titleCase(slug: string): string {
  return decodeURIComponent(slug)
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Survives reloads and in-game navigation within the tab; a different
// galaxy (or a new tab) starts a fresh timer.
function galaxySessionStart(galaxy: string): number {
  const key = 'PMD_oldlight_session'
  try {
    const saved = JSON.parse(sessionStorage.getItem(key) ?? 'null')
    if (saved?.galaxy === galaxy && typeof saved.start === 'number')
      return saved.start
    sessionStorage.setItem(key, JSON.stringify({ galaxy, start: browsingTimestamp }))
  }
  catch {}
  return browsingTimestamp
}

function text(selector: string): string | undefined {
  const value = document.querySelector(selector)?.textContent?.trim()
  return value && value !== '—' && value !== '…' ? value : undefined
}

presence.on('UpdateData', async () => {
  const [showEmpire, showSector, showProfile] = await Promise.all([
    presence.getSetting<boolean>('showEmpire'),
    presence.getSetting<boolean>('showSector'),
    presence.getSetting<boolean>('showProfile'),
  ])
  const { pathname } = document.location
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  const heading = text('h1')
  const game = pathname.match(/^\/game\/galaxy\/([^/]+)/)?.[1]
  const page = pathname.match(/^\/galaxy\/([^/]+)(?:\/([^/]+))?/)

  if (game) {
    const empire = showEmpire ? text('[data-field="player-name"]') : undefined
    const galaxy = `Galaxy ${titleCase(game)}`
    presenceData.details = empire ? `${empire} in ${galaxy}` : galaxy
    presenceData.startTimestamp = galaxySessionStart(game)

    // Set by the game only while the player's public profile page exists.
    const profileSlug = document.querySelector<HTMLElement>('[data-field="player-name"]')?.dataset.profileSlug
    if (showProfile && profileSlug) {
      presenceData.buttons = [
        {
          label: 'View empire',
          url: `https://oldlight.io/galaxy/${game}/player/${encodeURIComponent(profileSlug)}?utm_source=discord-presence&utm_medium=premid`,
        },
      ]
    }

    const openDialog = document.querySelector('dialog[open]')?.id
    const sector = showSector ? text('[data-field="nameplate-sector"]') : undefined
    if (openDialog && dialogStates[openDialog])
      presenceData.state = dialogStates[openDialog]
    else if (sector)
      presenceData.state = `In ${sector}`
  }
  else if (pathname.startsWith('/guide')) {
    presenceData.details = 'Reading the guide'
    if (heading)
      presenceData.state = heading
  }
  else if (pathname.startsWith('/blog')) {
    presenceData.details = 'Reading the blog'
    if (heading)
      presenceData.state = heading
  }
  else if (page) {
    const galaxy = `Galaxy ${titleCase(page[1] ?? '')}`
    const pageDetails: Record<string, string> = {
      map: 'Viewing the galaxy map',
      leaderboard: 'Viewing the leaderboard',
      stats: 'Viewing galaxy stats',
      news: 'Reading galaxy news',
      player: 'Viewing a player',
      sector: 'Viewing a sector',
      region: 'Viewing a region',
    }
    presenceData.details = (page[2] && pageDetails[page[2]]) ?? `Viewing ${galaxy}`
    const state = page[2] === 'player' || page[2] === 'sector' || page[2] === 'region'
      ? heading
      : page[2] ? galaxy : undefined
    if (state)
      presenceData.state = state
  }
  else if (pathname.startsWith('/premium')) {
    presenceData.details = 'Viewing Premium'
  }
  else if (pathname.startsWith('/faq')) {
    presenceData.details = 'Reading the FAQ'
  }
  else {
    presenceData.details = 'Browsing the website'
  }

  presence.setActivity(presenceData)
})
