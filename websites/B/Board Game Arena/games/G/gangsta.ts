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

const gangsta: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/201.png',
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
        case 'playerMobilize':
          data.state = 'Mobilizing gangsters'
          break
        case 'playerAction':
          data.state = 'Performing an action'
          break
        case 'discard':
          data.state = 'Discarding a card'
          break
        case 'snitch':
          data.state = 'Dealing with the snitch'
          break
        case 'rewardRecruit':
          data.state = 'Recruiting a gangster'
          break
        case 'rewardSteal':
          data.state = 'Stealing from a rival gang'
          break
        case 'rewardTap':
          data.state = 'Using rival gangsters'
          break
        case 'markForKill':
          data.state = 'Marking a rival gang for assassination'
          break
        case 'rewardSkill':
          data.state = 'Teaching a skill to a gangster'
          break
        case 'rewardKill':
          data.state = 'Choosing a gangster to kill'
          break
        case 'gdgMulti':
          data.state = 'Choosing a gangster'
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
export default gangsta
