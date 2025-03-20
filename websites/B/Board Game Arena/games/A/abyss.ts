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

const abyss: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/2.png',
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
        case 'plotAtCourt':
          data.state = 'Bringing a new Lord to Court'
          break
        case 'action':
          data.state = 'Taking an action'
          break
        case 'purchase':
          data.state = 'Purchasing an Ally'
          break
        case 'explore':
        case 'explore2':
        case 'explore3':
          data.state = 'Exploring'
          break
        case 'control':
        case 'controlPostDraw':
          data.state = 'Controlling a Location'
          break
        case 'chooseMonsterReward':
          data.state = 'Choosing a reward'
          break
        case 'recruitPay':
          data.state = 'Paying for a Lord'
          break
        case 'affiliate':
          data.state = 'Affiliating with an Ally'
          break
        case 'lordEffect':
          data.state = 'Applying Lord effect'
          break
        case 'lord5':
        case 'postpurchaseDiscard':
        case 'cleanupDiscard':
          data.state = 'Discarding excess Allies'
          break
        case 'lord19':
        case 'lord19b':
        case 'locationEffectBlackSmokers':
          data.state = 'Swapping a Location'
          break
        case 'unusedLords':
          data.state = 'Using unused Lord abilities'
          break
        case 'secondStack':
          data.state = 'Taking a second stack from the Council'
          break
        case 'lord2':
          data.state = 'Discarding an Ally'
          break
        case 'lord4':
          data.state = 'Disabling a Lord from each opponent'
          break
        case 'lord7':
          data.state = 'Stealing a Monster token'
          break
        case 'lord12':
          data.state = 'Discarding an Ally for Pearls'
          break
        case 'lord16':
          data.state = 'Choosing a Council stack'
          break
        case 'lord17':
          data.state = 'Discarding a Council stack'
          break
        case 'lord21':
          data.state = 'Discarding and replaceing a Lord'
          break
        case 'lord22':
          data.state = 'Recruiting a second Lord'
          break
        case 'lord23':
          data.state = 'Discarding a Lord to gain one from the Court'
          break
        case 'lord26':
          data.state = 'Discarding a Lord to gain one from the top of the deck'
          break
        case 'lord23b':
          data.state = 'Swapping a Lord'
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
export default abyss
