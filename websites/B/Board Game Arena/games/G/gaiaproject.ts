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

const gaiaproject: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/199.png',
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
        case 'stateSetupRotate':
          data.state = 'Rotating map tiles'
          break
        case 'stateSetupChooseRace':
          data.state = 'Choosing a faction'
          break
        case 'stateSetupPlaceMine':
          data.state = 'Placing a mine'
          break
        case 'stateSetupPlacePI':
          data.state = 'Placing a planetary institute'
          break
        case 'stateSetupChooseBooster':
          data.state = 'Choosing a booster tile'
          break
        case 'stateSetupChooseAutoma':
          data.state = 'Making automa selections'
          break
        case 'statePlayerTurn':
          data.state = 'Taking an action'
          break
        case 'stateConvert':
          data.state = 'Performing conversions'
          break
        case 'stateGainTech':
          data.state = 'Gaining a technology'
          break
        case 'stateResearchAdv':
        case 'stateGaiaRace14':
          data.state = 'Researching'
          break
        case 'statePlaceLost':
          data.state = 'Placing the lost planet'
          break
        case 'stateChargePwr':
          data.state = 'Charging power'
          break
        case 'stateIncomeChoice':
          data.state = 'Collecting income'
          break
        case 'stateGaiaRace1':
          data.state = 'Converting Gaia power'
          break
        case 'stateSetupBanRace':
          data.state = 'Banning a faction'
          break
        case 'stateSetupAddDraft':
          data.state = 'Choosing a faction to add to the draft pool'
          break
        case 'stateSetupDraft':
          data.state = 'Bidding on factions'
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
export default gaiaproject
