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

const feastforodin: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/180.png',
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
        case 'pickAction':
        case 'command-clerk':
        case 'confirmTurn':
          data.state = 'Taking an action'
          break
        case 'income-placegoods':
        case 'bonus-placegoods':
        case 'gameEnd-placegoods':
          data.state = 'Placing goods'
          break
        case 'command-personalfeast':
        case 'feast-placegoods':
          data.state = 'Placing goods on their feast board'
          break
        case 'command-playOccupation':
          data.state = 'Playing an occupation'
          break
        case 'command-exchange':
        case 'command-hornturner':
        case 'command-hornturner2':
        case 'command-wharfowner':
        case 'command-fineblacksmith':
        case 'command-shipbuilder':
        case 'command-dragonslayer':
        case 'command-privatechef':
        case 'command-cowherd':
        case 'command-bonecollector':
        case 'command-breeder':
        case 'command-shepherdboy':
        case 'command-metalsmith':
        case 'command-hidebuyer':
        case 'command-preacher':
        case 'command-hornblower':
        case 'command-spicemerchant':
        case 'command-meatmerchant':
        case 'command-sower':
        case 'command-flaxbaker':
        case 'command-silkstitcher':
        case 'command-laborer':
        case 'command-meatcurer':
        case 'command-deerstalker':
        case 'command-spicetrader':
        case 'command-sponsor':
        case 'command-hornblower2':
        case 'command-slowpoke':
        case 'command-bosporustraveller':
          data.state = 'Making an exchange'
          break
        case 'command-forge':
          data.state = 'Taking a special tile from the forge'
          break
        case 'command-forgebuy':
          data.state = 'Buying a special tile from the forge'
          break
        case 'command-armedfighter':
        case 'command-mountain':
          data.state = 'Taking resources from a mountain strip'
          break
        case 'command-trade':
          data.state = 'Upgrading green goods'
          break
        case 'command-upgrade':
        case 'command-sameupgrade':
        case 'command-nwupgrade':
        case 'command-payupgrade':
          data.state = 'Upgrading goods'
          break
        case 'command-hunt':
        case 'command-prehunt':
          data.state = 'Hunting'
          break
        case 'command-hunt-reward2':
        case 'command-hunt-reward':
          data.state = 'Picking a hunting reward'
          break
        case 'command-emigrate':
          data.state = 'Emigrating'
          break
        case 'command-swapwhalingboatknarr':
          data.state = 'Swapping a whaling boat for a knarr'
          break
        case 'command-follower':
        case 'command-clone':
          data.state = 'Copying an action'
          break
        case 'command-storeman':
        case 'command-disheartenedwarrior':
        case 'command-lancebearer':
          data.state = 'Taking a good'
          break
        case 'command-meatupgrade':
          data.state = 'Upgrading a meat good'
          break
        case 'command-inspector':
        case 'command-inspector2':
        case 'command-ironsmith':
        case 'command-snarespecialist':
          data.state = 'Returning a viking to the Thing space'
          break
        case 'command-fieldfarmer':
          data.state = 'Upgrading an orange good'
          break
        case 'command-earl':
          data.state = 'Buying a stonehouse'
          break
        case 'command-flip':
          data.state = 'Flipping goods'
          break
        case 'command-quartermaster':
        case 'command-longshipbuilder':
          data.state = 'Buying a longship'
          break
        case 'command-harborguard':
        case 'command-emigratepassable':
          data.state = 'Picking a boat to emigrate'
          break
        case 'command-beforeorafter-draw':
          data.state = 'Choosing when to draw an occupation'
          break
        case 'command-beforeorafter-play':
          data.state = 'Choosing when to play an occupation'
          break
        case 'command-peacemaker':
          data.state = 'Taking a resource'
          break
        case 'command-swordfighter':
        case 'command-berserker':
          data.state = 'Removing an ore for a boost'
          break
        case 'command-latecomer':
          data.state = 'Using Latecomer'
          break
        case 'command-preceptor':
          data.state = 'Choosing to draw or play an occupation'
          break
        case 'command-oreboatman':
          data.state = 'Placing ore on their boards'
          break
        case 'command-fishcook':
          data.state = 'Placing stockfish on their houses'
          break
        case 'command-soberman':
          data.state = 'Gaining silver'
          break
        case 'command-explore':
          data.state = 'Exploring an island'
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
export default feastforodin
