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

const mow: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/354.png',
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
          data.state = 'Taking an action'
          break
        case 'chooseDirection':
          data.state = 'Choosing a direction'
          break
        case 'swapHands':
          data.state = 'Swapping hands'
          break
        case 'playFarmer':
          data.state = 'Playing a farmer'
          break
        case 'selectOpponent':
          data.state = 'Selecting an opponent for a farmer'
          break
        case 'viewCards':
          data.state = 'Viewing opponent\'s cards'
          break
        case 'giveCard':
          data.state = 'Giving a card to an opponent'
          break
        case 'selectFliesType':
          data.state = 'Selecting flies to ignore'
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
export default mow
