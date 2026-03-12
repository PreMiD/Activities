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

const steamrollers: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/518.png',
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
        case 'playerTurn':
          data.state = 'Taking an action'
          break
        case 'modifyDice':
        case 'plusOrMinusDice':
        case 'flipOrThrowDice':
          data.state = 'Modifying dice'
          break
        case 'askForBlock':
          data.state = 'Allowing or stealing dice'
          break
        case 'proposeOrderTile':
          data.state = 'Acquiring an order tile'
          break
        case 'buyStartingTile':
          data.state = 'Acquiring a starting tile'
          break
        case 'startingImproveEngine':
          data.state = 'Improving an engine'
          break
        case 'startingBuyActionTile':
          data.state = 'Acquiring an action tile'
          break
        case 'startingDrawPath':
          data.state = 'Drawing a path'
          break
        case 'startingExtraGood':
          data.state = 'Choosing a starting city'
          break
        case 'proposeReroll':
          data.state = 'Rerolling Olive dice'
          break
        case 'proposePreventRemove':
          data.state = 'Preventing Olive from removing a good or pass'
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
export default steamrollers
