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

const obsession: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/384.png',
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
        case 'pickFamily':
          data.state = 'Choosing a family'
          break
        case 'pickStartingGuest':
          data.state = 'Choosing a starting guest'
          break
        case 'hostActivity':
          data.state = 'Hosting an activity'
          break
        case 'builderMarket':
          data.state = 'Purchasing an improvement'
          break
        case 'playerResolveFavor':
          data.state = 'Resolving a favor'
          break
        case 'pickFairChild':
          data.state = 'Inviting a Fairchild'
          break
        case 'discardObjective':
          data.state = 'Discarding an objective'
          break
        case 'playVpCard':
          data.state = 'Playing a VP card'
          break
        case 'gameover':
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
export default obsession
