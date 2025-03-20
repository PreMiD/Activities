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

const offtherails: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/385.png',
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
        case 'playerActionPhase':
          data.state = 'Taking actions'
          break
        case 'playerMovementCart':
        case 'playerMovementDirection':
          data.state = 'Choosing which cart moves first'
          break
        case 'playerMovementJewels':
          data.state = 'Choosing which jewels to pick up'
          break
        case 'playerCollisionSplit':
          data.state = 'Dividing jewels from struck cart'
          break
        case 'playerCollisionHand':
          data.state = 'Choosing which hand to drop'
          break
        case 'playerMissionClaim':
          data.state = 'Claiming a mission card'
          break
        case 'playerChasmExpand':
          data.state = 'Choosing where the mine will collapse'
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
export default offtherails
