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

const imhotep: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/257.png',
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
        case 'pickAction':
          data.state = 'Playing an action'
          break
        case 'loadShip':
          data.state = 'Placing a stone on a ship'
          break
        case 'sailShip':
          data.state = 'Sailing a ship'
          break
        case 'sailLoadedShip':
          data.state = 'Sailing a loaded ship'
          break
        case 'unloadShip':
          data.state = 'Unloading a ship'
          break
        case 'pickMarketCard':
        case 'choseBetweenMarketCards':
          data.state = 'Picking a card from the market'
          break
        case 'pickPyramidB':
          data.state = 'Picking a pyramid to unload the stone'
          break
        case 'pickTempleBBonus':
          data.state = 'Picking a bonus'
          break
        case 'assessTemple':
          data.state = 'Assessing the temple'
          break
        case 'pickPyramidBViaEntranceCard':
          data.state = 'Picking a pyramid to place the stone'
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
export default imhotep
