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

const gardennation: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/202.png',
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
        case 'chooseSecretMissions':
          data.state = 'Choosing secret missions'
          break
        case 'chooseAction':
          data.state = 'Choosing an action'
          break
        case 'constructBuilding':
          data.state = 'Constructing a building'
          break
        case 'chooseTypeOfLand':
          data.state = 'Choosing a type of land'
          break
        case 'chooseCompletedCommonProject':
          data.state = 'Choosing a common project to complete'
          break
        case 'abandonBuilding':
          data.state = 'Abandoning a building'
          break
        case 'usePloyToken':
          data.state = 'Using a ploy token'
          break
        case 'strategicMovement':
          data.state = 'Choosing a territory for the Torticrane'
          break
        case 'chooseRoofToTransfer':
          data.state = 'Transferring a roof'
          break
        case 'chooseRoofDestination':
          data.state = 'Choosing a building for the roof'
          break
        case 'buildingInvasion':
          data.state = 'Invading a building'
          break
        case 'chooseNextPlayer':
          data.state = 'Choosing the next player'
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
export default gardennation
