import type { GameCallbackParams } from '../../types.js'

export const name = 'Civic Doodle'
export const logo = 'https://cdn.rcd.gg/PreMiD/websites/J/Jackbox/assets/16.png'

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
    case 'Draw': {
      return { state: 'Drawing' }
    }
    case 'Reaction': {
      return { state: 'Reacting to the drawings' }
    }
    case 'MakeSingleChoice': {
      switch (playerState.text) {
        case 'Which player\'s addition was better?': {
          return { state: 'Voting for the best addition' }
        }
        case 'You drew something this round, sit back and relax.': {
          return { state: 'Waiting for other players to vote' }
        }
        case 'Which title is best?': {
          return { state: 'Voting for the best title' }
        }
      }
      break
    }
    case 'EnterSingleText': {
      return { state: 'Entering a title for their drawing' }
    }
  }
  return {}
}
