import type { GameCallbackParams } from '../../types.js'

export const name = 'The Wheel of Enormous Proportions'
export const logo = 'https://cdn.rcd.gg/PreMiD/websites/J/Jackbox/assets/37.png'

export function getPresenceData({
  playerState,
}: GameCallbackParams): PresenceData {
  switch (playerState.kind) {
    case 'lobby': {
      return { state: 'Waiting in lobby' }
    }
    case 'waiting': {
      return { state: 'Waiting' }
    }
    case 'singleTextEntry': {
      if (playerState.category === 'askTheWheel') {
        return {
          state: `Asking the wheel a question - '${
            document.querySelector<HTMLTextAreaElement>('.input-box textarea')
              ?.value
          }'`,
        }
      }
      else {
        return { state: 'Answering a question' }
      }
    }
    case 'choices': {
      if (playerState.category === 'skip-intro')
        return { state: 'Watching the tutorial' }
      break
    }
    case 'tappingList': {
      return { state: 'Selecting answers' }
    }
    case 'matching': {
      const [a, b] = playerState.headers as string[]
      return { state: `Matching ${a} to ${b}` }
    }
    case 'placeSlices': {
      return { state: 'Placing slices' }
    }
    case 'spin': {
      return { state: 'Spinning the wheel' }
    }
    case 'numeric': {
      return {
        state: `Answering a numeric question - "${playerState.prompt}"`,
      }
    }
    case 'postGame': {
      return { state: 'Viewing the results' }
    }
    case 'typingList': {
      return { state: 'Typing answers' }
    }
    case 'guessing': {
      return { state: 'Guessing what the wheel is thinking of' }
    }
    case 'tappingRapid': {
      return { state: 'Tapping rapidly' }
    }
    case 'choosePlayers': {
      return { state: 'Choosing players' }
    }
    case 'chooseSlices': {
      return { state: 'Choosing slices' }
    }
  }
  return {}
}
