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

const itsawonderfulworld: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/266.png',
  async getData(presence: Presence) {
    const gameState = await getCurrentGameState(presence)
    const gameStateType = await getCurrentGameStateType(presence)
    const activePlayer = await getActivePlayerId(presence)
    const userPlayer = await getUserPlayerId(presence)
    const activePlayerData = await getPlayerData(presence, activePlayer)
    const data: PresenceData = {
      smallImageKey: getPlayerAvatar(userPlayer),
      smallImageText: `Score: ${getPlayerScore(userPlayer)}`,
    }
    if (activePlayer === userPlayer || gameStateType !== 'activeplayer') {
      switch (gameState) {
        case 'stateDraft':
          data.state = 'Drafting a card'
          break
        case 'statePlanning':
          data.state = 'Using cards'
          break
        case 'statePlanDiscard':
          data.state = 'Choosing a card to keep'
          break
        case 'stateProductionBonus':
          data.state = 'Choosing a supremacy bonus'
          break
        case 'stateProduction':
          data.state = 'Placing a production cube'
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
export default itsawonderfulworld
