import { GameType } from './types.js'

let currentPlayer: {
  name: string
  gameType: GameType
  lifeDiff?: number
  points?: number
  dead?: boolean
  isInRound: boolean
} = {
  name: '',
  gameType: GameType.None,
  lifeDiff: 0,
  points: 0,
  dead: false,
  isInRound: false,
}

export function updatePlayerName(): void {
  const localsettings = window.localStorage.getItem('jklmSettings')
  if (localsettings) {
    try {
      const parsedSettings = JSON.parse(localsettings)
      if (parsedSettings && parsedSettings.nickname) {
        currentPlayer.name = parsedSettings.nickname
      }
    }
    catch (error) {
      console.error('Error parsing jklmSettings from localStorage:', error)
    }
  }
}

export function resetPlayerData(): void {
  currentPlayer = {
    name: currentPlayer.name,
    gameType: GameType.None,
    lifeDiff: 0,
    points: 0,
    dead: false,
    isInRound: false,
  }
}

function getBombPartyPlayerData(): typeof currentPlayer {
  const playerRow = document.querySelector('.statsTable tbody tr.self')
  if (!playerRow) {
    currentPlayer.lifeDiff = 0
    currentPlayer.dead = false
    currentPlayer.isInRound = false
    return currentPlayer
  }

  const playerLivesElement = playerRow?.querySelector('td.lives')
  const playerDeadElement = playerRow?.classList.contains('isDead')

  let lifeDiff = 0

  playerLivesElement?.textContent.split(' / ').forEach((value) => {
    lifeDiff += Number.parseInt(value || '0', 10) || 0
  })

  currentPlayer.dead = playerDeadElement || false
  currentPlayer.lifeDiff = lifeDiff
  currentPlayer.isInRound = true
  return currentPlayer
}

function getPopSaucePlayerData(): typeof currentPlayer {
  const playerRow = document.querySelector(`.scoreboard .entry[title="${CSS.escape(currentPlayer.name)}"]`)
  if (!playerRow) {
    currentPlayer.points = 0
    currentPlayer.isInRound = false
    return currentPlayer
  }

  const playerPointsElement = playerRow?.querySelector('.score')

  currentPlayer.points = playerPointsElement ? Number.parseInt(playerPointsElement.textContent || '0', 10) : 0
  // The player is guaranteed to be in the round if they have a scoreboard
  currentPlayer.isInRound = true

  return currentPlayer
}

export function getCurrentPlayerData(game: GameType): typeof currentPlayer {
  // We are coming from a different game, reset playerdata to avoid polluting
  if (currentPlayer.gameType !== game) {
    resetPlayerData()
    currentPlayer.gameType = game
  }

  switch (game) {
    case GameType.BombParty:
      return getBombPartyPlayerData()
    case GameType.PopSauce:
      return getPopSaucePlayerData()
    default:
      return currentPlayer
  }
}
