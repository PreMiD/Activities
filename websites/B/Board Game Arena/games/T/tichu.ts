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

const tichu: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/560.png',
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
        case 'grandTichuBets':
          data.state = 'Betting Grand Tichu'
          break
        case 'giveCards':
          data.state = 'Giving cards to other players'
          break
        case 'showPassedCards':
          data.state = 'Accepting cards from other players'
          break
        case 'playComboOpen':
          data.state = 'Playing an opening card combination'
          break
        case 'playCombo':
          data.state = 'Playing a card combination'
          break
        case 'playBomb':
          data.state = 'Playing a bomb'
          break
        case 'phoenixPlay':
          data.state = 'Playing a phoenix combination'
          break
        case 'mahjongPlay':
          data.state = 'Making a wish'
          break
        case 'confirmTrick':
          data.state = 'Collecting the trick'
          break
        case 'chooseDragonGift':
          data.state = 'Choosing who to give the Dragon trick'
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
export default tichu
