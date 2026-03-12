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

const beyondthesun: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/41.png',
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
        case 'actionPhase':
          data.state = 'Moving action pawn'
          break
        case 'achievementPhase':
          data.state = 'Claiming an achievement'
          break
        case 'trade':
        case 'tradeOnly':
          data.state = 'Trading resources'
          break
        case 'productionPhase':
          data.state = 'Choosing what to produce'
          break
        case 'chooseDisc':
          data.state = 'Choosing a disc to place'
          break
        case 'guild1':
          data.state = 'Opening a Tier 1 Guild'
          break
        case 'guild2':
          data.state = 'Opening a Tier 2 Guild'
          break
        case 'controlEffect':
        case 'colonizeEffect':
        case 'controlOrder':
        case 'eventChoice':
        case 'eventChoiceAll':
        case 'immediateEffect':
          data.state = 'Resolving an effect'
          break
        case 'pickTechnologyType':
          data.state = 'Choosing a color for the new Technology'
          break
        case 'pickTechnology':
          data.state = 'Choosing a Technology'
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
export default beyondthesun
