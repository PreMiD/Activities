import type { GameCallbackParams } from '../../types.js'

export const name = 'Role Models'
export const logo = 'https://cdn.rcd.gg/PreMiD/websites/J/Jackbox/assets/26.png'

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
    case 'Camera': {
      return { state: 'Taking a photo of themselves' }
    }
    case 'Draw': {
      return { state: 'Drawing a portrait of themselves' }
    }
    case 'MakeSingleChoice': {
      switch (playerState.choiceType) {
        case 'SkipTutorial': {
          return { state: 'Watching the tutorial' }
        }
        case 'Prompt': {
          return { state: 'Choosing a category' }
        }
        case 'TagResolution': {
          return { state: 'Resolving a role conflict' }
        }
        case 'RoleModelsChoice': {
          return { state: 'Choosing the role that fits best' }
        }
      }
      break
    }
    case 'Sortable': {
      return { state: 'Assigning roles to players' }
    }
    case 'EnterSingleText': {
      return { state: 'Answering a prompt' }
    }
  }
  return {}
}
