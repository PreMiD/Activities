import type { GamePresence } from '../index.js'
import {
  getActivePlayerId,
  getCurrentGameState,
  getPlayerAvatar,
  getPlayerData,
  getPlayerScore,
  getUserPlayerId,
} from '../../util.js'

const carcassonne: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/73.png',
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
        case 'playTile':
          data.state = 'Placing a tile'
          break
        case 'canPlayPartisan':
          data.state = 'Placing a partisan on the tile'
          break
        case 'dragonWalkPlayerChoice':
          data.state = 'Moving the dragon'
          break
        case 'scorePoints':
          data.state = 'Scoring points'
          break
        case 'gameEnd':
          data.state = 'Viewing game results'
          break
      }
    }
    else {
      data.state = `Waiting for ${activePlayerData.name}`
    }
    if (gameState === 'unachievedCount')
      data.state = 'Calculating unachieved points'
    return data
  },
}
export default carcassonne
