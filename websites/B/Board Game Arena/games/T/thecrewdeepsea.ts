import type { GamePresence } from '..'
import {
  getActivePlayerId,
  getCurrentGameState,
  getCurrentGameStateType,
  getPlayerAvatar,
  getPlayerData,
  getPlayerScore,
  getUserPlayerId,
} from '../../util'

const thecrewdeepsea: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/546.png',
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
        case 'playerTurn':
          data.state = 'Playing a card'
          break
        case 'pickTask':
          data.state = 'Choosing a task'
          break
        case 'optionTask':
          data.state = 'Choosing a prediction for the task'
          break
        case 'endMission':
          data.state = 'Ending mission'
          break
        case 'comm':
          data.state = 'Communicating'
          break
        case 'distressSetup':
          data.state = 'Using the distress signal'
          break
        case 'distress':
          data.state = 'Choosing a card to pass'
          break
        case 'question':
          data.state = 'Answering a question'
          break
        case 'pickCrew':
          data.state = 'Choosing a crew member'
          break
        case 'freeAllocation':
        case 'freeAllocationPropose':
        case 'freeAllocationAccept':
          data.state = 'Choosing a task bundle'
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
export default thecrewdeepsea
