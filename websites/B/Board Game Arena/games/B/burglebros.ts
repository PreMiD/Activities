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

const burglebros: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/63.png',
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
        case 'randomizeWalls':
          data.state = 'Generating new walls'
          break
        case 'chooseCharacter':
          data.state = 'Choosing a character'
          break
        case 'startingTile':
          data.state = 'Choosing a starting tile'
          break
        case 'playerTurn':
          data.state = 'Taking an action'
          break
        case 'moveGuard':
          data.state = 'A Guard is moving'
          break
        case 'cardChoice':
          data.state = 'Making a card choice'
          break
        case 'tileChoice':
          data.state = 'Making a tile choice'
          break
        case 'playerChoice':
          data.state = 'Making a player choice'
          break
        case 'proposeTrade':
          data.state = 'Proposing a trade'
          break
        case 'confirmTrade':
          data.state = 'Confirming a trade'
          break
        case 'specialChoice':
          data.state = 'Making a special choice'
          break
        case 'drawToolsAndDiscard':
          data.state = 'Drawing a tool'
          break
        case 'takeCards':
          data.state = 'Taking cards'
          break
        case 'confirmRookMove':
          data.state = 'Confirming a Rook move'
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
export default burglebros
