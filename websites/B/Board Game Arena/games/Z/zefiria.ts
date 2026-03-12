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

const zefiria: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/625.png',
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
        case 'meetingTurn':
        case 'startMeeting':
          data.state = 'Planning the game'
          break
        case 'spiritsTurn':
        case 'selTheNextSpirit':
        case 'selTheSpirit':
          data.state = 'Choosing the Spirit'
          break
        case 'placeNextSpirit':
        case 'placeSpirit':
          data.state = 'Placing the Spirit'
          break
        case 'selThePlayer':
          data.state = 'Choosing the First Player'
          break
        case 'playerTurn':
          data.state = 'Moving the Spirit'
          break
        case 'hideSpirit':
          data.state = 'Hiding the Spirit'
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
export default zefiria
