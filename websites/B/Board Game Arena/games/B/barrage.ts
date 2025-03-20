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

const barrage: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/35.png',
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
        case 'pickStart':
        case 'freePickStart':
          data.state = 'Picking a company/officer pair and a starting contract'
          break
        case 'resolveChoice':
          data.state = 'Choosing an action'
          break
        case 'placeEngineer':
          data.state = 'Placing an engineer'
          break
        case 'construct':
          data.state = 'Constructing a structure'
          break
        case 'payResources':
          data.state = 'Paying for something'
          break
        case 'produce':
          data.state = 'Producing energy'
          break
        case 'fulfillContract':
          data.state = 'Fulfilling a contract'
          break
        case 'placeDroplet':
          data.state = 'Placing a droplet'
          break
        case 'takeContract':
          data.state = 'Taking a contract'
          break
        case 'discardContract':
          data.state = 'Discarding contracts'
          break
        case 'placeStructure':
          data.state = 'Placing a structure'
          break
        case 'confirmTurn':
        case 'confirmPartialTurn':
          data.state = 'Confirming turn'
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
export default barrage
