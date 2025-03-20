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

const quetzal: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/426.png',
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
        case 'rerollMeeples':
          data.state = 'Rerolling meeples'
          break
        case 'placeMeepleWithLocation':
        case 'placeMeeple':
        case 'chooseMeepleType':
          data.state = 'Placing meeples'
          break
        case 'campAction':
          data.state = 'Choosing meeple to roll'
          break
        case 'pickArtifactFromTemple':
          data.state = 'Picking an artifact from temple'
          break
        case 'selectOneCard':
          data.state = 'Keeping a card'
          break
        case 'pickCardToSell':
          data.state = 'Sell an artifact'
          break
        case 'pickUpgradeTile':
          data.state = 'Picking an upgrade tile'
          break
        case 'deliverArtifactsToOffice':
          data.state = 'Delivering artifacts to office'
          break
        case 'deliverArtifactsToShips':
          data.state = 'Delivering artifacts to ships'
          break
        case 'decideUpgradeToDiscard':
          data.state = 'Deciding which upgrade to discard'
          break
        case 'exchangeBeforeEnd':
          data.state = 'Exchanging coins'
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
export default quetzal
