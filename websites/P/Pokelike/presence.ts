const presence = new Presence({ clientId: '503557087041683458' })
const sessionStarted = Math.floor(Date.now() / 1000)

// Use the rendered DOM only: no account details, saves, or game internals.
function visible(element: Element | null): element is HTMLElement {
  if (!(element instanceof HTMLElement) || !element.isConnected)
    return false
  for (let current: HTMLElement | null = element; current; current = current.parentElement) {
    const style = getComputedStyle(current)
    if (current.hidden || style.display === 'none' || style.visibility === 'hidden' || style.visibility === 'collapse')
      return false
  }
  return true
}

function text(selector: string): string | undefined {
  const element = document.querySelector(selector)
  if (!visible(element))
    return undefined
  const value = element.textContent?.replace(/\s+/g, ' ').trim()
  return value ? [...value].slice(0, 128).join('') : undefined
}

const screens: Record<string, string> = {
  'title-screen': 'In the main menu',
  'trainer-screen': 'Choosing a trainer',
  'starter-screen': 'Choosing a starter',
  'history-region-select': 'Choosing a Story adventure',
  'endless-stage-select': 'Choosing a Battle Tower stage',
  'map-screen': 'Exploring the map',
  'battle-screen': 'In battle',
  'catch-screen': 'Catching a Pokemon',
  'item-screen': 'Choosing an item',
  'passive-screen': 'Choosing a relic',
  'swap-screen': 'Managing the team',
  'trade-screen': 'Trading Pokemon',
  'shiny-screen': 'Encountering a shiny Pokemon',
  'badge-screen': 'Earned a badge!',
  'transition-screen': 'Travelling to the next area',
  'elite-prep-screen': 'Preparing for battle',
  'gameover-screen': 'Run ended',
  'win-screen': 'Became the Champion!',
  'stat-buff-screen': 'Choosing a stat boost',
  'endless-stage-complete': 'Cleared a Battle Tower stage',
}

presence.on('UpdateData', () => {
  const data: PresenceData = {
    name: 'Pokelike',
    type: 0, // Playing
    details: 'Playing Pokelike',
    largeImageKey: 'https://pokelike.xyz/img/icon-512.png',
    startTimestamp: sessionStarted,
  }

  let state: string | undefined

  // An overlay can cover an active game screen; check it first.
  if (visible(document.getElementById('poke-maint-overlay'))) {
    data.details = 'Waiting for the game update'
  }
  else if (visible(document.getElementById('eevee-choice-overlay'))) {
    data.details = 'Choosing an evolution'
  }
  else if (visible(document.getElementById('evo-overlay'))) {
    data.details = 'Evolving a Pokemon'
  }
  else {
    const screen = [...document.querySelectorAll<HTMLElement>('.screen.active')].find(visible)
    if (screen) {
      data.details = screens[screen.id] ?? 'Browsing Pokelike'
      switch (screen.id) {
        case 'map-screen':
          state = text('#map-info')
          break
        case 'battle-screen':
          state = text('#battle-title')
          break
        case 'elite-prep-screen':
          state = text('#elite-prep-title')
          break
        case 'badge-screen':
          state = text('#badge-desc')
          break
        case 'transition-screen':
          state = text('#transition-msg')
          break
        case 'endless-stage-complete':
          state = text('#stage-complete-msg')
          break
      }
    }
  }

  // Construct fresh data each update so previous battle/map text is cleared.
  if (state)
    data.state = state
  presence.setActivity(data)
})
