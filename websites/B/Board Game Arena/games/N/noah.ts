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

const noah: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/373.png',
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
        case 'loadAnimal':
          data.state = 'Loading an animal'
          break
        case 'chooseGender':
          data.state = 'Choosing gender'
          break
        case 'chooseOpponent':
          data.state = 'Choosing opponent for an action'
          break
        case 'viewCards':
          data.state = 'Viewing opponent cards'
          break
        case 'giveCard':
          data.state = 'Giving a card to an opponent'
          break
        case 'chooseWeight':
          data.state = 'Choosing weight'
          break
        case 'reorderTopDeck':
          data.state = 'Reordering top deck cards'
          break
        case 'replaceOnTopDeck':
          data.state = 'Replacing a card on top of the deck'
          break
        case 'moveNoah':
          data.state = 'Moving Noah'
          break
        case 'optimalLoadingGiveCards':
          data.state = 'Giving cards to opponents'
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
export default noah
