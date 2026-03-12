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

const kingsguild: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/286.png',
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
        case 'playerGuildTurn':
          data.state = 'Choosing a guild bonus'
          break
        case 'playerTurn':
          data.state = 'Taking an action'
          break
        case 'playerGather':
          data.state = 'Gathering resources'
          break
        case 'playerExpand':
          data.state = 'Expanding a room or hiring a specialist'
          break
        case 'playerCraft':
          data.state = 'Crafting an item'
          break
        case 'playerBuildRoomOnly':
          data.state = 'Building a room'
          break
        case 'playerHireSpecialistOnly':
          data.state = 'Hiring a specialist'
          break
        case 'playerReplaceBonusResource':
          data.state = 'Replacing a resource'
          break
        case 'playerSpecialistOneTimeAction':
        case 'playerSpecialistCraftAction':
          data.state = 'Using a specialist ability'
          break
        case 'playerSelectTreasureCard':
          data.state = 'Selecting treasure cards'
          break
        case 'playerSellTreasure':
          data.state = 'Selling or discarding treasure cards'
          break
        case 'playerPlayTreasureEffect':
          data.state = 'Resolving treasure card effect'
          break
        case 'kingsFuneralBidding':
          data.state = 'Bidding on the King\'s Statue'
          break
        case 'playerPlaceKingStatue':
          data.state = 'Placing the King\'s Statue'
          break
        case 'playerEndTurn':
          data.state = 'Playing treasure cards'
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
export default kingsguild
