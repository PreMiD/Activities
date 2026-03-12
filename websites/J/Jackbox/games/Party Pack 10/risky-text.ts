import type { GameCallbackParams } from '../../types.js'

export const name = 'FixyText'
export const logo = 'https://cdn.rcd.gg/PreMiD/websites/J/Jackbox/assets/46.png'

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
    case 'choices': {
      return { state: 'Choosing a category' }
    }
    case 'inbox': {
      return { state: 'Viewing the initial message' }
    }
    case 'task': {
      return { state: 'Preparing to write text' }
    }
    case 'writing': {
      return { state: 'Writing text chaotically' }
    }
    case 'favorites': {
      return { state: 'Voting on their favorite words' }
    }
    default: {
      return { state: 'Waiting' }
    }
  }
}
