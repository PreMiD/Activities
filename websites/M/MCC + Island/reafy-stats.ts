import { ReafyGameIcons, ReafyGames, ReafyLogo } from './reafy-assets.js'

interface ReafyView {
  type: 'home' | 'player' | 'events' | 'event' | 'other'
  player?: string
  head?: string
  event?: string
  game?: string
  season?: string
  board?: string
}

function text(value?: string | null): string | undefined {
  return value?.replace(/\s+/g, ' ').trim().slice(0, 128) || undefined
}

function gameSelection(): string | undefined {
  const controls = Array.from(document.querySelectorAll<HTMLSelectElement>('select'))
    .filter(control => !control.disabled && !control.closest('[hidden], [inert], [aria-hidden="true"]'))
    .filter(control => Array.from(control.options).some(option => Object.hasOwn(ReafyGames, option.value)))
  const selected = controls.at(-1)?.selectedOptions[0]
  return selected && !selected.disabled && (Object.hasOwn(ReafyGames, selected.value) || selected.value === 'all' || selected.value === 'event')
    ? selected.value
    : undefined
}

function playerHead(image: HTMLImageElement | null): string | undefined {
  const source = image?.getAttribute('src') || image?.currentSrc
  if (!source || !URL.canParse(source, document.location.href))
    return undefined
  const url = new URL(source, document.location.href)
  const uuid = url.pathname.match(/^\/(?:body|avatar|head)\/([a-f\d-]{32,36})(?:\/|\.png|$)/i)?.[1]
  if (url.protocol !== 'https:' || url.hostname !== 'mc-heads.net' || !uuid || !/^[a-f\d]{32}$/i.test(uuid.replaceAll('-', '')))
    return undefined
  // Use the UUID already supplied by the website, not a separate name lookup.
  return `https://mc-heads.net/avatar/${uuid}/512.png`
}

function selection(): ReafyView {
  const path = document.location.pathname.replace(/\/+$/, '')
  if (!path) {
    return {
      type: 'home',
      game: gameSelection(),
      event: Array.from(document.querySelectorAll('h2')).map(heading => text(heading.textContent)).find(name => name && /^(?:MC Championship|MCC)\b/.test(name)),
    }
  }
  if (path === '/events')
    return { type: 'events' }
  const player = path.match(/^\/players\/([\w-]{1,32})$/i)?.[1]
  if (player) {
    const view: ReafyView = { type: 'player', game: gameSelection() }
    const season = document.querySelector<HTMLSelectElement>('#seasonSelect')?.selectedOptions[0]?.value
    if (season && /^[1-9]\d?$/.test(season))
      view.season = `Season ${season}`
    const name = text(document.querySelector('.player-info h1')?.textContent)
    const image = document.querySelector<HTMLImageElement>('.player-info img')
    // Reafy route aliases can differ from the current IGN (Rendog -> Renthedog).
    if (name && image?.alt === `Avatar of ${name}` && document.title.toLowerCase() === `${player} - ReafyStats`.toLowerCase()) {
      view.player = name
      view.head = playerHead(image)
    }
    return view
  }
  const event = path.match(/^\/events\/([\w-]+)$/i)?.[1]
  if (event) {
    const view: ReafyView = { type: 'event', game: gameSelection() }
    const name = text(document.querySelector('h1')?.textContent)
    const team = Array.from(document.querySelectorAll<HTMLImageElement>('img[alt]'))
      .some(image => image.alt.toLowerCase().startsWith(`${event.toLowerCase()} `) && image.getAttribute('src')?.includes('/team-icons/'))
    if (name && team && document.title === `${name} - ReafyStats`)
      view.event = name
    const board = text(document.querySelector('.tabs .tab-active')?.textContent)
    if (board === 'Team' || board === 'Individual')
      view.board = `${board} leaderboard`
    return view
  }
  return { type: 'other' }
}

export function reafySelection(privacy: boolean): string {
  return JSON.stringify([document.location.href, privacy ? 'private' : selection()])
}

export function getReafyData(privacy: boolean, showButtons: boolean): Partial<PresenceData> {
  const data: Partial<PresenceData> = {
    name: 'MCC Stats · ReafyStats',
    details: privacy ? 'Looking at statistics' : 'Browsing MCC statistics',
    largeImageKey: ReafyLogo,
    largeImageText: 'ReafyStats',
  }
  if (privacy)
    return data
  const view = selection()
  let label: string | undefined
  if (view.type === 'home') {
    data.details = 'Choosing a player'
    if (view.game && Object.hasOwn(ReafyGames, view.game)) {
      data.details = 'Looking at event projections'
      data.state = [view.event, ReafyGames[view.game]].filter(Boolean).join(' · ').slice(0, 128)
    }
  }
  else if (view.type === 'events') {
    data.details = 'Looking at MCC events'
    data.state = 'Choosing an event'
    label = 'View Events'
  }
  else if (view.type === 'player') {
    data.details = 'Looking at player statistics'
    if (view.player) {
      data.state = [view.player, view.game === 'all' ? 'All Games' : ReafyGames[view.game ?? ''], view.season].filter(Boolean).join(' · ').slice(0, 128)
      if (view.head) {
        data.largeImageKey = view.head
        data.largeImageText = view.player
      }
      label = 'View Player Statistics'
    }
  }
  else if (view.type === 'event') {
    data.details = 'Looking at event statistics'
    if (view.event) {
      data.state = [view.event, view.board, ReafyGames[view.game ?? '']].filter(Boolean).join(' · ').slice(0, 128)
      label = 'View Event Statistics'
    }
  }
  if ((view.type === 'player' && view.player) || (view.type === 'event' && view.event)) {
    data.smallImageKey = ReafyGameIcons[view.game ?? ''] ?? ReafyLogo
    data.smallImageText = ReafyGames[view.game ?? ''] ?? 'ReafyStats'
  }
  if (showButtons && label) {
    const url = new URL(document.location.href)
    url.search = ''
    url.hash = ''
    data.buttons = [{ label, url: url.href }]
  }
  return data
}
