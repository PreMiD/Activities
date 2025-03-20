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

const gearnpiston: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/203.png',
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
        case 'chooseAction':
          data.state = 'Placing a token'
          break
        case 'discardPart':
          data.state = 'Discarding a blueprint'
          break
        case 'chooseBackAlleyAction':
          data.state = 'Choosing a Back Alley action'
          break
        case 'pickBlackMarketPart':
          data.state = 'Picking a New Part tile from the Black Market'
          break
        case 'topOrBottom':
          data.state = 'Putting New Part tiles back on the New Part stack'
          break
        case 'choosePlayer':
          data.state = 'Taking a Blueprint from another player'
          break
        case 'pickPlayerPart':
          data.state = 'Picking a Blueprint'
          break
        case 'chooseToken':
        case 'tokenDestination':
          data.state = 'Moving a token'
          break
        case 'pickNewPart':
          data.state = 'Picking a New Part tile'
          break
        case 'workshop':
          data.state = 'Performing actions at the workshop'
          break
        case 'assembling':
          data.state = 'Assembling their automobile'
          break
        case 'scrap':
          data.state = 'Adding Scrap Part tiles'
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
export default gearnpiston
