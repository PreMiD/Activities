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

const stoneage: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/523.png',
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
        case 'placeWorkers':
          data.state = 'Placing workers'
          break
        case 'useWorkers':
          data.state = 'Using workers'
          break
        case 'resourceProduction':
        case 'resourceProductionNoIncrease':
          data.state = 'Using tools to increase production'
          break
        case 'mammothTaming':
          data.state = 'Taming a mammoth'
          break
        case 'diceChoice':
          data.state = 'Choosing an item'
          break
        case 'feedWorkers':
          data.state = 'Feeding workers'
          break
        case 'insulate':
          data.state = 'Insulating a building'
          break
        case 'spendGold':
          data.state = 'Spending gold for points'
          break
        case 'buyCardFaceDown':
          data.state = 'Buying a card face down'
          break
        case 'animalRewards':
          data.state = 'Choosing a reward for fending off wild animals'
          break
        case 'mammothWinnerChoice':
          data.state = 'Choosing a reward for taming a mammoth'
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
export default stoneage
