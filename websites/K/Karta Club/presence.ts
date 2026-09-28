import { ActivityType } from 'premid'

const presence = new Presence({ clientId: '1554253475809075341' })
const DEBUG = true
const has = (sel: string) => !!document.querySelector(sel)
const nowSec = () => Math.floor(Date.now() / 1000)

// Art asset uploaded in the Discord Developer Portal (Rich Presence > Art Assets).
// It must be in the SAME application as clientId above.
const LOGO = 'https://avatars.githubusercontent.com/u/9919?s=200'

// ---------- ACCOUNT NAME ----------
// The menu header shows "ONLINE" with the account name under it (top right).
// The name isn't visible during a match, so it's cached in localStorage.
const USER_KEY = 'kartaPresenceUser'
const STATUS_WORDS = /^(online|offline|away|idle|busy)$/i
let username: string | null = null
let userCheckedAt = 0

function findUsername(): string | null {
  const labels = Array.from(
    document.querySelectorAll<HTMLElement>('span, div, small, p'),
  ).filter((el) => {
    if ((el.innerText ?? '').trim().toLowerCase() !== 'online')
      return false
    const top = el.getBoundingClientRect().top
    return top > -5 && top < 150 // header area only, not the "539 online" cards
  })

  for (const label of labels) {
    let box: HTMLElement | null = label.parentElement
    for (let i = 0; i < 3 && box; i++) {
      const lines = (box.innerText ?? '')
        .split('\n')
        .map(s => s.trim())
        .filter(s => s && !STATUS_WORDS.test(s))
      if (lines.length > 0 && lines[0] && lines[0].length <= 32)
        return lines[0]
      box = box.parentElement
    }
  }
  return null
}

function currentUser(): string | null {
  if (username === null) {
    try {
      username = localStorage.getItem(USER_KEY)
    }
    catch {}
  }
  // Re-check every 30s (or every tick until a name is found)
  if (!username || Date.now() - userCheckedAt > 30000) {
    userCheckedAt = Date.now()
    const found = findUsername()
    if (found && found !== username) {
      username = found
      try {
        localStorage.setItem(USER_KEY, found)
      }
      catch {}
    }
  }
  return username
}

// ---------- IN-GAME RULES ----------
const inGame = () =>
  has('.game-shell')
  || has('.table-room')
  || has('.cb-game')
  || has('.leave-match-action')

const gameName = () =>
  has('.rami-table-shell')
    ? 'Rami'
    : has('.cb-game') || has('.cb-table-shell')
      ? 'Chkobba'
      : 'a card game'

// ---------- MODE ----------
// Remember which menu row was clicked. Order matters (2v2 before "friends").
const CLICK_MODES: Array<[string, RegExp]> = [
  ['Custom 2v2', /2v2/i],
  ['Custom', /play with friends|private/i],
  ['Casual', /single player|against (a )?bots?/i],
  ['Ranked', /ranked|classé/i],
]
const MODE_KEY = 'kartaPresenceMode'

document.addEventListener(
  'click',
  (e) => {
    if (inGame())
      return
    let el = e.target as HTMLElement | null
    for (let i = 0; i < 5 && el; i++) {
      const t = el.innerText ?? ''
      if (t.length > 0 && t.length < 120) {
        const hit = CLICK_MODES.find(([, re]) => re.test(t))
        if (hit) {
          try {
            sessionStorage.setItem(MODE_KEY, hit[0])
          }
          catch {}
          return
        }
      }
      el = el.parentElement
    }
  },
  true,
)

const mode = (): string => {
  // Structural signals first (they can't go stale)
  if (has('.cb-side-player-zone'))
    return 'Custom 2v2' // 4-seat Chkobba table
  if (has('.pause-match-action') && !has('.ingame-chat'))
    return 'Casual' // single player: pausable, no chat

  try {
    const m = sessionStorage.getItem(MODE_KEY)
    if (m)
      return m
  }
  catch {}
  return has('.ingame-chat') ? 'Online' : 'Casual'
}

// ---------- QUEUE ----------
const QUEUE_KEY = 'kartaPresenceQueue'
const QUEUE_STALE_MS = 8000

interface Queue {
  mode: string
  game: string
  players?: number
  max?: number
  start: number
  ts: number
}

type State =
  | { view: 'menu' }
  | {
    view: 'queue'
    mode: string
    game: string
    players?: number
    max?: number
    start: number
  }
  | { view: 'game', game: string, mode: string }

function readSharedQueue(): Queue | null {
  try {
    const q = JSON.parse(
      localStorage.getItem(QUEUE_KEY) ?? 'null',
    ) as Queue | null
    return q && Date.now() - q.ts < QUEUE_STALE_MS ? q : null
  }
  catch {
    return null
  }
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()

// A) Main tab: the menu shows an "IN QUEUE" badge on the mode row while searching
let queueSince: number | null = null

function findQueueInMenu(): { mode: string, game: string } | null {
  const badge = Array.from(
    document.querySelectorAll<HTMLElement>('span, div, small, b, em, p'),
  ).find((el) => {
    const t = (el.innerText ?? '').trim()
    return t.length > 0 && t.length < 20 && /in queue/i.test(t)
  })
  if (!badge)
    return null

  // Walk up to the row that contains the mode name (e.g. "Ranked")
  let modeWord = ''
  let row: HTMLElement | null = badge.parentElement
  for (let i = 0; i < 5 && row; i++) {
    const t = row.innerText ?? ''
    if (t.length < 120) {
      const m = t.match(/ranked|casual|custom/i)
      if (m) {
        modeWord = m[0]
        break
      }
    }
    row = row.parentElement
  }

  // The selected game card ("SELECTED" button) tells us Rami vs Chkobba
  let game = 'a card game'
  const selected = Array.from(
    document.querySelectorAll<HTMLElement>('button, span, div'),
  ).find(el => (el.innerText ?? '').trim().toUpperCase() === 'SELECTED')
  let card: HTMLElement | null = selected?.parentElement ?? null
  for (let i = 0; i < 4 && card; i++) {
    const m = (card.innerText ?? '').match(/rami|chkobba/i)
    if (m) {
      game = cap(m[0])
      break
    }
    card = card.parentElement
  }

  return { mode: modeWord ? cap(modeWord) : 'Ranked', game }
}

// B) Popup window (if PreMiD runs there): reads the queue window's own page
function detectQueueHere(): Queue | null {
  const title = document.title
  const text = document.body?.innerText ?? ''
  if (!/finding a match/i.test(text) && !/queue/i.test(title))
    return null

  const gm = text.match(/(ranked|casual|custom)\s+(rami|chkobba)/i)
  const pl = text.match(/players\s*(\d+)\s*\/\s*(\d+)/i)
  const qt = text.match(/queue time\s*(\d+):(\d+)/i)

  const seconds = qt?.[1] && qt?.[2] ? Number(qt[1]) * 60 + Number(qt[2]) : 0
  const prev = readSharedQueue()

  return {
    mode: gm?.[1] ? cap(gm[1]) : 'Ranked',
    game: gm?.[2] ? cap(gm[2]) : 'a card game',
    players: pl?.[1] ? Number(pl[1]) : undefined,
    max: pl?.[2] ? Number(pl[2]) : undefined,
    start: prev?.start ?? nowSec() - seconds,
    ts: Date.now(),
  }
}

// ---------- MAIN LOOP ----------
let lastKey = ''
let since = nowSec()

presence.on('UpdateData', async () => {
  const playing = inGame()
  const here = playing ? null : detectQueueHere()
  const inMenuQueue = playing ? null : findQueueInMenu()
  const user = currentUser()

  if (here) {
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(here))
    }
    catch {}
  }
  if (playing) {
    try {
      localStorage.removeItem(QUEUE_KEY)
    }
    catch {}
  }

  // Own timer for the main-tab queue (queue time isn't shown there)
  if (inMenuQueue) {
    if (queueSince === null)
      queueSince = nowSec()
  }
  else {
    queueSince = null
  }

  let queue: Queue | null = null
  if (!playing) {
    if (here) {
      queue = here
    }
    else if (inMenuQueue && queueSince !== null) {
      queue = {
        mode: inMenuQueue.mode,
        game: inMenuQueue.game,
        start: queueSince,
        ts: Date.now(),
      }
    }
    else {
      queue = readSharedQueue()
    }
  }

  const state: State = playing
    ? { view: 'game', game: gameName(), mode: mode() }
    : queue
      ? {
          view: 'queue',
          mode: queue.mode,
          game: queue.game,
          players: queue.players,
          max: queue.max,
          start: queue.start,
        }
      : { view: 'menu' }

  if (DEBUG)
    console.log('[KartaPresence]', state, 'user:', user)

  // Reset the timer on view/game/mode changes
  const key
    = state.view === 'game'
      ? `game|${state.game}|${state.mode}`
      : state.view === 'queue'
        ? `queue|${state.game}|${state.mode}`
        : 'menu'
  if (key !== lastKey) {
    lastKey = key
    since = nowSec()
  }

  const withUser = (s: string) => (user ? `${s} · ${user}` : s)

  const data: PresenceData = {
    type: ActivityType.Playing,
    largeImageKey: LOGO,
    startTimestamp: state.view === 'queue' ? state.start : since,
  }

  if (state.view === 'menu') {
    data.details = 'In the main menu'
    data.state = withUser('Choosing a game')
  }
  else if (state.view === 'queue') {
    data.details = `Searching for a ${state.mode} game`
    data.state = withUser(
      state.players && state.max
        ? `${state.game} · ${state.players}/${state.max} players`
        : state.game,
    )
  }
  else {
    data.details = `Playing ${state.game}`
    data.state = withUser(`${state.mode} game`)
  }

  presence.setActivity(data)
})