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

const quantum: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/423.png',
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
        case 'firstConstruct':
          data.state = 'Placing the first cube'
          break
        case 'firstDeploy':
        case 'firstDeployDest':
        case 'firstDeployShip':
          data.state = 'Deploying the first ship'
          break
        case 'firstRepositionShip':
        case 'firstRepositionDest':
          data.state = 'Repositioning the first ship'
          break
        case 'chooseAction':
          data.state = 'Choosing an action'
          break
        case 'chooseShipAction':
          data.state = 'Choosing an action for a ship'
          break
        case 'reconfigure':
          data.state = 'Reconfiguring a ship'
          break
        case 'deployShip':
        case 'deployDest':
          data.state = 'Deploying a ship'
          break
        case 'moveShip':
        case 'moveDest':
          data.state = 'Moving a ship'
          break
        case 'multipleTargetShip':
          data.state = 'Choosing a ship to attack'
          break
        case 'allowDangerous':
          data.state = 'Choosing to be Dangerous'
          break
        case 'allowCruel':
          data.state = 'Choosing to be Cruel'
          break
        case 'attackEndPosition':
          data.state = 'Choosing where to end the attacking ship move'
          break
        case 'construct':
          data.state = 'Constructing on a planet'
          break
        case 'ability':
          data.state = 'Using a ship ability'
          break
        case 'strikeDest':
          data.state = 'Choosing where to strike'
          break
        case 'transportInShip':
          data.state = 'Choosing which ship to transport'
          break
        case 'transportOut':
          data.state = 'Choosing where to unload the transported ship'
          break
        case 'warpDest':
          data.state = 'Choosing which ship to warp to'
          break
        case 'warpOrTransport':
          data.state = 'Choosing whether to transport or warp'
          break
        case 'modifyInto':
          data.state = 'Choosing what type of ship to modify'
          break
        case 'infamy':
          data.state = 'Choosing where to place a quantum cube'
          break
        case 'chooseCard':
          data.state = 'Choosing a card'
          break
        case 'replaceCommand':
          data.state = 'Replacing a command'
          break
        case 'deployExpansion':
          data.state = 'Deploying an expansion ship'
          break
        case 'reorganizeShip':
          data.state = 'Reorganizing a ship'
          break
        case 'reorganizeDeploy':
          data.state = 'Deploying a reorganized ship'
          break
        case 'repositionCube':
        case 'repositionDest':
          data.state = 'Repositioning a cube'
          break
        case 'sabotage':
          data.state = 'Choosing a card to discard'
          break
        case 'chooseReconfigure':
          data.state = 'Choosing a new ship type'
          break
        case 'rerollReconfigure':
          data.state = 'Choosing whether to reconfigure again'
          break
        case 'useFlexibleShip':
        case 'useFlexibleInto':
          data.state = 'Choosing a ship to add or remove 1'
          break
        case 'useResourcefulShip':
          data.state = 'Choosing a ship to sacrifice'
          break
        case 'useNomadicShip':
          data.state = 'Choosing a ship to move'
          break
        case 'useNomadicDest':
          data.state = 'Choosing where to move the ship'
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
export default quantum
