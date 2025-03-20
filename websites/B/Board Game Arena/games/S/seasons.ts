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

const seasons: GamePresence = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/472.png',
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
        case 'draftChoice':
          data.state = 'Keeping a card'
          break
        case 'draftTwist':
          data.state = 'Keeping a card (Twist of Fate)'
          break
        case 'buildLibrary3':
          data.state = 'Choosing cards for the 3rd year'
          break
        case 'buildLibrary2':
          data.state = 'Choosing cards for the 2nd year'
          break
        case 'buildLibraryNew':
          data.state = 'Choosing cards for the 1st year'
          break
        case 'diceChoice':
          data.state = 'Choosing a die'
          break
        case 'maliceDie':
          data.state = 'Using Die of Malice'
          break
        case 'playerTurn':
          data.details = 'Taking actions'
          break
        case 'checkEnergy':
          data.details = 'Discarding energy'
          break
        case 'keepOrDiscard':
          data.details = 'Keeping or discarding a card'
          break
        case 'summonVariableCost':
          data.details = 'Choosing how to pay the cost of a card'
          break
        case 'bonusDrawChoice':
          data.details = 'Choosing a card to draw'
          break
        case 'nextEffectCheckEnergy':
        case 'bonusExchangeDiscard':
          data.details = 'Discarding energy'
          break
        case 'gainEnergy':
        case 'bonusGainEnergy':
          data.details = 'Choosing energy to gain'
          break
        case 'discardIshtar':
          data.details = 'Discarding identical energies (Ishtar)'
          break
        case 'discardKairn':
          data.details = 'Discarding an energy (Kairn)'
          break
        case 'necroticSacrifice':
          data.details = 'Discarding or sacrificing a familiar'
          break
        case 'mirrorDiscard':
          data.details = 'Discarding identical energies'
          break
        case 'mirrorChoose':
          data.details = 'Choosing a type of energy (Mirror)'
          break
        case 'elementalChoice':
          data.details = 'Choosing a type of energy (Elemental)'
          break
        case 'treeOfLifeChoice':
          data.details = 'Choosing a type of energy (Tree of Life)'
          break
        case 'discardTree':
          data.details = 'Discarding an energy (Tree of Life)'
          break
        case 'cauldronPlace':
          data.details = 'Placing an energy on the Cauldron'
          break
        case 'vampiricChoice':
          data.details = 'Choosing to draw or discard a card (Vampire)'
          break
        case 'vampiricDiscard':
          data.details = 'Discarding a card (Vampire)'
          break
        case 'amuletFireChoice':
          data.details = 'Choosing a card to add to your hand (Amulet of Fire)'
          break
        case 'divineChoice':
          data.details = 'Choosing a card to summon for free (Divine Intervention)'
          break
        case 'potionDreamChoice':
          data.details = 'Choosing a card to summon for free (Potion of Dreams)'
          break
        case 'dragonSkull1':
        case 'dragonSkull2':
        case 'dragonSkull3':
          data.details = 'Sacrificing a card (Dragon Skull)'
          break
        case 'temporalBoots':
          data.details = 'Moving the season token'
          break
        case 'syllasSacrifice':
          data.details = 'Sacrificing a card (Syllas)'
          break
        case 'nariaChoice':
          data.details = 'Choosing a card for Naria'
          break
        case 'amsugTakeback':
          data.details = 'Taking back a magical item (Amsug)'
          break
        case 'lewisChoice':
          data.details = 'Choosing an opponent (Lewis)'
          break
        case 'orbChoice':
        case 'orbChoice2':
          data.details = 'Choosing a card (Orb of Time)'
          break
        case 'discardHornPlenty':
          data.details = 'Discarding an energy (Horn of Plenty)'
          break
        case 'familiarChoice':
          data.details = 'Choosing a familiar'
          break
        case 'amuletOfTime':
          data.details = 'Discarding power cards (Amulet of Time)'
          break
        case 'rattyNightshade':
          data.details = 'Collecting energy from opponents (Ratty Nightshade)'
          break
        case 'wardenChoice':
          data.details = 'Choosing a card (Warden of the Forest)'
          break
        case 'wardenDiscardEnergy':
          data.details = 'Discarding energy (Warden of the Forest)'
          break
        case 'wardenDiscardCard':
          data.details = 'Discarding a card (Warden of the Forest)'
          break
        case 'throneDiscard':
          data.details = 'Discarding a card (Throne of the High King)'
          break
        case 'telescopeChoice':
          data.details = 'Choosing a card (Telescope)'
          break
        case 'discardJewel':
          data.details = 'Discarding 3 identical energies (Jewel of the Ancients)'
          break
        case 'fairyMonolith':
          data.details = 'Placing an energy on the Fairy Monolith'
          break
        case 'fairyMonolithActive':
          data.details = 'Choosing energy to return to your reserve (Fairy Monolith)'
          break
        case 'seleniaTakeback':
          data.details = 'Taking back a magical item (Selenia)'
          break
        case 'scrollIshtarChoice':
          data.details = 'Choosing a type of energy (Scroll of Ishtar)'
          break
        case 'scrollIshtarCardChoice':
          data.details = 'Choosing a card (Scroll of Ishtar)'
          break
        case 'statueOfEolisChoice':
          data.details = 'Choosing a card (Statue of Eolis)'
          break
        case 'statueOfEolisLook':
          data.details = 'Looking at the top card of the draw pile (Statue of Eolis)'
          break
        case 'resurrectionChoice':
          data.details = 'Choosing a card to add to your hand (Resurrection)'
          break
        case 'potionSacrificeChoice':
          data.details = 'Sacrficing Shield of Zira instead (Potion of Sacrifice)'
          break
        case 'ravenChoice':
          data.details = 'Choosing a magical item to mimic (Raven)'
          break
        case 'potionOfAncientChoice':
          data.details = 'Choosing a card (Potion of Ancient Choice)'
          break
        case 'potionOfAncientCardChoice':
          data.details = 'Choosing a card to add to your hand (Potion of Ancient Choice)'
          break
        case 'sepulchralAmuletChoice':
        case 'sepulchralAmuletChoice2':
          data.details = 'Choosing a card to add to your hand (Sepulchral Amulet)'
          break
        case 'discardEstorian':
          data.details = 'Discarding 2 identical energies (Estorian Orb)'
          break
        case 'arusSacrifice':
          data.details = 'Discarding or sacrificing a card (Arus)'
          break
        case 'argosianChoice':
          data.details = 'Choosing a familiar to lock (Argosian)'
          break
        case 'discardEolis':
          data.details = 'Discarding a water energy (Statue of Eolis)'
          break
        case 'dragonsouldCardChoice':
          data.details = 'Choosing a card (Dragon Soul)'
          break
        case 'dialDualChoice':
          data.details = 'Choosing a die to reroll (Dial of Dual Choice)'
          break
        case 'staffWinterDiscard':
          data.details = 'Discarding a card (Staff of Winter)'
          break
        case 'chronoRingChoice':
          data.details = 'Choosing a card (Chrono Ring)'
          break
        case 'urmianChoice':
          data.details = 'Choosing a card (Urmian)'
          break
        case 'urmianSacrifice':
          data.details = 'Sacrificing a card (Urmian)'
          break
        case 'keepOrDiscardRagfield':
          data.details = 'Choosing to keep or discard a card (Ragfield)'
          break
        case 'craftyChooseOpponent':
          data.details = 'Choosing an opponent (Crafty)'
          break
        case 'crafyChoice':
          data.details = 'Choosing a card to give to an opponent (Crafty)'
          break
        case 'discardMinion':
          data.details = 'Discarding an Air energy (Minion of the Elements)'
          break
        case 'chaliceEternity':
          data.details = 'Placing an energy on Chalice of Eternity'
          break
        case 'chaliceEternityChoice':
          data.details = 'Choosing a card to summon for free (Chalice of Eternity)'
          break
        case 'carnivoraChoice':
          data.details = 'Choosing to keep or replace this card (Carnivora)'
          break
        case 'igramulChoice':
          data.details = 'Naming a card (Igramul the Resolute)'
          break
        case 'igramulDiscard':
          data.details = 'Choosing to sacrifice Shield of Zira instead (Igramul the Resolute)'
          break
        case 'crystalTitanChoice':
          data.details = 'Choosing an opponent Power card to sacrifice (Crystal Titan)'
          break
        case 'escapedChoice':
          data.details = 'Choosing to get the last card drawn (Escaped Prisoner)'
          break
        case 'steadfastDie':
          data.details = 'Choosing a die to reroll (Steadfast Die)'
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
export default seasons
