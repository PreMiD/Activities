const presence = new Presence({
  clientId: '1560173357952012288',
})

const LOGO = 'https://i.postimg.cc/05Wh7RF7/5bd4c4a4-8ce5-495b-84f4-c58dddd226c4.jpg'
const pageLoadedAt = Math.floor(Date.now() / 1000)

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

function speedTestRoot(): HTMLElement | null {
  const el = document.getElementById('speedtest-fullscreen-container')
  return el && el.classList.contains('stf-open') ? el : null
}

function profileViewModalName(): string | null {
  const modal = document.getElementById('profile-view-modal')
  if (!modal || !modal.classList.contains('show'))
    return null
  const name = modal.querySelector('#pv-body .pv-name-row span')?.textContent
  return clean(name) || null
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

function buildSolo(b: Bridge): PresenceData {
  // 1) Speed Test 60s
  const st = speedTestRoot()
  if (st) {
    const data: PresenceData = {
      details: 'Speed Test 60s',
      state: 'Practicing Top 200 Words',
    }
    if (st.dataset.phase === 'running') {
      const left = Number(document.getElementById('st-time')?.textContent)
      if (Number.isFinite(left) && left > 0)
        data.endTimestamp = stableEnd('st', left)
      else
        data.startTimestamp = pageLoadedAt
    }
    else {
      data.startTimestamp = pageLoadedAt
    }
    return data
  }

  // 2) Playing a song (normal or ranked)
  if (b.playing) {
    const accText = `${(b.acc ?? 100).toFixed(1)}%`
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

  // 3) Profiles
  const pm = location.pathname.match(/^\/u\/([^/]+)\/?$/)
  const viewed = pm ? clean(decodeURIComponent(pm[1])) : profileViewModalName()
  if (viewed) {
    return isOwn(viewed, b.me)
      ? { details: 'Checking Profile & Badges', state: 'Main Menu', startTimestamp: pageLoadedAt }
      : { details: `Viewing Profile: ${viewed}`, state: 'Main Menu', startTimestamp: pageLoadedAt }
  }

  // 4) Everything else: song library / main menu
  return {
    details: 'Browsing Community Songs',
    state: 'Main Menu',
    startTimestamp: pageLoadedAt,
  }
}

presence.on('UpdateData', async () => {
  const privacy = await presence.getSetting<boolean>('privacy')

  if (privacy) {
    presence.setActivity({
      largeImageKey: LOGO,
      details: 'Playing Karaoketype',
      state: 'In Game',
      startTimestamp: pageLoadedAt,
    })
    return
  }

  const bridge = readBridge()
  const isOnlinePage = !!document.getElementById('room-grid')
  const data = isOnlinePage ? buildOnline(bridge) : buildSolo(bridge)

  presence.setActivity({ largeImageKey: LOGO, ...data })
})
