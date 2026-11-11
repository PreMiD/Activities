/**
 * Battlefield Heroes (bf2.us)
 *
 * This activity was written entirely by AI (Claude, by Anthropic). It was directed and tested by
 * connor.h, who is responsible for maintaining it.
 *
 * It only shows a status on the in-game page (/play/heroes/game.html). The game writes its own
 * progress to the browser console, so a small script is added to the page that reads those lines
 * and keeps a few fields: the stage, hero name, team, class, level, map and mode. Nothing else is
 * kept, and the lines that contain your session are never stored or sent anywhere.
 */

const presence = new Presence({
  clientId: '1565025851630682233',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)
let matchTimestamp = browsingTimestamp
let lastMatchKey = ''

enum ActivityAssets {
  Logo = 'https://i.imgur.com/rHlya0J.png',
}

// One picture per map. Winter, night and day versions of a map use the same picture.
const MAP_IMAGES: Record<string, string> = {
  dependant: 'https://raw.githubusercontent.com/C-onnorH/bfh-presence-images/main/maps/dependant.png',
  heat: 'https://raw.githubusercontent.com/C-onnorH/bfh-presence-images/main/maps/heat.png',
  lake: 'https://raw.githubusercontent.com/C-onnorH/bfh-presence-images/main/maps/lake.png',
  lunar: 'https://raw.githubusercontent.com/C-onnorH/bfh-presence-images/main/maps/lunar.png',
  mayhem: 'https://raw.githubusercontent.com/C-onnorH/bfh-presence-images/main/maps/mayhem.png',
  river: 'https://raw.githubusercontent.com/C-onnorH/bfh-presence-images/main/maps/river.png',
  royal_rumble: 'https://raw.githubusercontent.com/C-onnorH/bfh-presence-images/main/maps/royal_rumble.png',
  ruin: 'https://raw.githubusercontent.com/C-onnorH/bfh-presence-images/main/maps/ruin.png',
  seaside_skirmish: 'https://raw.githubusercontent.com/C-onnorH/bfh-presence-images/main/maps/seaside_skirmish.png',
  smack2: 'https://raw.githubusercontent.com/C-onnorH/bfh-presence-images/main/maps/smack2.png',
  village: 'https://raw.githubusercontent.com/C-onnorH/bfh-presence-images/main/maps/village.png',
  wicked_wake: 'https://raw.githubusercontent.com/C-onnorH/bfh-presence-images/main/maps/wicked_wake.png',
  woodlands: 'https://raw.githubusercontent.com/C-onnorH/bfh-presence-images/main/maps/woodlands.png',
}

// Map file name used by the game -> name shown to the player
// (names from https://bfh-info.cs-heroes.cz/en/game/map/)
const MAP_NAMES: Record<string, string> = {
  village: 'Victory Village',
  village_snow: 'Victory Village Winter',
  heat: 'Riverside Rush',
  heat_snow: 'Riverside Rush Winter',
  woodlands: 'Alpine Assault',
  woodlands_snow: 'Alpine Assault Winter',
  seaside_skirmish: 'Seaside Skirmish',
  seaside_skirmish_night: 'Seaside Skirmish Night',
  lake: 'Buccaneer Bay',
  lake_night: 'Buccaneer Bay Night',
  lake_snow: 'Buccaneer Bay Winter Night',
  mayhem: 'Sunset Showdown',
  royal_rumble: 'Perilous Port',
  royal_rumble_snow: 'Perilous Port Winter',
  royal_rumble_day: 'Perilous Port Day',
  ruin: 'Midnight Mayhem',
  ruin_snow: 'Midnight Mayhem Winter',
  ruin_day: 'Morning Mayhem',
  wicked_wake: 'Wicked Wake',
  river: 'Fortress Frenzy',
  smack2: 'Coastal Clash',
  smack2_night: 'Coastal Clash Night',
  smack2_snow: 'Coastal Clash Winter',
  lunar: 'Lunar Landing',
  dependant: 'Inland Invasion',
  dependant_day: 'Inland Invasion',
}

const MODE_NAMES: Record<string, string> = {
  tdm: 'Team Deathmatch',
  hoth: 'Hero of the Hill',
  ctf: 'Capture the Flag',
  te: 'Team Elimination',
}

interface GameState {
  stage: 'menu' | 'joining' | 'playing'
  name: string | null
  team: string | null
  kit: string | null
  level: number | null
  map: string | null
  mode: string | null
}

/**
 * Runs inside the page (it is written to the page as a script). It listens to the game's console
 * output and publishes a small summary as an attribute on the <html> element.
 */
function bf2Hook(): void {
  if (document.documentElement.getAttribute('data-bf2-hook'))
    return
  document.documentElement.setAttribute('data-bf2-hook', '1')

  const teams: Record<number, string> = { 1: 'National', 2: 'Royal' }
  const kits = ['Commando', 'Soldier', 'Gunner']
  const state: Record<string, unknown> = {
    stage: 'menu',
    name: null,
    team: null,
    kit: null,
    level: null,
    map: null,
    mode: null,
  }
  const publish = (): void => document.documentElement.setAttribute('data-bf2-presence', JSON.stringify(state))

  const read = (line: string): void => {
    const status = line.match(/bfh user status[^{]*(\{[^}]*\})/)
    if (status?.[1]) {
      try {
        const user = JSON.parse(status[1])
        state.name = user.N
        state.team = teams[user.T] || null
        state.kit = kits[user.K] || null
        state.level = user.L
        if (user.O === 5)
          state.stage = 'playing'
      }
      catch {}
    }
    if (/front end: MainMenu/.test(line)) {
      state.stage = 'menu'
      state.map = null
      state.mode = null
    }
    if (/bfh menu: (?:Search|PlayNow)/.test(line))
      state.stage = 'joining'
    const level = line.match(/GameClient load level (\S+) (\S+) max/)
    if (level?.[1] && level[2]) {
      state.map = level[1]
      state.mode = level[2]
      state.stage = 'joining'
    }
    if (/level load timing:/.test(line))
      state.stage = 'playing'
    publish()
  }

  // The game writes its progress to the console, so the console has to be wrapped to read it.
  for (const method of ['log', 'info', 'debug', 'warn'] as const) {
    // eslint-disable-next-line no-console
    const original = console[method].bind(console)
    // eslint-disable-next-line no-console
    console[method] = (...args: unknown[]): void => {
      try {
        if (typeof args[0] === 'string')
          read(args[0])
      }
      catch {}
      original(...args)
    }
  }
  publish()
}

function installHook(): void {
  if (document.documentElement.getAttribute('data-bf2-hook'))
    return
  const script = document.createElement('script')
  script.textContent = `(${bf2Hook.toString()})()`;
  (document.head || document.documentElement).appendChild(script)
  script.remove()
}

function readGame(): GameState | null {
  try {
    return JSON.parse(document.documentElement.getAttribute('data-bf2-presence') || 'null')
  }
  catch {
    return null
  }
}

function prettify(id: string): string {
  return id.replace(/^gpm_/, '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function mapName(id: string | null): string {
  return id ? (MAP_NAMES[id.toLowerCase()] ?? prettify(id)) : ''
}

function modeName(id: string | null): string {
  return id ? (MODE_NAMES[id.toLowerCase().replace(/^gpm_/, '')] ?? prettify(id)) : ''
}

function mapImage(id: string | null): string | undefined {
  if (!id)
    return undefined
  const key = id.toLowerCase()
  return MAP_IMAGES[key] ?? MAP_IMAGES[key.replace(/_(?:snow|night|day)$/, '')]
}

/** Fills in %variables%. Returns nothing when a value is not known yet, so that line is left out. */
function fillText(template: string, variables: Record<string, string>): string | undefined {
  let missing = false
  const text = template.replace(/%(\w+)%/g, (all, key: string) => {
    if (!(key in variables))
      return all
    if (!variables[key]) {
      missing = true
      return ''
    }
    return variables[key]
  }).trim()
  if (missing || text.length < 2)
    return undefined
  return text.slice(0, 128)
}

presence.on('UpdateData', async () => {
  // Only the game page has a status. Every other page on the site shows nothing.
  if (!/^\/play\/heroes\/game\.html/.test(document.location.pathname)) {
    presence.clearActivity()
    return
  }
  installHook()

  const game = readGame()
  const stage = game?.stage ?? 'menu'
  const [showStatus, details, state, useMapImage, showTimestamp, restartTimer] = await Promise.all([
    presence.getSetting<boolean>(`show${stage}`),
    presence.getSetting<string>(`${stage}Details`),
    presence.getSetting<string>(`${stage}State`),
    presence.getSetting<boolean>('mapImage'),
    presence.getSetting<boolean>('timestamp'),
    presence.getSetting<boolean>('matchTimer'),
  ])
  if (!showStatus) {
    presence.clearActivity()
    return
  }

  const matchKey = stage === 'playing' ? `${game?.map}|${game?.mode}` : ''
  if (matchKey !== lastMatchKey) {
    if (matchKey)
      matchTimestamp = Math.floor(Date.now() / 1000)
    lastMatchKey = matchKey
  }

  const inMenu = stage === 'menu'
  const variables = {
    team: game?.team ?? '',
    class: game?.kit ?? '',
    level: game?.level ? String(game.level) : '',
    map: inMenu ? '' : mapName(game?.map ?? null),
    mode: inMenu ? '' : modeName(game?.mode ?? null),
  }

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
  }

  const detailsText = fillText(details, variables)
  if (detailsText)
    presenceData.details = detailsText
  const stateText = fillText(state, variables)
  if (stateText)
    presenceData.state = stateText

  const picture = !inMenu && useMapImage ? mapImage(game?.map ?? null) : undefined
  if (picture) {
    presenceData.largeImageKey = picture
    presenceData.smallImageKey = ActivityAssets.Logo
    presenceData.smallImageText = 'Battlefield Heroes'
  }

  if (showTimestamp)
    presenceData.startTimestamp = stage === 'playing' && restartTimer ? matchTimestamp : browsingTimestamp

  presence.setActivity(presenceData)
})
