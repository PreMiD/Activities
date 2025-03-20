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

const mascarade: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/337.png',
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
        case 'showCards':
          data.state = 'Waiting for other players'
          break
        case 'playerMainTurn':
          data.state = 'Taking an action'
          break
        case 'claimOrDoNotClaim':
          data.state = 'Claiming a role'
          break
        case 'powerOfTricksterRichestTie':
          data.state = 'Choosing a player to tax'
          break
        case 'powerOfFool':
          data.state = 'Exchanging cards'
          break
        case 'powerOfSpySwap':
        case 'powerOfSorceress':
          data.state = 'Choosing a card to swap'
          break
        case 'powerOfSpyLook':
          data.state = 'Choosing a card to look at'
          break
        case 'powerOfGuru':
          data.state = 'Choosing a player to point at'
          break
        case 'powerOfGuruAnnouncement':
          data.state = 'Guessing their mask'
          break
        case 'powerOfPuppeteer':
          data.state = 'Choosing players to swap'
          break
        case 'powerOfPrincess':
          data.state = 'Choosing another player\'s card'
          break
        case 'powerOfGamer':
          data.state = 'Choosing coins to place in their hand'
          break
        case 'gamerGuessNbCoins':
          data.state = 'Guessing how many coins they placed in their hand'
          break
        case 'customScenarioBuild':
          data.state = 'Selecting masks to play with'
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
export default mascarade
