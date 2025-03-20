import type { GameCallbackParams } from '../../types.js'

export const name = 'Nonsensory'
export const logo = 'https://cdn.rcd.gg/PreMiD/websites/J/Jackbox/assets/42.png'

export function getPresenceData({
  playerState,
}: GameCallbackParams): PresenceData {
  switch (playerState.kind) {
    case 'lobby': {
      return { state: 'Waiting in lobby' }
    }
    case 'postGame': {
      return { state: 'Viewing the results' }
    }
    case 'drawing': {
      return { state: 'Drawing a picture' }
    }
    case 'guess': {
      return { state: 'Guessing the value in the range' }
    }
    case 'postGuess': {
      return { state: 'Waiting for other players to guess' }
    }
    case 'singleTextEntry': {
      return { state: 'Answering a prompt' }
    }
    case 'choices': {
      if (playerState.category === 'walkthrough')
        return { state: 'Watching the tutorial' }
      else return { state: 'Making a choice' }
    }
    default: {
      return { state: 'Waiting' }
    }
  }
}
