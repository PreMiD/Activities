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

const tanghulu: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/534.png',
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
        case 'roll_dice':
          data.state = 'Rolling the dice'
          break
        case 'bonus_fruit':
          data.state = 'Choosing if to place the drawn fruit or return it to the bag'
          break
        case 'caramelize_skewer':
          data.state = 'Garnishing a completed stick'
          break
        case 'choose_action':
          data.state = 'Buying a fruit or going to work'
          break
        case 'buy_fruit':
          data.state = 'Buying a fruit'
          break
        case 'choose_pattern':
          data.state = 'Selecting the pattern completed'
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
export default tanghulu
