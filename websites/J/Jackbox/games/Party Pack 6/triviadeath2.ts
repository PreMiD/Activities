import type { GameCallbackParams } from '../../types.js'

export const name = 'Trivia Murder Party 2'
export const logo = 'https://cdn.rcd.gg/PreMiD/websites/J/Jackbox/assets/27.png'

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
      if (playerState.roundType === 'FinalRound') {
        return { state: 'Answering the final trivia questions' }
      }
      else {
        switch (playerState.choiceType) {
          case 'SkipTutorial': {
            return { state: 'Watching the intro' }
          }
          case 'Question': {
            return { state: 'Answering trivia' }
          }
          case 'Rule': {
            return { state: 'Playing a rule game' }
          }
          case 'PostGameChoice': {
            return { state: 'Choosing a post-game option' }
          }
          default: {
            return { state: 'Playing a death game' }
          }
        }
      }
    }
    case 'EnterSingleText': {
      const { entryId } = playerState
      if (entryId?.startsWith('MindMeld'))
        return { state: 'Playing the mind meld game' }
      else if (entryId === 'CreatePassword')
        return { state: 'Creating a password for the password game' }
      else if (entryId === 'Quiplash')
        return { state: `Playing Quiplash - ${playerState.prompt?.html}` }
      else return { state: 'Playing a text death game' }
    }
    case 'Draw': {
      return { state: 'Playing a drawing death game' }
    }
  }
  return {}
}
