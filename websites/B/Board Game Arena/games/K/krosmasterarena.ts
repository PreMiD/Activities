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

const krosmasterarena: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/293.png',
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
        case 'chooseTeam':
        case 'chooseTeamSimultaneous':
          data.state = 'Choosing a Krosmaster for their team'
          break
        case 'placeTeam':
          data.state = 'Placing their Krosmasters on the board'
          break
        case 'chooseBoardSide':
          data.state = 'Choosing a board side for their team'
          break
        case 'changeDie':
          data.state = 'Choosing a die face'
          break
        case 'inspirationDiceNoReroll':
        case 'inspirationDice':
          data.state = 'Attributing inspiration dice to Krosmasters'
          break
        case 'which_mob':
          data.state = 'Activating a mob'
          break
        case 'masterturn':
          data.state = 'Using Move Points and Action Points'
          break
        case 'selectSecondaryTargets':
        case 'spelltarget':
          data.state = 'Choosing a target for a spell'
          break
        case 'buyReward':
        case 'buyRewardHidden':
          data.state = 'Buying a reward'
          break
        case 'boostChoice':
          data.state = 'Choosing a bonus'
          break
        case 'move_next_to_me':
        case 'move_next_to_target':
          data.state = 'Moving next to a target'
          break
        case 'place_next_to_target_square':
        case 'place_next_to_target':
          data.state = 'Placing a summon around a target'
          break
        case 'summon_choice':
          data.state = 'Choosing a summon'
          break
        case 'give_one_move':
          data.state = 'Moving to a free cell'
          break
        case 'move_adjacent_to_target':
          data.state = 'Moving a character on target'
          break
        case 'move_on_latest_position':
          data.state = 'Moving a character to Mint Jelly freed cell'
          break
        case 'cold_chain':
          data.state = 'Choosing a target for Cold Chain'
          break
        case 'potion_bag':
          data.state = 'Choosing a bonus for Potion Bag'
          break
        case 'drhellzerker':
          data.state = 'Choosing the number of MP to spend'
          break
        case 'diy':
          data.state = 'Choosing 2 powers for Tactical Arrow'
          break
        case 'changeDieOnDouble':
          data.state = 'Choosing to re-roll a die'
          break
        case 'move_adjacent_ally_not_self_to_target':
        case 'move_adjacent_ally_to_target_then_move_next_to_target':
          data.state = 'Moving an ally next to a target'
          break
        case 'move_adjacent_ally_summon_to_target':
          data.state = 'Moving an ally summon next to a target'
          break
        case 'move_adjacent_ally_gobbowl_to_target':
          data.state = 'Moving an ally Gobbowl next to a target'
          break
        case 'masquerade':
          data.state = 'Replacing a Maskeman'
          break
        case 'move_adjacent_opponent_to_target':
          data.state = 'Moving an opponent next to a target'
          break
        case 'temporalbubble':
          data.state = 'Choosing a target for Temporal Bubble'
          break
        case 'suckerstab':
          data.state = 'Choosing the number of AP to spend'
          break
        case 'cometomama':
          data.state = 'Choosing the number of Kama to spend'
          break
        case 'dracometeors':
          data.state = 'Choosing a target for Draco Meteor'
          break
        case 'summon_place':
          data.state = 'Placing a summon on the board'
          break
        case 'thrifty':
          data.state = 'Choosing to ignore the spell cost'
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
export default krosmasterarena
