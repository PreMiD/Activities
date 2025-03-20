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

const bigtimesoccer: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/44.png',
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
        case 'playerTurnOff':
          data.state = 'Taking an offensive action'
          break
        case 'playerTurnDef':
          data.state = 'Playing a defense card'
          break
        case 'playerClear':
          data.state = 'Selecting a zone to clear'
          break
        case 'playerSelect':
          data.state = 'Selecting a zone'
          break
        case 'playerGoalkick':
          data.state = 'Taking a goal kick'
          break
        case 'playerFreekick':
          data.state = 'Taking a free kick'
          break
        case 'playerFreeShot':
          data.state = 'Taking a free shot'
          break
        case 'playerReplyProposal':
          data.state = 'Deciding whether to end the half'
          break
        case 'playerCard72':
          data.state = 'Deciding how to play a card'
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
export default bigtimesoccer
