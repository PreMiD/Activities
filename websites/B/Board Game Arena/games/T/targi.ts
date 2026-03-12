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

const targi: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/536.png',
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
        case 'playerTurn':
          data.state = 'Placing a Targi'
          break
        case 'playAction':
          data.state = 'Taking an action'
          break
        case 'placeCard':
          data.state = 'Placing a Tribe card'
          break
        case 'showWareCard':
          data.state = 'Taking a Goods card from the Caravan'
          break
        case 'moveTribu_1':
        case 'moveTribu_2':
          data.state = 'Moving a Tribe marker'
          break
        case 'tradeForWaresGold':
          data.state = 'Trading goods for gold or other goods'
          break
        case 'tradeForPoints':
          data.state = 'Trading goods or gold for victory points'
          break
        case 'endOfTurnLimitResources':
          data.state = 'Discarding excess goods and gold'
          break
        case 'raid':
          data.state = 'Choosing what to lose during the raid'
          break
        case 'chooseTribe':
          data.state = 'Choosing what to do with a tribe card'
          break
        case 'chooseWare':
          data.state = 'Choosing which goods to get'
          break
        case 'chooseGoldWaresVP':
          data.state = 'Choosing to get goods, gold, or victory points'
          break
        case 'swapTribesPhase1':
        case 'swapTribesPhase2':
          data.state = 'Choosing a Tribe card to swap position with another'
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
export default targi
