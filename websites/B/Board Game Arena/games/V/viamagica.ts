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

const viamagica: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/605.png',
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
        case 'chooseInitCards':
          data.state = 'Choosing starting portal cards'
          break
        case 'placeGem':
          data.state = 'Placing a crystal'
          break
        case 'completeCard':
          data.state = 'Completing a portal card'
          break
        case 'resolvePortalCount':
          data.state = 'Choosing portal card reward'
          break
        case 'exPlayGem':
          data.state = 'Placing extra crystal'
          break
        case 'chooseNewCardBonus':
          data.state = 'Choosing new portal card'
          break
        case 'completePortalBonus':
          data.state = 'Opening a bonus portal'
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
export default viamagica
