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

const thurnandtaxis: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/559.png',
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
        case 'getCard':
          data.state = 'Drawing a card'
          break
        case 'discardCards':
          data.state = 'Discarding cards'
          break
        case 'getCardOrReplaceCards':
          data.state = 'Drawing a card or using the administrator'
          break
        case 'getSecondCard':
          data.state = 'Drawing a second card (postmaster)'
          break
        case 'getSecondCardOrPlayCard':
          data.state = 'Drawing a second card (postmaster) or playing a card'
          break
        case 'playCard':
        case 'playSecondCard':
          data.state = 'Playing a city card'
          break
        case 'playSecondCardOrScoreRouteWithCartwright':
          data.state = 'Playing a second city card (postal carrier) or placing houses and closing the route (with cartwright)'
          break
        case 'scoreRoute':
          data.state = 'Placing houses and closing the route'
          break
        case 'playSecondCardOrScoreRoute':
          data.state = 'Playing a second city card (postal carrier) or placing houses and closing the route'
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
export default thurnandtaxis
