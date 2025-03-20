import type { GameCallbackParams } from '../../types.js'

export const name = 'The Poll Mine'
export const logo = 'https://cdn.rcd.gg/PreMiD/websites/J/Jackbox/assets/36.png'

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
    case 'choices': {
      return { state: 'Selecting a door' }
    }
    case 'survey': {
      return { state: 'Completing survey' }
    }
    case 'postGame': {
      return { state: 'Viewing the results' }
    }
  }
  return {}
}
