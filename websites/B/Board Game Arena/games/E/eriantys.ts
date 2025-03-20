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

const eriantys: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/171.png',
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
        case 'playAssistant':
          data.state = 'Playing an assistant card'
          break
        case 'moveStudents':
          data.state = 'Moving a student'
          break
        case 'moveMona':
          data.state = 'Moving Mother Nature'
          break
        case 'cloudTileDrafting':
          data.state = 'Choosing a Cloud tile'
          break
        case 'character1_ability':
          data.state = 'Moving a student to an island'
          break
        case 'character2_ability':
          data.state = 'Resolving an island\'s effects'
          break
        case 'character4_ability':
          data.state = 'Placing a No Entry token on an island'
          break
        case 'character6_ability':
          data.state = 'Replacing students in their school'
          break
        case 'character8_ability':
        case 'character11_ability':
          data.state = 'Choosing a student color'
          break
        case 'character10_ability':
          data.state = 'Moving a student to their School Dining Hall'
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
export default eriantys
