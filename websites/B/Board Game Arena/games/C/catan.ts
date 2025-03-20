import type { GamePresence } from '../index.js'
import {
  getActivePlayerId,
  getCurrentGameState,
  getPlayerAvatar,
  getPlayerData,
  getPlayerScore,
  getUserPlayerId,
} from '../../util.js'

const catan: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/81.png',
  async getData(presence: Presence) {
    const gameState = await getCurrentGameState(presence)
    const activePlayer = await getActivePlayerId(presence)
    const userPlayer = await getUserPlayerId(presence)
    const activePlayerData = await getPlayerData(presence, activePlayer)
    const data: PresenceData = {
      smallImageKey: getPlayerAvatar(userPlayer),
      smallImageText: `Score: ${getPlayerScore(userPlayer)}`,
    }
    if (activePlayer === userPlayer) {
      switch (gameState) {
        case 'playerWarmup':
          data.state = 'Producing resources'
          break
        case 'playerTurn':
          data.state = 'Choosing an action'
          break
        case 'selectRoad':
          data.state = 'Placing a road'
          break
        case 'selectCity':
          data.state = 'Placing a city'
          break
        case 'selectTile':
          data.state = 'Placing a tile'
          break
        case 'selectResources':
          data.state = 'Selecting resources'
          break
        case 'playersTrade':
          data.state = 'Trading with other players'
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
export default catan
