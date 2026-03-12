import type { GamePresence } from '../index.js'
import {
  getActivePlayerId,
  getCurrentGameState,
  getCurrentGameStateType,
  getPlayerAvatar,
  getPlayerData,
  getPlayerScore,
  getUserPlayerId,
} from '../../util.js'

const heckinhounds: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/238.png',
  async getData(presence: Presence) {
    const gameState = await getCurrentGameState(presence)
    const activePlayer = await getActivePlayerId(presence)
    const gameStateType = await getCurrentGameStateType(presence)
    const userPlayer = await getUserPlayerId(presence)
    const activePlayerData = await getPlayerData(presence, activePlayer)
    const data: PresenceData = {
      smallImageKey: getPlayerAvatar(userPlayer),
      smallImageText: `Score: ${getPlayerScore(userPlayer)}`,
    }
    if (activePlayer === userPlayer || gameStateType !== 'activeplayer') {
      switch (gameState) {
        case 'chooseBadDog':
          data.state = 'Choosing a bad dog'
          break
        case 'giveClue':
          data.state = 'Giving a clue'
          break
        case 'assignCerberus':
          data.state = 'Assigning Cerberus'
          break
        case 'replaceIntoCerberus':
          data.state = 'Replacing a card with Cerberus'
          break
        case 'deadHandTrade':
          data.state = 'Trading a card with the dead hand'
          break
        case 'promiseShifts':
          data.state = 'Promising shifts to work'
          break
        case 'playerTurn':
          data.state = 'Playing a card'
          break
        case 'gameEnd':
          data.state = 'Viewing game results'
          break
      }
    }
    else {
      data.state = `Waiting for ${activePlayerData.name}`
    }
    return data
  },
}
export default heckinhounds
