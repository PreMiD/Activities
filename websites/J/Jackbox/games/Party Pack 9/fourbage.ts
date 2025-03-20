import type { GameCallbackParams } from '../../types.js'

export const name = 'Fibbage 4'
export const logo = 'https://cdn.rcd.gg/PreMiD/websites/J/Jackbox/assets/39.png'

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
    case 'choosing': {
      switch (playerState.context) {
        case 'pick-category': {
          return { state: 'Choosing a category' }
        }
        case 'pick-truth': {
          return { state: 'Looking for the truth' }
        }
        case 'pick-likes': {
          return { state: 'Awarding likes to other\'s answers' }
        }
        case 'final-round-1':
        case 'final-round-2': {
          return { state: 'Looking for the truth - Final Round' }
        }
      }
      break
    }
    case 'writing': {
      return { state: 'Writing lies' }
    }
    case 'voting': {
      break
    }
    case 'postGame': {
      return { state: 'Viewing the results' }
    }
  }
  return {}
}
