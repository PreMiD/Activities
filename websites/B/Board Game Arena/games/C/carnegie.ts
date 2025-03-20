// TODO
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

const carnegie: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/77.png',
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
        case 'playerInitialHousing':
          data.state = 'Building a housing project'
          break
        case 'playerInitialMovement':
          data.state = 'Making initial movement'
          break
        case 'playerSelectAction':
          data.state = 'Choosing an action'
          break
        case 'playerEvent':
          data.state = 'Collecting income'
          break
        case 'playerHumanResources':
          data.state = 'Using Human Resources Departments'
          break
        case 'playerManagement':
          data.state = 'Using Management Departments'
          break
        case 'playerConstruction':
          data.state = 'Using Construction Departments'
          break
        case 'playerRND':
          data.state = 'Using Research and Development Departments'
          break
        case 'multiActivateWorkers':
        case 'playerActivateWorkers':
          data.state = 'Activating workers'
          break
        case 'processWelfareDonation':
          data.state = 'Making Welfare donations'
          break
        case 'playerChooseTabs':
          data.state = 'Choosing project tabs'
          break
        case 'playerReserveDepartment':
          data.state = 'Reserving a department'
          break
        case 'playerReplaceDonation':
          data.state = 'Replacing a donation tile'
          break
        case 'multiSecretDonation':
          data.state = 'Choosing a secret donation'
          break
        case 'playerConfirmSetup':
          data.state = 'Confirming setup'
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
export default carnegie
