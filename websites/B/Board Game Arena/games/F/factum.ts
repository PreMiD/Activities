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

const factum: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/176.png',
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
        case 'pickStoryTeller':
          data.state = 'Picking a story teller'
          break
        case 'startStory':
        case 'tellStory':
          data.state = 'Telling a story'
          break
        case 'chooseGuesser':
          data.state = 'Choosing a guesser'
          break
        case 'addCards':
          data.state = 'Adding cards'
          break
        case 'guessing':
        case 'confirmGuessing':
        case 'guessingMultiple':
        case 'confirmGuessingMultiple':
          data.state = 'Guessing the story'
          break
        case 'storyMaster':
          data.state = 'Choosing the best story'
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
export default factum
