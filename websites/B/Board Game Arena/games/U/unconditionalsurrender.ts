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

const unconditionalsurrender: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/596.png',
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
        case 'setup':
        case 'countrySetup':
          data.state = 'Setting up the game'
          break
        case 'declareWar':
          data.state = 'Declaring war'
          break
        case 'transferPP':
          data.state = 'Transferring production points'
          break
        case 'nuclearStrike':
          data.state = 'Launching a nuclear strike'
          break
        case 'strategicCombat':
          data.state = 'Committing events'
          break
        case 'strategicMovement':
          data.state = 'Performing a strategic movement'
          break
        case 'scenarioSpecific':
          data.state = 'Performing scenario specific actions'
          break
        case 'ActionsSubPhase':
          data.state = 'Performing actions to move and fight'
          break
        case 'voluntaryElimination':
          data.state = 'Voluntarily eliminating units'
          break
        case 'replacements':
        case 'upgrades':
          data.state = 'Improving units'
          break
        case 'USSRMotorizedGuards':
          data.state = 'Upgrading units to USSR Motorized Guards'
          break
        case 'mobilization':
          data.state = 'Mobilizing units'
          break
        case 'diplomacy':
          data.state = 'Performing diplomacy actions'
          break
        case 'politicalSuccess':
        case 'politicalRestricted':
        case 'politicalFailure':
        case 'politicalUnrestricted':
          data.state = 'Performing a political action'
          break
        case 'specialMobilization':
          data.state = 'Performing a special mobilization'
          break
        case 'airActions':
          data.state = 'Performing air actions'
          break
        case 'airCombat':
          data.state = 'Committing events for air combat'
          break
        case 'escort':
        case 'escortStrike':
          data.state = 'Choosing an escort'
          break
        case 'interceptionCombat2':
        case 'interceptionCombat':
          data.state = 'Committing events for interception'
          break
        case 'airStrike':
          data.state = 'Considering an air strike'
          break
        case 'airStrikeCombat':
          data.state = 'Committing events for an air strike'
          break
        case 'bombingRun':
          data.state = 'Considering a bombing run'
          break
        case 'groundActions':
          data.state = 'Performing ground actions'
          break
        case 'enterFort':
          data.state = 'Entering a fortification'
          break
        case 'displacement':
          data.state = 'Evacuating a unit'
          break
        case 'mobileAttack':
          data.state = 'Considering an attack'
          break
        case 'groundCombat':
          data.state = 'Committing events for ground combat'
          break
        case 'mobileAttackRetreat':
          data.state = 'Retreating from combat'
          break
        case 'mobileAttackAdvance':
          data.state = 'Advancing after combat'
          break
        case 'mulberry':
          data.state = 'Placing a Mulberry marker'
          break
        case 'navalRebaseAfterInvasion':
          data.state = 'Rebasing an invasion fleet'
          break
        case 'convoyChoice':
          data.state = 'Choosing a convoy'
          break
        case 'navalActions':
          data.state = 'Performing naval actions'
          break
        case 'interception':
          data.state = 'Considering intercepting an action'
          break
        case 'abortInvasion':
          data.state = 'Aborting an amphibious invasion'
          break
        case 'conditional':
          data.state = 'Performing a conditional mobilization'
          break
        case 'emergencyShipping':
          data.state = 'Performing emergency shipping'
          break
        case 'repatriation':
          data.state = 'Repatriating units'
          break
        case 'homeDefenseNotSatisfied':
          data.state = 'Satisfying home defense'
          break
        case 'homeDefenseNotSatisfiedCheck':
          data.state = 'Checking home defense'
          break
        case 'placeEvent':
        case 'placeEvent2':
          data.state = 'Placing a marker'
          break
        case 'supplyPhase':
          data.state = 'Tracing supply lines'
          break
        case 'groundSupply':
          data.state = 'Tracing ground supply lines'
          break
        case 'seaSupply':
          data.state = 'Tracing sea supply lines'
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
export default unconditionalsurrender
