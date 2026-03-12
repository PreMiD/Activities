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

const warchest: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/610.png',
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
        case 'draftUnit':
          data.state = 'Drafting a unit'
          break
        case 'selectUnit':
          data.state = 'Selecting a unit'
          break
        case 'secondActions':
        case 'unitSelected':
          data.state = 'Selecting an action'
          break
        case 'askAttacked':
        case 'afterChooseVictimAttack':
          data.state = 'Selecting a unit to remove'
          break
        case 'decreeSelected':
        case 'decreeSecondActions':
          data.state = 'Selecting a decree action'
          break
        case 'spyDecree':
          data.state = 'Discarding a coin (Spy Decree)'
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
export default warchest
