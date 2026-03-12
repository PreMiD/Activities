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

const luxor: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/327.png',
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
        case 'assessMoveWithDie':
          data.state = 'Moving an adventurer'
          break
        case 'chooseTileToLoot':
          data.state = 'Looting a tile'
          break
        case 'chooseLootTile':
          data.state = 'Choosing a treasure tile'
          break
        case 'chooseHorusCardOrKey':
          data.state = 'Choosing a horus card or key'
          break
        case 'chooseScarabOrWildcard':
          data.state = 'Choosing a scarab or wildcard'
          break
        case 'chooseHorusCardEyes':
          data.state = 'Drawing a horus card'
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
export default luxor
