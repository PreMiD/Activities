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

const vektorace: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/602.png',
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
        case 'firstPlayerPositioning':
        case 'flyingStartPositioning':
          data.state = 'Choosing starting position'
          break
        case 'tokenAmountChoice':
          data.state = 'Choosing starting tokens'
          break
        case 'greenLight':
          data.state = 'Choosing starting gear vector'
          break
        case 'gearVectorPlacement':
          data.state = 'Placing gear vector'
          break
        case 'boostPrompt':
          data.state = 'Choosing boost'
          break
        case 'boostVectorPlacement':
          data.state = 'Using boost'
          break
        case 'carPlacement':
          data.state = 'Placing car'
          break
        case 'pitStop':
          data.state = 'Refilling tokens'
          break
        case 'attackManeuvers':
          data.state = 'Performing attack maneuvers'
          break
        case 'boxBoxPromt':
          data.state = 'Calling BoxBox'
          break
        case 'futureGearDeclaration':
          data.state = 'Declaring future gear'
          break
        case 'emergencyBrake':
          data.state = 'Rotating car after emergency brake'
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
export default vektorace
