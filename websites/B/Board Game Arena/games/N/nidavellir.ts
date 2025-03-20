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

const nidavellir: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/368.png',
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
        case 'playerBids':
          data.state = 'Bidding for taverns'
          break
        case 'ulineBid':
          data.state = 'Bidding (Uline\'s power)'
          break
        case 'recruitDwarf':
          data.state = 'Recruiting a dwarf'
          break
        case 'recruitHero':
          data.state = 'Recruiting a hero'
          break
        case 'transformCoin':
          data.state = 'Transforming a coin'
          break
        case 'discardTavernCard':
        case 'discardCard':
          data.state = 'Discarding a card'
          break
        case 'distinctionExplorer':
          data.state = 'Choosing a card (Explorer\'s power)'
          break
        case 'ulineTradeCoin':
          data.state = 'Trading coins (Uline\'s power)'
          break
        case 'chooseThrudColumn':
        case 'chooseYludColumn':
          data.state = 'Placing Thrud'
          break
        case 'recruitCamp':
          data.state = 'Recruiting a mercenary or an artifact (Holda\'s effect)'
          break
        case 'enlistMercenary':
        case 'chooseEnlistOrder':
          data.state = 'Enlisting a mercenary'
          break
        case 'vidofnirTransforms':
          data.state = 'Choosing transformations (Vidofnir and Vedrfölnir\'s effect)'
          break
        case 'pickDiscardAndumia':
          data.state = 'Picking a card in the discard (Andumia\'s effect)'
          break
        case 'placeOlwynDouble':
          data.state = 'Placing Olwyn\'s double'
          break
        case 'discardHofud':
          data.state = 'Discarding a card (Hofud\'s effect)'
          break
        case 'brisingamens':
          data.state = 'Picking a card in the discard (Brisingamens\'s effect)'
          break
        case 'khradTransform':
          data.state = 'Choosing a coin to upgrade (Khrad\'s effect)'
          break
        case 'brisingamensDiscard':
          data.state = 'Discarding a card (Brisingamens\'s effect)'
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
export default nidavellir
