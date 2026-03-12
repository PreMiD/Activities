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

const glow: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/211.png',
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
        case 'chooseAdventurer':
          data.state = 'Choosing an adventurer'
          break
        case 'chooseTomDice':
          data.state = 'Choosing Tom dice'
          break
        case 'recruitCompanion':
          data.state = 'Recruiting a companion'
          break
        case 'removeCompanion':
          data.state = 'Removing a companion'
          break
        case 'selectSketalDie':
        case 'selectSketalDieMulti':
          data.state = 'Selecting a sketal die'
          break
        case 'moveBlackDie':
          data.state = 'Moving the black die'
          break
        case 'rollDice':
          data.state = 'Rolling dice'
          break
        case 'resurrect':
          data.state = 'Resurrecting a companion'
          break
        case 'resolveCards':
          data.state = 'Resolving their cards'
          break
        case 'move':
          data.state = 'Moving their company'
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
export default glow
