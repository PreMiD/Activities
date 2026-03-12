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

const sevenwondersduel: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/484.png',
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
        case 'gameEnd':
          data.state = 'Viewing game results'
          break
        case 'selectWonder':
          data.state = 'Selecting a wonder'
          break
        case 'nextAge':
          data.state = 'Preparing next age'
          break
        case 'selectStartPlayer':
          data.state = 'Selecting the start player'
          break
        case 'playerTurn':
          data.state = 'Choosing an action'
          break
        case 'conspire':
        case 'chooseConspireRemnantPosition':
        case 'chooseConspiratorAction':
          data.state = 'Conspiring'
          break
        case 'senateActions':
          data.state = 'Choosing a senate action'
          break
        case 'placeInfluence':
          data.state = 'Adding influence to the Senate'
          break
        case 'moveInfluence':
          data.state = 'Moving influence in the Senate'
          break
        case 'removeInfluence':
          data.state = 'Removing influence from the Senate'
          break
        case 'triggerUnpreparedConspiracy':
          data.state = 'Triggering an unprepared conspiracy'
          break
        case 'constructLastRowBuilding':
        case 'constructBuildingFromBox':
          data.state = 'Building a building'
          break
        case 'destroyConstructedWonder':
          data.state = 'Destroying a constructed wonder'
          break
        case 'lockProgressToken':
          data.state = 'Locking a progress token'
          break
        case 'moveDecree':
          data.state = 'Moving a decree'
          break
        case 'chooseProgressToken':
          data.state = 'Choosing a progress token'
          break
        case 'swapBuilding':
          data.state = 'Swapping a building with another player'
          break
        case 'takeBuilding':
          data.state = 'Taking a building from another player'
          break
        case 'takeUnconstructedWonder':
          data.state = 'Taking an unconstructed wonder from another player'
          break
        case 'chooseAndPlaceDivinity':
          data.state = 'Choosing and placing a Divinity'
          break
        case 'deconstructWonder':
          data.state = 'Deconstructing a wonder'
          break
        case 'constructWonderWithDiscardedBuilding':
          data.state = 'Constructing a wonder with a discarded building'
          break
        case 'chooseEnkiProgressToken':
          data.state = 'Choosing an Enki progress token'
          break
        case 'placeSnakeToken':
          data.state = 'Placing a snake token'
          break
        case 'discardAgeCard':
          data.state = 'Discarding an age card'
          break
        case 'placeMinervaToken':
          data.state = 'Placing a Minerva token'
          break
        case 'discardMilitaryToken':
          data.state = 'Discarding a military token'
          break
        case 'applyMilitaryToken':
          data.state = 'Applying a military token'
          break
        case 'chooseDivinityDeck':
        case 'chooseDivinityFromTopCards':
          data.state = 'Choosing a Divinity card'
          break
        case 'chooseOpponentBuilding':
          data.state = 'Choosing an opponent\'s building to discard'
          break
        case 'chooseProgressTokenFromBox':
          data.state = 'Choosing a progress token from the box'
          break
        case 'chooseDiscardedBuilding':
          data.state = 'Choosing a discarded building to build'
          break
        case 'nextPlayerTurn':
          data.state = 'Counting end of game victory points'
          break
      }
    }
    else {
      data.state = `Waiting for ${activePlayerData.name}`
    }
    return data
  },
}
export default sevenwondersduel
