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

const amyitis: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/11.png',
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
        case 'playerAction':
          data.state = 'Taking an action'
          break
        case 'recruitFarmer':
          data.state = 'Choosing a field'
          break
        case 'recruitEngineer':
        case 'recruitEngineerNoPoints':
          data.state = 'Building an irrigation'
          break
        case 'procession':
        case 'recruitPriest':
          data.state = 'Choosing a temple'
          break
        case 'caravanSell':
          data.state = 'Selling resources'
          break
        case 'caravanCard':
        case 'freeCourtChoice':
          data.state = 'Choosing a Court card'
          break
        case 'caravanGarden':
          data.state = 'Planting in the garden'
          break
        case 'endActionCheck':
          data.state = 'Choosing a resource with Caravaneer'
          break
        case 'tammouzChoice':
          data.state = 'Choosing a field (Tammouz temple power)'
          break
        case 'tammouzExchange':
          data.state = 'Exchanging resources (Tammouz temple power)'
          break
        case 'stockLimitation':
          data.state = 'Discarding resources'
          break
        case 'ishtarChoice':
          data.state = 'Choosing a talent or camel (Ishtar temple power)'
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
export default amyitis
