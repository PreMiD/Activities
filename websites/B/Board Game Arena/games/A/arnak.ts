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

const arnak: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/18.png',
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
        case 'selectAction':
          data.state = 'Selecting an action'
          break
        case 'afterMain':
          data.state = 'Playing free actions'
          break
        case 'evalPlane':
          data.state = 'Gaining free items'
          break
        case 'mustDiscard':
        case 'mayDiscard':
        case 'mustDiscardFree':
          data.state = 'Discarding a card'
          break
        case 'idolUpgrade':
          data.state = 'Upgrading a card'
          break
        case 'mayExile':
        case 'idolExile':
          data.state = 'Exiling a card'
          break
        case 'idolRefresh':
          data.state = 'Refreshing an assistant'
          break
        case 'researchBonus':
          data.state = 'Evaluating research bonuses'
          break
        case 'mustTravel':
        case 'mayTravel':
          data.state = 'Traveling to a site'
          break
        case 'buyArt':
          data.state = 'Buying an artifact'
          break
        case 'artWaitArgs':
          data.state = 'Evaluting artifact effects'
          break
        case 'buyItem':
          data.state = 'Buying an item'
          break
        case 'artSelectAss':
          data.state = 'Selecting an assistant'
          break
        case 'artEarringSelectKeep':
          data.state = 'Keeping an earring'
          break
        case 'artEarringSelectTopdeck':
          data.state = 'Returning an earring to the top of the deck'
          break
        case 'artSelectDiscard':
          data.state = 'Selecting an item from the exile pile'
          break
        case 'decideKeep':
          data.state = 'Deciding whether to keep cards'
          break
        case 'artActivateAss':
          data.state = 'Activating an assistant'
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
export default arnak
