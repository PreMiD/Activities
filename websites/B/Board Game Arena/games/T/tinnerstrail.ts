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

const tinnerstrail: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/566.png',
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
        case 'InitialSetup':
          data.state = 'Selecting initial Survey Cards'
          break
        case 'ActionPhase':
          data.state = 'Taking an action'
          break
        case 'BuildMine':
          data.state = 'Placing a bid'
          break
        case 'ExtractOre':
          data.state = 'Extracting ore'
          break
        case 'DevelopmentActions':
          data.state = 'Performing a development action'
          break
        case 'SellInvest':
          data.state = 'Investing'
          break
        case 'EndTurn':
          data.state = 'Looking at a face down area tile'
          break
        case 'PlaySurveyCard':
          data.state = 'Playing a Survey Card'
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
export default tinnerstrail
