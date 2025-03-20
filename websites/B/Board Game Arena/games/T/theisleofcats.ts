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

const theisleofcats: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/548.png',
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
        case 'STATE_PHASE_2_EXPLORE_DRAFT':
          data.state = 'Choosing cards to keep'
          break
        case 'STATE_PHASE_ANYTIME_BUY_CARDS':
        case 'STATE_PHASE_2_BUY_CARDS':
          data.state = 'Buying cards'
          break
        case 'STATE_PHASE_4_CHOOSE_RESCUE_CARDS_SINGLE':
        case 'STATE_PHASE_4_CHOOSE_RESCUE_CARDS':
          data.state = 'Choosing rescue cards'
          break
        case 'STATE_FAMILY_RESCUE_CAT':
        case 'STATE_PHASE_4_RESCUE_CAT':
          data.state = 'Rescuing cats'
          break
        case 'STATE_PHASE_5_RARE_FINDS':
          data.state = 'Taking a rare find'
          break
        case 'STATE_PHASE_ANYTIME_DRAW_AND_BOAT_SHAPE':
        case 'STATE_PHASE_ANYTIME_DRAW_AND_FIELD_SHAPE':
          data.state = 'Placing the drawn shape'
          break
        case 'STATE_PHASE_ANYTIME_ROUND':
          data.state = 'Playing an Anytime card'
          break
        case 'STATE_FAMILY_CHOOSE_LESSONS':
          data.state = 'Choosing lesson cards'
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
export default theisleofcats
