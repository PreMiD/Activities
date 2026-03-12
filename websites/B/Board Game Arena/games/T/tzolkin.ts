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

const tzolkin: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/592.png',
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
        case 'chooseWealthTiles':
          data.state = 'Choosing wealth tiles'
          break
        case 'playerTurn':
          data.state = 'Placing or picking up a worker'
          break
        case 'placeWorker':
          data.state = 'Placing a worker'
          break
        case 'pickUpWorker':
          data.state = 'Picking up a worker'
          break
        case 'harvest':
          data.state = 'Harvesting corn or wood'
          break
        case 'technologyUpgrade':
          data.state = 'Upgrading a technology'
          break
        case 'construct':
          data.state = 'Constructing a building'
          break
        case 'constructChooseSparedResources':
          data.state = 'Choosing a non required resource'
          break
        case 'tikal4':
          data.state = 'Constructing two buildings or a monument'
          break
        case 'tikal5':
          data.state = 'Climbing up two temples'
          break
        case 'technologyUpgradeFree':
          data.state = 'Upgrading a technology for free'
          break
        case 'trade':
          data.state = 'Exchanging corn and resources'
          break
        case 'uxmal4':
          data.state = 'Constructing a building with corn'
          break
        case 'anyAction':
          data.state = 'Performing an action on a gear'
          break
        case 'resourceReward':
          data.state = 'Receiving a resource'
          break
        case 'templeReward':
          data.state = 'Climbing up a temple'
          break
        case 'freeTechnology':
          data.state = 'Advancing one level in any technology for free'
          break
        case 'constructWithoutArchitecture':
          data.state = 'Constructing a building without architecture bonuses'
          break
        case 'theology2':
          data.state = 'Climbing up a temple for a resource'
          break
        case 'turnWheel':
          data.state = 'Choosing to advance the calendar 2 days'
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
export default tzolkin
