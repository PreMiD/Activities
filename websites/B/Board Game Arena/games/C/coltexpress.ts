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

const coltexpress: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/110.png',
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
        case 'randomGangsters':
          data.state = 'Setup: Randomizing gangsters'
          break
        case 'chooseGangsters':
          data.state = 'Choosing a character'
          break
        case 'playCard':
          data.state = 'Playing a card'
          break
        case 'chooseCar':
          data.state = 'Moving their character'
          break
        case 'chooseCarMarshal':
          data.state = 'Choosing where the Marshal moves'
          break
        case 'chooseTargetShoot':
          data.state = 'Choosing a target to shoot'
          break
        case 'chooseLoot':
          data.state = 'Choosing which loot to take'
          break
        case 'chooseTargetPunch':
          data.state = 'Choosing who to punch'
          break
        case 'discard':
          data.state = 'Choosing which cards to discard'
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
export default coltexpress
