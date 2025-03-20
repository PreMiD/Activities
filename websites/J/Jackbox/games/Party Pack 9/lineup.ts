import type { GameCallbackParams } from '../../types.js'

export const name = 'Quixort'
export const logo = 'https://cdn.rcd.gg/PreMiD/websites/J/Jackbox/assets/41.png'

export function getPresenceData({
  playerState,
}: GameCallbackParams): PresenceData {
  switch (playerState.kind) {
    case 'lobby': {
      return { state: 'Waiting in lobby' }
    }
    case 'choices': {
      return { state: 'Selecting a topic to sort' }
    }
    case 'falling': {
      return { state: 'Sorting an item' }
    }
    case 'postGame': {
      return { state: 'Viewing the results' }
    }
    default: {
      return { state: 'Waiting' }
    }
  }
}
