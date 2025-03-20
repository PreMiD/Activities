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

const mrjack: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/355.png',
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
        case 'pickCharacterCard':
          data.state = 'Picking a character'
          break
        case 'moveCharacterWithAbility':
          data.state = 'Using a character'
          break
        case 'moveCharacter':
          data.state = 'Moving a character'
          break
        case 'selectSourceGaslight':
        case 'selectGaslightDestination':
          data.state = 'Moving a gaslight'
          break
        case 'selectSourceCordon':
        case 'selectCordonDestination':
          data.state = 'Moving a cordon'
          break
        case 'selectSourceManhole':
        case 'selectManholeDestination':
          data.state = 'Moving a manhole'
          break
        case 'switchPlace':
          data.state = 'Switching places'
          break
        case 'moveCloser':
        case 'pickCharacterToMoveCloser':
          data.state = 'Moving closer to Sergeant Goodley'
          break
        case 'rotateWatson':
          data.state = 'Rotating Watson'
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
export default mrjack
