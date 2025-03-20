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

const chocolatefactory: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/95.png',
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
        case 'expandRecruit':
          data.state = 'Expanding and/or recruiting'
          break
        case 'runFactory':
        case 'simultaneousRunFactory':
          data.state = 'Running a factory shift'
          break
        case 'fulfilOrders':
        case 'simultaneousFulfilOrders':
          data.state = 'Fulfilling orders'
          break
        case 'cleanupEmployee':
          data.state = 'Using Department Store Agent'
          break
        case 'cleanupPickOrders':
          data.state = 'Replacing completed corner shop orders'
          break
        case 'cleanupDiscardChocolate':
          data.state = 'Discarding chocolate'
          break
        case 'gameoverSolo':
        case 'gameover':
          data.state = 'Game over'
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
export default chocolatefactory
