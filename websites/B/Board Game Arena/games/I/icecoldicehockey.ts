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

const icecoldicehockey: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/255.png',
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
        case 'playerTurnCI':
        case 'playerTurnDZ':
        case 'playerTurnOZ':
          data.state = 'Taking an action'
          break
        case 'playerDefense':
          data.state = 'Playing a defense card'
          break
        case 'playerMomentum':
          data.state = 'Drawing an extra card'
          break
        case 'playerTouchUp':
          data.state = 'Touching up with the goalie'
          break
        case 'playerMayDiscard':
        case 'playerMustDiscard':
        case 'playerMustDiscardGoalie':
          data.state = 'Discarding a card'
          break
        case 'playerTakeShot':
          data.state = 'Taking a shot'
          break
        case 'prepareForPowerPlay':
          data.state = 'Preparing for a power play'
          break
        case 'pullDecision':
          data.state = 'Pulling the goalie'
          break
        case 'putBackDecision':
          data.state = 'Putting back the goalie'
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
export default icecoldicehockey
