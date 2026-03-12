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

const kingoftokyo: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/285.png',
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
        case 'pickMonster':
          data.state = 'Choosing a monster'
          break
        case 'changeMimickedCard':
          data.state = 'Changing a mimicked card'
          break
        case 'throwDice':
          data.state = 'Throwing dice'
          break
        case 'changeDie':
          data.state = 'Changing dice results'
          break
        case 'psychicProbeRollDie':
          data.state = 'Rolling a die'
          break
        case 'resolveHeartDiceAction':
          data.state = 'Resolving heart dice action'
          break
        case 'cancelDamage':
          data.state = 'Reducing damage'
          break
        case 'leaveTokyo':
          data.state = 'Choosing to leave or stay in Tokyo'
          break
        case 'buyCard':
          data.state = 'Buying a card'
          break
        case 'chooseMimickedCard':
        case 'opportunistChooseMimicCard':
          data.state = 'Choosing to mimic a card'
          break
        case 'opportunistBuyCard':
          data.state = 'Buying a card as an Opportunist'
          break
        case 'sellCard':
          data.state = 'Selling a card'
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
export default kingoftokyo
