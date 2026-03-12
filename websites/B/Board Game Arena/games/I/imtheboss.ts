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

const imtheboss: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/259.png',
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
        case 'SelectStartSpace':
          data.state = 'Selecting the start space'
          break
        case 'playerTurn':
        case 'playerTurn2':
          data.state = 'Taking an action'
          break
        case 'Deal':
          data.state = 'Making a deal'
          break
        case 'Negotiation':
          data.state = 'Negotiating a deal'
          break
        case 'DiscardCards':
          data.state = 'Discarding cards'
          break
        case 'RollingDie':
          data.state = 'Rolling the die to determine if the game is over'
          break
        case 'DecideOffer':
          data.state = 'Deciding whether to accept or reject an offer'
          break
        case 'StopBoss':
          data.state = 'Deciding whether to stop the boss card'
          break
        case 'StopTrip':
          data.state = 'Deciding whether to stop the travel card'
          break
        case 'StopRecruitment':
          data.state = 'Deciding whether to stop the recruitment card'
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
export default imtheboss
