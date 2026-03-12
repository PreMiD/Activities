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

const fluxx: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/189.png',
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
        case 'playCard':
          data.state = 'Playing a card'
          break
        case 'enforceHandLimitForOthers':
        case 'enforceHandLimitForSelf':
          data.state = 'Discarding cards'
          break
        case 'enforceKeepersLimitForOthers':
        case 'enforceKeepersLimitForSelf':
          data.state = 'Discarding keepers'
          break
        case 'goalCleaning':
          data.state = 'Discarding a goal'
          break
        case 'actionResolve':
          data.state = 'Resolving an action'
          break
        case 'playRockPaperScissors':
          data.state = 'Playing Rock-Paper-Scissors'
          break
        case 'freeRuleResolve':
          data.state = 'Resolving a free rule'
          break
        case 'creeperResolveTurnStart':
        case 'creeperResolveInPlay':
          data.state = 'Resolving a creeper'
          break
        case 'tempHandPlay':
          data.state = 'Playing a card from your hand'
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
export default fluxx
