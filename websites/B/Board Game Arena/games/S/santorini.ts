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

const santorini: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/466.png',
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
        case 'playerPlaceWorker':
          data.details = 'Placing a worker'
          break
        case 'playerMove':
          data.details = 'Moving'
          break
        case 'playerBuild':
          data.details = 'Building'
          break
        case 'buildOffer':
          data.details = 'Offering powers'
          break
        case 'powersPlayerChoose':
          data.details = 'Choosing a power'
          break
        case 'playerUsePower':
          data.details = 'Using a power'
          break
        case 'chooseFirstPlayer':
          data.details = 'Choosing first player'
          break
        case 'playerPlaceSetup':
          data.state = 'Performing power setup'
          break
        case 'playerPlaceRam':
          data.state = 'Placing the Ram figure'
          break
        case 'chooseNyxNightPower':
          data.state = 'Choosing Nyx\'s night power'
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
export default santorini
