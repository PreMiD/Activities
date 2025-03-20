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

const eightmastersrevenge: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/163.png',
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
        case 'selectFighter':
          data.state = 'Selecting a master'
          break
        case 'playerTurn':
          data.state = 'Taking an action'
          break
        case 'drawExtraCardForLater':
          data.state = 'Drawing a card for later'
          break
        case 'opponentDefend':
          data.state = 'Defending against an attack'
          break
        case 'opponentCounter':
          data.state = 'Countering an attack'
          break
        case 'opponentBlock':
          data.state = 'Blocking an attack'
          break
        case 'slideToken':
          data.state = 'Choosing a damage token'
          break
        case 'furyChooseWoundOverDamage':
        case 'woundCardEffect':
          data.state = 'Placing damage on a card'
          break
        case 'furyChooseEffect':
          data.state = 'Applying an effect'
          break
        case 'slideCardEffect':
        case 'slideFuryCardEffect':
          data.state = 'Sliding cards'
          break
        case 'trapCardEffect':
          data.state = 'Placing a trap'
          break
        case 'empowerCardEffect':
          data.state = 'Empowering a card'
          break
        case 'removeCardEffect':
          data.state = 'Removing an effect'
          break
        case 'switchCardEffect':
          data.state = 'Switching card effects'
          break
        case 'drawCardEffect':
          data.state = 'Drawing a card'
          break
        case 'copyCardEffect':
          data.state = 'Copying a card effect'
          break
        case 'putCrowTokenFuryCardEffect':
          data.state = 'Placing a crow token'
          break
        case 'revealFuryCardEffect':
          data.state = 'Revealing a card'
          break
        case 'putCardInHandFury':
          data.state = 'Removing cards from hand'
          break
        case 'masterDefeated':
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
export default eightmastersrevenge
