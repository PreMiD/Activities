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

const libertalia: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/307.png',
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
        case 'chooseCard':
        case 'parrot':
          data.state = 'Playing a card'
          break
        case 'chooseBooty':
          data.state = 'Choosing a booty'
          break
        case 'bootySaber':
          data.state = 'Discarding a character from another player'
          break
        case 'recruiter':
          data.state = 'Taking back a character'
          break
        case 'preacher':
          data.state = 'Keeping booty'
          break
        case 'gunner':
          data.state = 'Discarding a character'
          break
        case 'merchant':
          data.state = 'Discarding booty tiles'
          break
        case 'waitress':
          data.state = 'Discarding a treasure map'
          break
        case 'surgeon':
          data.state = 'Taking a character back from their cemetary'
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
export default libertalia
