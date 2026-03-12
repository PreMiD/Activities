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

const streets: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/525.png',
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
        case 'stateSetupGrifter':
          data.state = 'Selecting a character'
          break
        case 'stateAbandon':
          data.state = 'Abandoning a building'
          break
        case 'statePlaceTile':
          data.state = 'Placing a building'
          break
        case 'stateScoreStreet':
          data.state = 'Selecting a street to score'
          break
        case 'stateBusinessGain':
          data.state = 'Selecting a business token'
          break
        case 'stateGrifterBusinessGain':
          data.state = 'Selecting a business token for the Grifter'
          break
        case 'stateEntrepreneurScore':
          data.state = 'Selecting a building for the Entrepreneur ability'
          break
        case 'stateMovePeople':
          data.state = 'Moving people'
          break
        case 'stateGrifterPlaceTile':
          data.state = 'Placing a building for the Grifter'
          break
        case 'stateGrifterMovePeople':
          data.state = 'Moving people for the Grifter'
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
export default streets
