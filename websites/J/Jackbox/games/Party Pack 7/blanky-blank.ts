import type { GameCallbackParams } from '../../types.js'

export const name = 'Blather \'Round'
export const logo = 'https://cdn.rcd.gg/PreMiD/websites/J/Jackbox/assets/28.png'

export function getPresenceData({
  playerState,
}: GameCallbackParams): PresenceData {
  switch (playerState.state) {
    case 'Lobby': {
      return { state: 'Waiting in lobby' }
    }
    case 'Logo': {
      return { state: 'Waiting' }
    }
    case 'MakeSingleChoice': {
      switch (playerState.choiceType) {
        case 'skipTutorial': {
          return { state: 'Watching the tutorial' }
        }
        case 'password': {
          return { state: 'Choosing a prompt' }
        }
      }
      break
    }
    case 'MakeSentence': {
      switch ((playerState.sentence as { type: string }).type) {
        case 'writing': {
          return { state: 'Crafting initial sentence' }
        }
        case 'call': {
          return { state: 'Crafting a sentence' }
        }
        case 'response': {
          return { state: 'Crafting a sentence using players\' guesses' }
        }
        case 'mybad': {
          return { state: 'Deciding if they should have known the answer' }
        }
      }
      break
    }
    case 'EnterSingleText': {
      return { state: 'Guessing the object' }
    }
  }
  return {}
}
