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

const barenpark: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/34.png',
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
        case 'STATE_MAIN_PLAY_STATE':
          data.state = 'Playing their turn'
          break
        case 'STATE_PRIVATE_CHOOSE_TILE_FROM_PLAYER_SUPPLY':
          data.state = 'Selecting a tile from their supply'
          break
        case 'STATE_PRIVATE_PLACE_TILE_IN_PARK':
          data.state = 'Placing a tile in their park'
          break
        case 'STATE_PRIVATE_CHOOSE_FROM_SUPPLY_BOARD':
          data.state = 'Selecting a tile from the supply board'
          break
        case 'STATE_PRIVATE_TRY_MODE_PLACE_PARK':
        case 'STATE_PRIVATE_PLACE_PLAYER_PARK':
          data.state = 'Placing a new park area'
          break
        case 'STATE_PRIVATE_PASS_TURN_CHOOSE_FROM_SUPPLY_BOARD':
          data.state = 'Selecting a new green area tile'
          break
        case 'STATE_PRIVATE_CONFIRM_TURN':
          data.state = 'Confirming their turn'
          break
        case 'STATE_PRIVATE_TRY_MODE_CHOOSE_TILE':
          data.state = 'Selecting a tile or a park'
          break
        case 'STATE_PRIVATE_TRY_MODE_PLACE_TILE':
          data.state = 'Placing a tile'
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
export default barenpark
