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

const keyflower: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/279.png',
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
        case 'locationSelected':
          data.state = 'Placing workers'
          break
        case 'productionChoice':
        case 'productionCost':
          data.state = 'Producing goods'
          break
        case 'villageTransportB':
        case 'villageTransportA':
          data.state = 'Transporting resources'
          break
        case 'villageUpgrade':
        case 'villageUpgradeChoice':
          data.state = 'Upgrading a tile'
          break
        case 'boatSelection':
          data.state = 'Selecting a boat'
          break
        case 'villageConstructionA':
          data.state = 'Placing new tiles in villages'
          break
        case 'winterSelection':
          data.state = 'Selecting winter tiles'
          break
        case 'scoringSelect':
        case 'scoringDestination':
          data.state = 'Scoring tiles'
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
export default keyflower
