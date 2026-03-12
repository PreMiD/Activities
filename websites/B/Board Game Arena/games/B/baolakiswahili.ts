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

const baolakiswahili: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/32.png',
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
        case 'gameEdit':
          data.state = 'Editing board for both players'
          break
        case 'kunamuaMoveSelection':
          data.state = 'Placing seed and making move'
          break
        case 'kunamuaMoveExecution':
          data.state = 'Executing move'
          break
        case 'mtajiCaptureSelection':
        case 'kunamuaCaptureSelection':
          data.state = 'Selecting kichwa'
          break
        case 'safariDecision':
          data.state = 'Deciding about safari'
          break
        case 'mtajiMoveSelection':
          data.state = 'Making mtaji move'
          break
        case 'mtajiMoveExecution':
          data.state = 'Executing mtaji move'
          break
        case 'husMoveSelection':
          data.state = 'Making a move'
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
export default baolakiswahili
