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

const greatwesterntrail: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/221.png',
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
        case 'firstPhaseA':
          data.state = 'Selecting trail start'
          break
        case 'phaseA':
        case 'move':
          data.state = 'Moving'
          break
        case 'phaseB':
          data.state = 'Playing actions'
          break
        case 'phaseC':
          data.state = 'Drawing cards'
          break
        case 'bidOrder':
          data.state = 'Bidding for turn order'
          break
        case 'kansas1':
          data.state = 'Placing a Foresight 1 tile on the board'
          break
        case 'kansas2':
          data.state = 'Placing a Foresight 2 tile on the board'
          break
        case 'kansas3':
          data.state = 'Placing a Foresight 3 tile on the board'
          break
        case 'kansas4':
          data.state = 'Adding certificates to increase the breeding value'
          break
        case 'kansas5':
          data.state = 'Selecting a delivery city'
          break
        case 'kansasEnd':
          data.state = 'Ending their turn'
          break
        case 'cowMarket':
          data.state = 'Buying from the cattle market'
          break
        case 'build':
          data.state = 'Building a building'
          break
        case 'hire':
          data.state = 'Hiring a worker'
          break
        case 'pickObjective':
          data.state = 'Picking an objective'
          break
        case 'discard':
          data.state = 'Discarding cards'
          break
        case 'cogs':
          data.state = 'Playing an auxiliary action'
          break
        case 'upgradeStation':
          data.state = 'Upgrading a station'
          break
        case 'train':
          data.state = 'Moving a train'
          break
        case 'stationMaster':
          data.state = 'Assigning a station master'
          break
        case 'hazardTeepee':
          data.state = 'Choosing a hazard or teepee'
          break
        case 'hazard':
          data.state = 'Choosing a hazard'
          break
        case 'teepee':
          data.state = 'Choosing a teepee'
          break
        case 'branchlet':
          data.state = 'Placing a branchlet'
          break
        case 'remove':
          data.state = 'Removing cards from their hand'
          break
        case 'cowThreeOrFiveCoins':
          data.state = 'Gaining a reward'
          break
        case 'newyorkcity':
          data.state = 'Choosing a station master from New York City'
          break
        case 'kansasSimmental':
          data.state = 'Growing Simmental cards'
          break
        case 'extraAction':
          data.state = 'Performing an extra action'
          break
        case 'selectObjectives':
          data.state = 'Selecting objectives'
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
export default greatwesterntrail
