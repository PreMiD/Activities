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

const raceforthegalaxy: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/429.png',
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
        case 'initialDiscard':
        case 'initialDiscardHomeWorld':
          data.state = 'Discarding initial cards'
          break
        case 'breedingTube':
        case 'orbActionPlay':
        case 'initialOrb':
          data.state = 'Playing an Orb card'
          break
        case 'initialTeam':
          data.state = 'Placing initial team'
          break
        case 'phaseChoice':
        case 'phaseChoiceCrystal':
          data.state = 'Choosing a phase'
          break
        case 'orbActionMove':
        case 'orbActionMoveDest':
          data.state = 'Moving an Orb exploration team'
          break
        case 'orbActionDraw':
          data.state = 'Drawing an Orb card'
          break
        case 'exploreconsume':
          data.state = 'Discarding for prestige'
          break
        case 'explore':
          data.state = 'Choosing cards to keep'
          break
        case 'develop':
          data.state = 'Placing a development'
          break
        case 'settle':
          data.state = 'Placing a world'
          break
        case 'discardtoputgood':
          data.state = 'Discarding to put a good'
          break
        case 'takeover_attackerboost':
        case 'takeover_defenderboost':
          data.state = 'Choosing a takeover boost'
          break
        case 'takeover_maydefeat':
          data.state = 'Choosing whether to defeat'
          break
        case 'consumesell':
          data.state = 'Selling a resource'
          break
        case 'consume':
          data.state = 'Consuming resources'
          break
        case 'productionwindfall':
          data.state = 'Using produce powers'
          break
        case 'endturndiscard':
        case 'developdiscard':
          data.state = 'Discarding excess cards'
          break
        case 'draft':
          data.state = 'Choosing a card to keep'
          break
        case 'invasionGameResolution':
          data.state = 'Using temporary Xeno powers'
          break
        case 'invasionGameDamage':
          data.state = 'Choosing damage to take'
          break
        case 'orbActionBackToSas':
          data.state = 'Returning to the SAS'
          break
        case 'searchAction':
        case 'searchActionChoose':
          data.state = 'Searching for a card'
          break
        case 'additionalSas':
          data.state = 'Choosing an additional SAS'
          break
        case 'settlediscard':
        case 'initialDiscardAncientRace':
        case 'initialDiscardScavenger':
          data.state = 'Discarding a card'
          break
        case 'warEffort':
          data.state = 'Discarding to increase war effort'
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
export default raceforthegalaxy
