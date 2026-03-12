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

const throughtheagesnewstory: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/558.png',
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
        case 'bidTerritorySendUnitOrBonus':
          data.state = 'Sending units or playing colonization bonus cards'
          break
        case 'playerTurn':
        case 'playerTurnFirstTurn':
          data.state = 'Taking actions'
          break
        case 'buildChoice':
          data.state = 'Choosing a build action'
          break
        case 'bidTerritory':
          data.state = 'Bidding for a territory'
          break
        case 'bidTerritorySendUnit':
          data.state = 'Sending units to a territory'
          break
        case 'playerTurnPolitic':
          data.state = 'Taking a political action'
          break
        case 'lossBlueToken':
          data.state = 'Choosing from where to take blue tokens'
          break
        case 'aggressionMaySacrifice':
          data.state = 'Defending against aggression'
          break
        case 'pactMayAccept':
          data.state = 'Accepting a pact'
          break
        case 'discardMilitaryCards':
          data.state = 'Discarding military cards'
          break
        case 'mustBuildCivil':
          data.state = 'Building or upgrading an urban building'
          break
        case 'mustBuildProduction':
          data.state = 'Building or upgrading a mine or farm'
          break
        case 'freeWarrior':
          data.state = 'Building a warrior unit'
          break
        case 'freeTemple':
          data.state = 'Building a temple'
          break
        case 'chooseReservesGain':
        case 'freeFoodResourceCustom':
        case 'freeFoodResource':
          data.state = 'Gaining food or resources'
          break
        case 'mustBuildWonder':
          data.state = 'Building a wonder step'
          break
        case 'lossPopulation':
          data.state = 'Choosing which yellow token to lose'
          break
        case 'lossBuilding':
          data.state = 'Choosing which building to lose'
          break
        case 'mustPlayTechnology':
          data.state = 'Playing a technology card'
          break
        case 'mustUpgradeBuilding':
          data.state = 'Upgrading a building'
          break
        case 'mustBuildMilitary':
          data.state = 'Building a military unit'
          break
        case 'wonderForFree':
          data.state = 'Building stages of Wonder'
          break
        case 'christopherColumbus':
          data.state = 'Playing a territory card (Christopher Columbus)'
          break
        case 'stealFoodResource5':
        case 'stealFoodResource7':
        case 'stealFoodResource':
          data.state = 'Stealing food or resources'
          break
        case 'destroyBuilding':
          data.state = 'Destroying an urban building'
          break
        case 'payResourceFood':
          data.state = 'Paying food or resources'
          break
        case 'pickCardsFromRow':
        case 'pickCardsFromRowContinue':
          data.state = 'Picking cards from the card row'
          break
        case 'ravagesOfTime':
          data.state = 'Ravaging a wonder'
          break
        case 'annex':
          data.state = 'Annexing a territory'
          break
        case 'lossColony':
          data.state = 'Choosing a colony to lose'
          break
        case 'stealTechnology':
          data.state = 'Stealing a technology'
          break
        case 'developmentOfCivilization':
          data.state = 'Developing a technology or building'
          break
        case 'homerGiveWonderHappyFace':
          data.state = 'Giving a wonder an extra happy face'
          break
        case 'infiltrate':
          data.state = 'Destroying a leader or wonder'
          break
        case 'churchill':
          data.state = 'Gaining culture or science'
          break
        case 'lossYellowToken':
          data.state = 'Choosing from where to take yellow tokens'
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
export default throughtheagesnewstory
