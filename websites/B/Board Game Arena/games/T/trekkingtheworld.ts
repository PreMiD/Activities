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

const trekkingtheworld: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/576.png',
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
        case 'setupAirport':
          data.state = 'Setting up an airport'
          break
        case 'airport':
          data.state = 'Flying to an airport'
          break
        case 'moveSelection':
          data.state = 'Moving to a location'
          break
        case 'moveCard':
          data.state = 'Playing trek cards'
          break
        case 'choose':
          data.state = 'Choosing an action'
          break
        case 'draw':
          data.state = 'Drawing a card'
          break
        case 'tourLess':
        case 'tour':
          data.state = 'Playing tour cards'
          break
        case 'moveBonus':
        case 'journey':
          data.state = 'Playing journey cards'
          break
        case 'payJourney':
          data.state = 'Paying for journey cards'
          break
        case 'chooseCube':
        case 'chooseRow':
          data.state = 'Choosing a cube to move'
          break
        case 'cubeRegion':
          data.state = 'Choosing a souvenir'
          break
        case 'swap':
          data.state = 'Choosing a player to swap with'
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
export default trekkingtheworld
