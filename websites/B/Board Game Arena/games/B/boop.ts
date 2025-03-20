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

const boop: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/57.png',
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
        case 'playerTurnFigureSelection':
          data.state = 'Playing a Kitten or Cat'
          break
        case 'playerTurnKitten':
          data.state = 'Playing a Kitten'
          break
        case 'playerTurnCat':
          data.state = 'Playing a Cat'
          break
        case 'figuresToUpgradeSelection':
          data.state = 'Selecting 3 Kittens/Cats to graduate'
          break
        case 'singleFigureToUpgradeSelection':
          data.state = 'Selecting 1 Kitten/Cat to graduate'
          break
        case 'confirmTurn':
          data.state = 'Confirming turn'
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
export default boop
