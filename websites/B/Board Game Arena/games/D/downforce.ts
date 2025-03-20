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

const downforce: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/147.png',
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
        case 'auctionTurn':
        case 'playerTurn':
          data.state = 'Playing a card'
          break
        case 'prepareRace':
          data.state = 'Keeping a power'
          break
        case 'moveCar':
          data.state = 'Moving a car'
          break
        case 'chooseJokerColor':
          data.state = 'Choosing the color of the next car to move'
          break
        case 'betTurn':
          data.state = 'Placing a bet on a car'
          break
        case 'chooseColorToRemove':
          data.state = 'Choosing a color to remove from a card'
          break
        case 'chooseMovementsOrder':
          data.state = 'Inverting the movements order of the card'
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
export default downforce
