import { Assets } from 'premid'

const presence = new Presence({ clientId: '1555855996428099594' })

enum ActivityAssets {
  Logo = 'https://cdn.discordapp.com/app-assets/1555855996428099594/1555856356391657562.png?size=512',
}

let matchStarted: number | null = null
let previousState = ''
let selectedMode = ''
const browsingStarted = Math.floor(Date.now() / 1000)

function visible(selector: string): boolean {
  const element = document.querySelector<HTMLElement>(selector)
  if (!element)
    return false
  for (let current: HTMLElement | null = element; current; current = current.parentElement) {
    const style = getComputedStyle(current)
    if (style.display === 'none' || style.visibility === 'hidden')
      return false
  }
  return element.getClientRects().length > 0
}

function modeFromButton(element: Element | null): string {
  const text = element?.textContent?.trim() ?? ''
  return text.match(/\b(Solo|Duo|Squad)\b/i)?.[1]?.replace(/^./, character => character.toUpperCase()) ?? ''
}

// Remember only the public mode label; never read names, invite codes, or account storage.
document.addEventListener('click', (event) => {
  const button = (event.target as Element | null)?.closest('#btn-start-mode-0, #btn-start-mode-1, #btn-start-mode-2, #btn-start-team')
  if (button) {
    selectedMode = button.id === 'btn-start-team'
      ? modeFromButton(document.querySelector('#team-menu .btn-hollow-selected[id^="btn-team-queue-mode-"]'))
      : modeFromButton(button)
  }
}, true)

function count(selector: string): number | null {
  if (!visible(selector))
    return null
  const text = document.querySelector(selector)?.textContent?.trim() ?? ''
  return /^\d{1,3}$/.test(text) ? Number(text) : null
}

presence.on('UpdateData', async () => {
  if (document.location.hostname !== 'survev.io') {
    presence.clearActivity()
    return
  }
  const [privacy, browsing, gameState, matchInformation, timestamp] = await Promise.all([
    presence.getSetting<boolean>('privacyMode'),
    presence.getSetting<boolean>('showBrowsing'),
    presence.getSetting<boolean>('showGameState'),
    presence.getSetting<boolean>('showMatchInformation'),
    presence.getSetting<boolean>('showTimestamp'),
  ])

  const menu = visible('#start-menu-wrapper')
  const inGame = visible('#game-area-wrapper') && visible('#ui-game') && !menu
  const matchmaking = menu && ['#btn-start-mode-0', '#btn-start-mode-1', '#btn-start-mode-2', '#btn-start-team']
    .some(selector => visible(selector) && document.querySelector(`${selector} .ui-spinner`))
  const state = inGame
    ? visible('#ui-stats') ? 'results' : visible('#ui-spectate-text') ? 'spectating' : 'playing'
    : matchmaking ? 'matchmaking' : menu && visible('#team-menu') ? 'lobby' : 'browsing'

  if (inGame && matchStarted === null)
    matchStarted = Math.floor(Date.now() / 1000)
  if (!inGame) {
    matchStarted = null
    if (previousState === 'playing' || previousState === 'spectating' || previousState === 'results')
      selectedMode = ''
  }
  previousState = state

  if ((!inGame && !browsing) || (inGame && !gameState && !browsing)) {
    presence.clearActivity()
    return
  }

  const data: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    details: 'Playing Survev.io',
  }
  if (privacy) {
    presence.setActivity(data)
    return
  }

  if (gameState) {
    const descriptions: Record<string, string> = {
      browsing: 'Browsing the menus',
      lobby: 'In a team lobby',
      matchmaking: 'Finding a match',
      playing: 'In a match',
      spectating: 'Spectating a match',
      results: 'Viewing match results',
    }
    data.details = descriptions[state]!
  }
  else {
    data.details = 'Browsing Survev.io'
  }

  if (gameState && matchInformation) {
    const information: string[] = []
    if (inGame && selectedMode)
      information.push(selectedMode)
    if (state === 'playing' || state === 'spectating') {
      const alive = count('.ui-players-alive')
      const kills = state === 'playing' ? count('.ui-player-kills') : null
      if (alive !== null)
        information.push(`${alive} alive`)
      if (kills !== null)
        information.push(`${kills} kill${kills === 1 ? '' : 's'}`)
    }
    if (information.length)
      data.state = information.join(' • ')
  }
  if (gameState && state === 'spectating') {
    data.smallImageKey = Assets.Viewing
    data.smallImageText = 'Spectating'
  }
  if (timestamp && state !== 'results' && (!inGame || gameState))
    data.startTimestamp = matchStarted ?? browsingStarted

  presence.setActivity(data)
})
