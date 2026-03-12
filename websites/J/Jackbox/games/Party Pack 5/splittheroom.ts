import type { GameCallbackParams } from '../../types.js'

export const name = 'Split the Room'
export const logo = 'https://cdn.rcd.gg/PreMiD/websites/J/Jackbox/assets/21.png'

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
      const { html } = playerState.prompt!
      if (html === 'Press this to skip the tutorial...')
        return { state: 'Watching the tutorial' }
      else if (html === 'Did this person create an amusing scenario?')
        return { state: 'Rating the scenario' }
      else if (html?.startsWith('For bonus points, which option do you think'))
        return { state: 'Predicting a player\'s choice' }
      else return { state: 'Responding to a scenario' }
    }
    case 'EnterSingleText': {
      return { state: 'Completing a scenario' }
    }
  }
  return {}
}
