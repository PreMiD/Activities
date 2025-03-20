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

const forbiddenisland: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/190.png',
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
        case 'drawTreasure':
          data.state = 'Drawing treasure cards'
          break
        case 'discardTreasure':
          data.state = 'Discarding treasure cards'
          break
        case 'setFlood':
        case 'drawFlood':
          data.state = 'Drawing flood cards'
          break
        case 'rescuePawn':
          data.state = 'Rescuing their pawn'
          break
        case 'bonusShoreup':
          data.state = 'Taking bonus shore up action'
          break
        case 'sandbags':
          data.state = 'Playing sandbags'
          break
        case 'heli_lift':
          data.state = 'Playing helicopter lift'
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
export default forbiddenisland
