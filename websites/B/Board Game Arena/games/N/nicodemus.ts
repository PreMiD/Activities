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

const nicodemus: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/367.png',
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
          data.state = 'Playing or repairing a machine'
          break
        case 'choosePlayAction':
          data.state = 'Choosing an action for played card'
          break
        case 'selectResource':
          data.state = 'Choosing a resource'
          break
        case 'selectExchange':
          data.state = 'Exchanging resources'
          break
        case 'selectMachine':
          data.state = 'Choosing a machine'
          break
        case 'selectProject':
          data.state = 'Choosing a project'
          break
        case 'chooseProject':
          data.state = 'Choosing a completed project'
          break
        case 'chooseProjectDiscardedMachine':
          data.state = 'Choosing machines to discard'
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
export default nicodemus
