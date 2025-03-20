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

const painttheroses: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/395.png',
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
        case 'drawWhim':
          data.state = 'Drawing a Whim card'
          break
        case 'placeTile':
          data.state = 'Placing a tile'
          break
        case 'suggestWhimToGuess':
        case 'selectWhimToGuess':
          data.state = 'Selecting a Whim card to guess'
          break
        case 'suggestGuessWhim':
          data.state = 'Suggesting a guess for a Whim card'
          break
        case 'guessWhim':
          data.state = 'Guessing a Whim card'
          break
        case 'suggestModuleCards':
        case 'selectModuleCards':
          data.state = 'Selecting a Queen card and a Helper card to keep'
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
export default painttheroses
