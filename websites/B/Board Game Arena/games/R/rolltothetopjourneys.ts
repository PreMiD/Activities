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

const rolltothetopjourneys: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/456.png',
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
        case 'multiplayerSelectionPhase':
        case 'playersTurn':
        case 'confirmEndTurn':
          data.state = 'Taking their turn'
          break
        case 'addDice':
          data.state = 'Adding a die to the active pool'
          break
        case 'removeDice':
          data.state = 'Removing a die from the active pool'
          break
        case 'addOrRemoveDice':
          data.state = 'Adding or removing a die from the active pool'
          break
        case 'swapDice2':
        case 'swapDice1':
          data.state = 'Selecting a die to swap in the active pool'
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
export default rolltothetopjourneys
