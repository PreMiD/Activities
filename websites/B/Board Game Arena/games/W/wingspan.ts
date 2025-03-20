import type { GamePresence } from '../index.js'
import {
  getActivePlayerId,
  getCurrentGameState,
  getPlayerAvatar,
  getPlayerData,
  getPlayerScore,
  getUserPlayerId,
} from '../../util.js'

const wingspan: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/615.png',
  async getData(presence: Presence) {
    const gameState = await getCurrentGameState(presence)
    const activePlayer = await getActivePlayerId(presence)
    const userPlayer = await getUserPlayerId(presence)
    const activePlayerData = await getPlayerData(presence, activePlayer)
    const data: PresenceData = {
      smallImageKey: getPlayerAvatar(userPlayer),
      smallImageText: `Score: ${getPlayerScore(userPlayer)}`,
    }
    if (activePlayer === userPlayer) {
      switch (gameState) {
        case 'gameSetup':
          data.state = 'Loading'
          break
        case 'playerInitialDiscard':
          data.state = 'Selecting initial birds'
          break
        case 'playerNormalTurn':
          data.state = 'Choosing an action'
          break
        case 'playerDrawBirds':
          data.state = 'Drawing birds'
          break
        case 'playerPowerWhite':
        case 'playerPowerBrown':
        case 'playerPowerPink':
        case 'playerPowerAllPlayers':
        case 'processActionEffect':
        case 'processPowerEffectWhite':
        case 'processPowerEffectBrown':
        case 'processPowerEffectPink':
          data.state = 'Activating a power'
          break
        case 'playerGainFromFeeder':
          data.state = 'Gaining food from the bird feeder'
          break
        case 'playerDiscardBird':
          data.state = 'Discarding a bird'
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

export default wingspan
