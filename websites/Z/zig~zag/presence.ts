import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1570559752864268389', // the Discord application named "zig~zag"
})

enum ActivityAssets {
  Logo = 'https://imgur.com/RVoWxox',
}

interface PlayerData {
  title: string
  videoId: string
  currentTime: number
  duration: number
  paused: boolean
}

interface BoatParty {
  name: string
  sailors: number
  names: string[]
}

const browsingTimestamp = Math.floor(Date.now() / 1000)
let player: PlayerData | null = null
let playerSeen = 0

presence.on('iFrameData', (data: unknown) => {
  player = data as PlayerData
  playerSeen = Date.now()
})

const isTimer = (text: string) => /^\d{1,3}(?::\d{2}){1,2}$/.test(text.trim())

/**
 * The boat party you're in, read from zig~zag's boat party chat window:
 * the "Sailors" row (one avatar per sailor) and the party's name in the header next to the party timer.
 * Only works while that chat window is open on screen.
 */
function readBoatParty(): BoatParty | null {
  let label: HTMLElement | null = null
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (!/^\s*sailors?\b/i.test(node.nodeValue ?? ''))
      continue
    const el = node.parentElement
    const rect = el?.getBoundingClientRect()
    if (el && rect && rect.width && rect.height) {
      label = el
      break
    }
  }
  if (!label)
    return null

  // avatars: small pictures on the same line as the "Sailors" label
  const labelRect = label.getBoundingClientRect()
  const labelMid = labelRect.top + labelRect.height / 2
  let faces: Element[] = []
  let row: HTMLElement | null = label.parentElement
  for (let i = 0; i < 4 && row && !faces.length; i++, row = row.parentElement) {
    const found: Element[] = []
    for (const el of row.querySelectorAll('img, [style*="background-image"], canvas, svg')) {
      if (label.contains(el))
        continue
      const r = el.getBoundingClientRect()
      if (r.width < 16 || r.height < 16 || r.width > 96)
        continue
      if (Math.abs(r.top + r.height / 2 - labelMid) > 40)
        continue
      if (found.some(o => Math.abs(o.getBoundingClientRect().left - r.left) < 8))
        continue
      found.push(el)
    }
    faces = found
  }
  if (!faces.length)
    return null

  const names = faces
    .map(f => (f.getAttribute('alt') || f.getAttribute('title') || f.closest('[title]')?.getAttribute('title') || '').trim())
    .filter(Boolean)

  return { name: readPartyName(label, labelRect), sailors: faces.length, names }
}

/** The party's name: the first item in the header row that holds the party timer (e.g. "S.S. EARTH"). */
function readPartyName(label: HTMLElement, labelRect: DOMRect): string {
  let box: HTMLElement = label
  for (let i = 0; i < 10 && box.parentElement; i++) {
    box = box.parentElement
    if (box.getBoundingClientRect().height > 150)
      break
  }

  let timer: HTMLElement | null = null
  const walker = document.createTreeWalker(box, NodeFilter.SHOW_TEXT)
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (!isTimer(node.nodeValue ?? ''))
      continue
    const r = node.parentElement?.getBoundingClientRect()
    if (r && r.width && r.bottom <= labelRect.top + 2) {
      timer = node.parentElement
      break
    }
  }
  if (!timer)
    return ''

  let row: HTMLElement = timer
  for (let i = 0; i < 5 && row.parentElement && row !== box; i++) {
    row = row.parentElement
    if (row.children.length >= 2 && row.getBoundingClientRect().width > 120)
      break
  }
  const nameEl = row.firstElementChild
  if (!nameEl || nameEl.contains(timer) || nameEl.tagName === 'BUTTON')
    return ''

  // text only: skip the edit button and its hidden "Edit info" label (emotes in the name are pictures, so they drop out)
  let text = ''
  const visit = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.nodeValue
      return
    }
    if (!(node instanceof Element))
      return
    if (node.tagName === 'BUTTON' || node.tagName.toLowerCase() === 'svg' || node.getAttribute('role') === 'button')
      return
    if (/\bsr-only\b|visually-hidden/.test(typeof node.className === 'string' ? node.className : ''))
      return
    for (const child of node.childNodes)
      visit(child)
  }
  visit(nameEl)
  text = text.replace(/\s+/g, ' ').replace(/\s*edit info\s*$/i, '').trim()
  return isTimer(text) ? '' : text.slice(0, 40)
}

presence.on('UpdateData', async () => {
  const [showParty, showSailors, showTimestamp, showButtons] = await Promise.all([
    presence.getSetting<boolean>('showParty'),
    presence.getSetting<boolean>('showSailors'),
    presence.getSetting<boolean>('showTimestamp'),
    presence.getSetting<boolean>('showButtons'),
  ])

  // nothing heard from the player for a while: no song (or the player frame isn't being read): show browsing
  if (!player || !player.title || Date.now() - playerSeen > 10000) {
      presence.setActivity({
      details: 'Exploring the map',
      state: 'on zig~zag',
      largeImageKey: ActivityAssets.Logo,
      startTimestamp: browsingTimestamp,
    })
    return
  }

  // YouTube titles are usually "Artist - Song"
  let artist = ''
  let song = player.title
  const split = player.title.match(/^(.+?)\s+[-–—]\s+(.+)$/)
  if (split) {
    artist = split[1]!
    song = split[2]!
  }

  const presenceData: PresenceData = {
    type: ActivityType.Listening,
    details: song.slice(0, 128),
    state: artist ? `by ${artist}` : 'on zig~zag',
    largeImageKey: player.videoId ? `https://i.ytimg.com/vi/${player.videoId}/hqdefault.jpg` : ActivityAssets.Logo,
    largeImageText: 'zig~zag',
  }

  if (showParty) {
    const party = readBoatParty()
    if (party) {
      presenceData.state = `${presenceData.state} · ⛵ ${party.name ? `“${party.name}”` : 'boat party'} (${party.sailors} aboard)`.slice(0, 128)
      presenceData.smallImageKey = ActivityAssets.Logo
      presenceData.smallImageText = (showSailors && party.names.length ? `sailing with ${party.names.join(', ')}` : 'in a boat party').slice(0, 128)
    }
  }

  if (player.paused) {
    presenceData.smallImageKey = Assets.Pause
    presenceData.smallImageText = 'Paused'
  }
  else if (showTimestamp) {
    [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(player.currentTime, player.duration)
  }

  if (showButtons && /\/track~\d+/.test(document.location.pathname)) {
    presenceData.buttons = [{ label: 'Listen on zig~zag', url: document.location.href }]
  }

  presence.setActivity(presenceData)
})
