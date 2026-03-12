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

const worldwidetennis: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/617.png',
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
        case 'serverTurn':
          data.state = 'Playing a serve card'
          break
        case 'playerMove':
          data.state = 'Moving or giving up a point'
          break
        case 'chooseCard':
          data.state = 'Playing a card'
          break
        case 'chooseSide':
          data.state = 'Choosing a side'
          break
        case 'playerReplacement':
          data.state = 'Moving a player'
          break
        case 'changeEnds':
          data.state = 'Recovering, focusing and elaborating a strategy'
          break
        case 'multiDiscardExtraCards':
        case 'discardExtraCards':
          data.state = 'Discarding some cards'
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
export default worldwidetennis
