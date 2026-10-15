const presence = new Presence({
  clientId: '1560173357952012288',
})

const LOGO = 'https://i.postimg.cc/3JGYtxg1/karaoketype.jpg'
const SITE_URL = 'https://karaoketype.com/'
const BUTTONS: [ButtonData] = [{ label: 'Play KaraokeType', url: SITE_URL }]
const pageLoadedAt = Math.floor(Date.now() / 1000)

/** Live snapshot of the 60s Speed Test (published by SpeedTest.snapshot() in index.html). */
interface SpeedTestBridge {
  phase?: string
  left?: number
  wpm?: number
  acc?: number
}

/**
 * Data published by the small bridge snippet pasted into index.html / online.html.
 * The snippet writes JSON into <html data-ktp="..."> once per second, which the
 * (isolated) content script can read from the shared DOM.
 */
interface Bridge {
  // index.html
  playing?: boolean
  ranked?: boolean
  title?: string
  artist?: string
  acc?: number
  maxCombo?: number
  dur?: number
  cur?: number
  me?: string
  st?: SpeedTestBridge | null
  // online.html
  online?: boolean
  view?: string
  room?: string
  players?: number
  max?: number
}

function readBridge(): Bridge {
  try {
    return JSON.parse(document.documentElement.dataset.ktp || '{}') as Bridge
  }
  catch {
    return {}
  }
}

/** Strip emoji (design rule: no emoji anywhere) and clamp to Discord limits. */
function clean(text: string | undefined, fallback = ''): string {
  const out = (text ?? '')
    .replace(/[\p{Extended_Pictographic}️‍]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100)
  return out.length >= 2 ? out : fallback
}

function songLine(title?: string, artist?: string): string {
  const t = clean(title, 'Unknown Song')
  const a = clean(artist)
  return a ? `${t} - ${a}` : t
}

function num(value: number | undefined, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

// Keep the countdown stable: only move the end time when it drifts > 3s.
let cachedEnd = 0
let cachedKey = ''
function stableEnd(key: string, remainingSec: number): number {
  const end = Math.floor(Date.now() / 1000 + remainingSec)
  if (key !== cachedKey || Math.abs(end - cachedEnd) > 3) {
    cachedKey = key
    cachedEnd = end
  }
  return cachedEnd
}

function isRankingsPage(): boolean {
  return document.location.pathname.replace(/\/+$/, '') === '/rankings'
}

function profileViewModalName(): string | null {
  const modal = document.getElementById('profile-view-modal')
  if (!modal || !modal.classList.contains('show'))
    return null
  const name = modal.querySelector('#pv-body .pv-name-row span')?.textContent
  return clean(name) || null
}

/** Username from /u/{username}, or null when the path is not a profile page. */
function profileNameFromPath(): string | null {
  const parts = document.location.pathname.split('/').filter(Boolean)
  if (parts.length !== 2 || parts[0] !== 'u')
    return null
  const raw = parts[1] ?? ''
  try {
    return clean(decodeURIComponent(raw)) || null
  }
  catch {
    return clean(raw) || null
  }
}

/** True on /u/{username} or while the profile modal is open (does not need a readable name). */
function isViewingProfile(): boolean {
  const modal = document.getElementById('profile-view-modal')
  const modalOpen = !!modal && modal.classList.contains('show')
  const parts = document.location.pathname.split('/').filter(Boolean)
  return (parts.length === 2 && parts[0] === 'u') || modalOpen
}

function isOwn(name: string, me?: string): boolean {
  return !!me && name.trim().toLowerCase() === me.trim().toLowerCase()
}

function buildOnline(b: Bridge): PresenceData {
  const room = clean(b.room, 'Room')
  const song = clean(b.title, 'Unknown Song')
  const count = b.players ?? 0

  switch (b.view) {
    case 'waiting':
      return {
        details: `Lobby: ${room}`,
        state: `Waiting for Players (${count}/${b.max ?? 5})`,
        startTimestamp: pageLoadedAt,
      }
    case 'game':
      return {
        details: `Online Match: ${song}`,
        state: `${count} Players Competing`,
        startTimestamp: pageLoadedAt,
      }
    case 'results':
      return {
        details: `Online Match: ${song}`,
        state: 'Match Results',
        startTimestamp: pageLoadedAt,
      }
    default:
      return {
        details: 'Browsing Online Rooms',
        state: 'Online Lobby',
        startTimestamp: pageLoadedAt,
      }
  }
}

function buildSpeedTest(st: SpeedTestBridge): PresenceData {
  const wpm = Math.round(num(st.wpm))
  const acc = num(st.acc, 100).toFixed(1)

  // Finished: show the score and freeze the clock (no timestamps).
  if (st.phase === 'finished') {
    return {
      details: 'Speed Test Completed!',
      state: `Score: ${wpm} WPM (${acc}% Acc)`,
    }
  }

  // Typing: live WPM / accuracy with a real countdown.
  if (st.phase === 'running') {
    const data: PresenceData = {
      details: '60s Speed Test',
      state: `${wpm} WPM | ${acc}% Acc`,
    }
    const left = num(st.left)
    if (left > 0)
      data.endTimestamp = stableEnd('st', left)
    else
      data.startTimestamp = pageLoadedAt
    return data
  }

  // Idle: the test is open but the first key has not been pressed yet.
  return {
    details: '60s Speed Test',
    state: 'Ready to Type',
    startTimestamp: pageLoadedAt,
  }
}

function buildSolo(b: Bridge): PresenceData {
  // 1) Speed Test 60s
  if (b.st)
    return buildSpeedTest(b.st)

  // 2) Playing a song (normal or ranked)
  if (b.playing) {
    const accText = `${num(b.acc, 100).toFixed(1)}%`
    const song = songLine(b.title, b.artist)
    const data: PresenceData = b.ranked
      ? { details: `Ranked: ${song}`, state: `${accText} Acc | Climbing Leaderboard` }
      : { details: song, state: `${accText} Acc | Max Combo ${b.maxCombo ?? 0}` }

    const remaining = (b.dur ?? 0) - (b.cur ?? 0)
    if ((b.dur ?? 0) > 0 && remaining > 0)
      data.endTimestamp = stableEnd(`${b.ranked}|${song}`, remaining)
    else
      data.startTimestamp = pageLoadedAt
    return data
  }

  // 3) Profiles (own profile vs. someone else's, name read from URL or modal)
  const viewed = profileNameFromPath() ?? profileViewModalName()
  if (viewed) {
    return isOwn(viewed, b.me)
      ? { details: 'Checking Profile & Badges', state: 'Main Menu', startTimestamp: pageLoadedAt }
      : { details: `Viewing Profile: ${viewed}`, state: 'Main Menu', startTimestamp: pageLoadedAt }
  }

  // 4) Global Rankings
  if (isRankingsPage()) {
    return {
      details: 'Viewing Global Rankings',
      state: 'Checking Top Players',
      startTimestamp: pageLoadedAt,
    }
  }

  // 5) Everything else: song library / main menu
  return {
    details: 'Browsing Community Songs',
    state: 'Main Menu',
    startTimestamp: pageLoadedAt,
  }
}

presence.on('UpdateData', async () => {
  const privacy = await presence.getSetting<boolean>('privacy')

  if (privacy) {
    const profile = isViewingProfile()
    presence.setActivity({
      largeImageKey: LOGO,
      details: profile ? 'Browsing Profiles' : 'Playing KaraokeType',
      state: profile ? 'Main Menu' : 'In Game',
      startTimestamp: pageLoadedAt,
      buttons: BUTTONS,
    })
    return
  }

  const bridge = readBridge()
  const isOnlinePage = !!document.getElementById('room-grid')
  const data = isOnlinePage ? buildOnline(bridge) : buildSolo(bridge)

  presence.setActivity({ largeImageKey: LOGO, ...data, buttons: BUTTONS })
})
