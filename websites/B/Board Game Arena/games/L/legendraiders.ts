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

const legendraiders: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/304.png',
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
        case 'character_choice':
          data.state = 'Choosing a character'
          break
        case 'roll_dice':
        case 'choose_action':
          data.state = 'Choosing an action'
          break
        case 'choose_dice_face':
          data.state = 'Playing a dice card'
          break
        case 'choose_dice_card_effect':
          data.state = 'Choosing a dice card effect'
          break
        case 'discard_tile':
          data.state = 'Discarding a tile'
          break
        case 'discard_tool':
          data.state = 'Discarding a tool'
          break
        case 'complete_discovery':
          data.state = 'Completing a discovery'
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
export default legendraiders
