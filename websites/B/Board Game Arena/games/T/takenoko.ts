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

const takenoko: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/531.png',
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
        case 'rain':
          data.state = 'Growing a bamboo section'
          break
        case 'movePanda':
        case 'storm':
          data.state = 'Moving the panda'
          break
        case 'clouds':
          data.state = 'Choosing an improvement from the reserve'
          break
        case 'questionmark':
          data.state = 'Choosing a weather condition for this turn'
          break
        case 'playerTurn':
          data.state = 'Taking an action or playing an objective'
          break
        case 'playerTurnNoMoreAction':
          data.state = 'Playing an objective'
          break
        case 'placeIrrigationImmediately':
          data.state = 'Placing an irrigation'
          break
        case 'placeImprovementImmediately':
          data.state = 'Placing an improvement'
          break
        case 'moveImprovementStep1':
        case 'moveImprovementStep2':
          data.state = 'Moving an improvement'
          break
        case 'choosePlots':
          data.state = 'Placing a new plot'
          break
        case 'moveGardener':
          data.state = 'Moving the gardener'
          break
        case 'chooseObjective':
          data.state = 'Choosing an objective category'
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
export default takenoko
