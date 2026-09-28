import { ActivityType } from 'premid'

const presence = new Presence({
  clientId: '1554253475809075341',
})

const LOGO = 'https://i.imgur.com/7JShl3X.png'

function has(selector: string): boolean {
  return document.querySelector(selector) !== null
}

function nowSec(): number {
  return Math.floor(Date.now() / 1000)
}

function textOf(el: Element): string {
  return (el.textContent ?? '').trim()
}

function isVisible(el: Element): boolean {
  return el.getClientRects().length > 0
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}

// ---------- ACCOUNT NAME ----------
const USER_KEY = 'PMD_kartaclub_user'
const STATUS_WORDS = /^(?:online|offline|away|idle|busy)$/i
let username: string | null = null
let userCheckedAt = 0

function findUsername(): string | null {
  const labels = Array.from(
    document.querySelectorAll<HTMLElement>('span, div, small, p'),
  ).filter((el) => {
    if (el.childElementCount > 2 || !STATUS_WORDS.test(textOf(el)))
      return false
    const top = el.getBoundingClientRect().top
    return isVisible(el) && top > -5 && top < 150 // header only, not "539 online"
  })

  for (const label of labels) {
    const labelText = textOf(label)
    let box: HTMLElement | null = label.parentElement
    for (let i = 0; i < 3 && box; i++) {
      const name = textOf(box).replace(labelText, '').trim()
      if (name.length > 0 && name.length <= 32 && !STATUS_WORDS.test(name))
        return name
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
function inGame(): boolean {
  return (
    has('.game-shell')
    || has('.table-room')
    || has('.cb-game')
    || has('.leave-match-action')
  )
}

function gameName(): string {
  if (has('.rami-table-shell'))
    return 'Rami'
  if (has('.cb-game') || has('.cb-table-shell'))
    return 'Chkobba'
  return 'a card game'
}

// ---------- MODE ----------
const CLICK_MODES: Array<[string, RegExp]> = [
  ['Custom 2v2', /2v2/i],
  ['Custom', /play with friends|private/i],
  ['Casual', /single player|against (?:a )?bots?/i],
  ['Ranked', /ranked|classé/i],
]
const MODE_KEY = 'PMD_kartaclub_mode'

document.addEventListener(
  'click',
  (e) => {
    if (inGame())
      return
    let el = e.target as HTMLElement | null
    for (let i = 0; i < 5 && el; i++) {
      const t = textOf(el)
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

function mode(): string {
  if (has('.cb-side-player-zone'))
    return 'Custom 2v2' 
  if (has('.pause-match-action') && !has('.ingame-chat'))
    return 'Casual' 

  try {
    const m = sessionStorage.getItem(MODE_KEY)
    if (m)
      return m
  }
  catch {}
  return has('.ingame-chat') ? 'Online' : 'Casual'
}

// ---------- QUEUE ----------
const QUEUE_KEY = 'PMD_kartaclub_queue'
const QUEUE_STALE_MS = 8000

interface Queue {
  mode: string
  game: string
  players?: number
  max?: number
  start: number
  ts: number
}

interface MenuState {
  view: 'menu'
}

interface QueueState {
  view: 'queue'
  mode: string
  game: string
  players?: number
  max?: number
  start: number
}

interface GameState {
  view: 'game'
  game: string
  mode: string
}

type State = MenuState | QueueState | GameState

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

let queueSince: number | null = null

function findQueueInMenu(): { mode: string, game: string } | null {
  const badge = Array.from(
    document.querySelectorAll<HTMLElement>('span, div, small, b, em, p'),
  ).find((el) => {
    if (el.childElementCount > 2)
      return false
    const t = textOf(el)
    return t.length > 0 && t.length < 20 && /in queue/i.test(t) && isVisible(el)
  })
  if (!badge)
    return null

  let modeWord = ''
  let row: HTMLElement | null = badge.parentElement
  for (let i = 0; i < 5 && row; i++) {
    const t = textOf(row)
    if (t.length < 120) {
      const m = t.match(/ranked|casual|custom/i)
      if (m) {
        modeWord = m[0]
        break
      }
    }
    row = row.parentElement
  }

  let game = 'a card game'
  const selected = Array.from(
    document.querySelectorAll<HTMLElement>('button, span, div'),
  ).find(
    el =>
      el.childElementCount <= 2
      && textOf(el).toUpperCase() === 'SELECTED'
      && isVisible(el),
  )
  let card: HTMLElement | null = selected?.parentElement ?? null
  for (let i = 0; i < 4 && card; i++) {
    const m = textOf(card).match(/rami|chkobba/i)
    if (m) {
      game = cap(m[0])
      break
    }
    card = card.parentElement
  }

  return { mode: modeWord ? cap(modeWord) : 'Ranked', game }
}

function pageText(): string {
  const parts: string[] = []
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const tag = n.parentElement?.tagName
    if (tag !== 'SCRIPT' && tag !== 'STYLE' && tag !== 'NOSCRIPT')
      parts.push(n.textContent ?? '')
  }
  return parts.join(' ')
}

function detectQueueHere(): Queue | null {
  const title = document.title
  const text = document.body ? pageText() : ''
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
  const showName = await presence.getSetting<boolean>('showName')

  const playing = inGame()
  const here = playing ? null : detectQueueHere()
  const inMenuQueue = playing ? null : findQueueInMenu()
  const user = showName ? currentUser() : null

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

  let state: State = { view: 'menu' }
  if (playing) {
    state = { view: 'game', game: gameName(), mode: mode() }
  }
  else if (queue) {
    state = {
      view: 'queue',
      mode: queue.mode,
      game: queue.game,
      players: queue.players,
      max: queue.max,
      start: queue.start,
    }
  }

  let key = 'menu'
  if (state.view === 'game')
    key = `game|${state.game}|${state.mode}`
  else if (state.view === 'queue')
    key = `queue|${state.game}|${state.mode}`
  if (key !== lastKey) {
    lastKey = key
    since = nowSec()
  }

  const withUser = (s: string) => (user ? `${s} · ${user}` : s)

  const presenceData: PresenceData = {
    type: ActivityType.Playing,
    largeImageKey: LOGO,
    startTimestamp: state.view === 'queue' ? state.start : since,
  }

  if (state.view === 'menu') {
    presenceData.details = 'In the main menu'
    presenceData.state = withUser('Choosing a game')
  }
  else if (state.view === 'queue') {
    presenceData.details = `Searching for a ${state.mode} game`
    presenceData.state = withUser(
      state.players && state.max
        ? `${state.game} · ${state.players}/${state.max} players`
        : state.game,
    )
  }
  else {
    presenceData.details = `Playing ${state.game}`
    presenceData.state = withUser(`${state.mode} game`)
  }

  presence.setActivity(presenceData)
})
