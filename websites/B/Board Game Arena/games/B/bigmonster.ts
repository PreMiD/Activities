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

const bigmonster: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/43.png',
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
        case 'teamSelection':
          data.state = 'Choosing a team'
          break
        case 'explorerSelection':
          data.state = 'Selecting an explorer'
          break
        case 'tileSelection':
          data.state = 'Selecting a tile'
          break
        case 'var_placeTile':
        case 'placeTile':
          data.state = 'Placing a tile'
          break
        case 'bmExploTileSelection':
          data.state = 'Selecting a tile from the discard pile'
          break
        case 'bmExploTilePlacement':
          data.state = 'Placing a tile from the discard pile'
          break
        case 'var_tileSelection':
          data.state = 'Selecting a tile to play/discard'
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
export default bigmonster
