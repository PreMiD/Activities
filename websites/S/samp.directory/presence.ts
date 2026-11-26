import { ActivityType } from 'premid'

const presence = new Presence({
  clientId: '1556761773472743455',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.imgur.com/Ssr5kv7.png',
}

// What the game's page says of the player, in <meta name="samp-presence">: see
// https://github.com/Duplon/samp.directory/blob/main/frontend/src/app/tools/world/richpresence.js
interface GameState {
  v: number
  doing: 'loading' | 'queue' | 'menu' | 'foot' | 'driving' | 'riding'
  area: string | null
  vehicle: string | null
  job: string | null
  jobName: string | null
  activity: 'mission' | 'race' | 'deathmatch' | null
  wanted: number
  weapon?: { id: number, name: string } | null
  money?: number
}

// The site's pages are under a language's prefix ("/ru/servers") but for English's
const LANGUAGE = /^\/(?:ru|es|pt|tr|de|pl|fr)(?=\/|$)/

// When the player came into the game, for the time shown: kept while they stay in it
let playingSince = 0

function readGame(): GameState | null {
  const content = document.querySelector<HTMLMetaElement>('meta[name="samp-presence"]')?.content
  if (!content)
    return null
  try {
    return JSON.parse(content) as GameState
  }
  catch {
    return null
  }
}

// The page's own title, without the site's name after it
function pageTitle(): string {
  return document.title.replace(/\s*\|\s*samp\.directory\s*$/i, '').trim()
}

function gameDetails(game: GameState, showJob: boolean): string {
  if (game.activity === 'mission')
    return 'On a story mission'
  if (game.activity === 'race')
    return 'In a race'
  if (game.activity === 'deathmatch')
    return 'In a deathmatch'
  if (showJob && game.job) {
    return game.jobName
      ? `On the job: ${game.jobName}`
      : 'On a job'
  }
  switch (game.doing) {
    case 'loading':
      return 'Loading in'
    case 'queue':
      return 'Waiting for a free slot'
    case 'driving':
      return 'Driving around'
    case 'riding':
      return 'Riding along'
    case 'foot':
      return 'Exploring on foot'
    default:
      return 'In the menu'
  }
}

presence.on('UpdateData', async () => {
  const [showArea, showVehicle, showJob, showWanted, showWeapon, showMoney, showTime, privacy] = await Promise.all([
    presence.getSetting<boolean>('area'),
    presence.getSetting<boolean>('vehicle'),
    presence.getSetting<boolean>('job'),
    presence.getSetting<boolean>('wanted'),
    presence.getSetting<boolean>('weapon'),
    presence.getSetting<boolean>('money'),
    presence.getSetting<boolean>('timestamp'),
    presence.getSetting<boolean>('privacy'),
  ])
  const { hostname } = document.location
  const path = document.location.pathname.replace(LANGUAGE, '') || '/'
  const presenceData: PresenceData = {
    type: ActivityType.Playing,
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  if (hostname === 'play.samp.directory' && path.startsWith('/crosshair')) {
    playingSince = 0
    presenceData.details = 'Making a crosshair'
  }
  else if (hostname === 'play.samp.directory') {
    const game = readGame()
    if (!game) {
      presenceData.details = 'Loading in'
    }
    else if (privacy) {
      presenceData.details = 'Playing'
    }
    else {
      presenceData.details = gameDetails(game, showJob)
      const parts: string[] = []
      if (showArea && game.area)
        parts.push(game.area)
      if (showVehicle && game.vehicle && (game.doing === 'driving' || game.doing === 'riding'))
        parts.push(game.vehicle)
      if (showWanted && game.wanted > 0)
        parts.push('★'.repeat(Math.min(6, game.wanted)))
      if (showMoney && typeof game.money === 'number')
        parts.push(`$${game.money.toLocaleString('en-US')}`)
      if (parts.length)
        presenceData.state = parts.join(' · ')
      // (the weapon in hand: its picture small in the corner, its name over it)
      if (showWeapon && game.weapon) {
        presenceData.smallImageKey = `https://samp.directory/reference/weapons/${game.weapon.id}.png`
        presenceData.smallImageText = game.weapon.name
      }
    }
    if (!playingSince)
      playingSince = Math.floor(Date.now() / 1000)
    presenceData.startTimestamp = playingSince
  }
  else {
    playingSince = 0
    const title = pageTitle()
    if (path === '/') {
      presenceData.details = 'Browsing SA-MP servers'
    }
    else if (path.startsWith('/server/')) {
      presenceData.details = 'Viewing a server'
      // (the server's name as the page's heading has it, without the address the title adds)
      const name = document.querySelector('h1')?.textContent?.trim() || title
      if (!privacy && name)
        presenceData.state = name.slice(0, 128)
    }
    else if (path.startsWith('/tools/world')) {
      presenceData.details = 'Exploring the map'
    }
    else if (path.startsWith('/garage')) {
      presenceData.details = 'Building a car in the garage'
    }
    else if (path.startsWith('/tools') || path.startsWith('/code')) {
      presenceData.details = 'Using SA-MP tools'
      if (!privacy && title)
        presenceData.state = title
    }
    else if (path.startsWith('/profile') || path.startsWith('/admin')) {
      presenceData.details = 'Browsing samp.directory'
    }
    else {
      presenceData.details = 'Browsing samp.directory'
      if (!privacy && title)
        presenceData.state = title
    }
  }

  if (!showTime)
    delete presenceData.startTimestamp

  presence.setActivity(presenceData)
})
