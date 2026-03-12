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

const railwaysoftheworld: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/432.png',
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
        case 'buildTrack':
          data.state = 'Building track'
          break
        case 'chooseCard':
          data.state = 'Taking an operation card'
          break
        case 'urbanize':
          data.state = 'Managing a city'
          break
        case 'deliverGood':
          data.state = 'Delivering a good'
          break
        case 'bidding':
          data.state = 'Bidding for first player'
          break
        case 'westernLink':
          data.state = 'Building a Western Link'
          break
        case 'chooseRailBaron':
          data.state = 'Keeping a Rail Baron card'
          break
        case 'playerTurn':
          data.state = 'Taking an action'
          break
        case 'tradingDepot':
          data.state = 'Building a trading depot'
          break
        case 'placeMine':
          data.state = 'Placing a mine'
          break
        case 'buildFuelDepot':
          data.state = 'Building a fuel depot'
          break
        case 'maritimeConnection':
          data.state = 'Building a maritime connection'
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
export default railwaysoftheworld
