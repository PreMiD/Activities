import type { GameCallbackParams } from '../../types.js'

export const name = 'Junktopia'
export const logo = 'https://cdn.rcd.gg/PreMiD/websites/J/Jackbox/assets/38.png'

export function getPresenceData({
  playerState,
}: GameCallbackParams): PresenceData {
  const { prompt, kind, responseKey } = playerState
  switch (kind) {
    case 'lobby': {
      return { state: 'Waiting in lobby' }
    }
    case 'postGame': {
      return { state: 'Viewing the results' }
    }
    case 'ranking': {
      return { state: 'Ranking items' }
    }
    case 'choosing': {
      if (responseKey?.startsWith('skip')) {
        return { state: 'Watching the tutorial' }
      }
      else if (responseKey?.startsWith('shopping')) {
        return { state: 'Shopping for an item' }
      }
      else if (responseKey?.startsWith('presentationChoice')) {
        if (prompt?.text === 'Ready to present?')
          return { state: 'Preparing to present' }
        else return { state: 'Presenting their item' }
      }
      else if (responseKey?.startsWith('reaction')) {
        return { state: 'Reacting to an item' }
      }
      else if (responseKey?.startsWith('voting')) {
        return { state: 'Voting on a collection' }
      }
      break
    }
    case 'fact': {
      return { state: 'Creating facts about an item' }
    }
    case 'writing': {
      if (prompt?.text === 'This piece is entitled:') {
        return { state: 'Naming their item' }
      }
      else if (
        prompt?.text
        === 'Your two items are part of a collection called "[blank][/blank]"'
      ) {
        return { state: 'Naming their collection' }
      }
      break
    }
    case 'waiting': {
      return { state: 'Waiting' }
    }
  }
  return {}
}
