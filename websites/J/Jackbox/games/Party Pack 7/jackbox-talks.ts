import type { GameCallbackParams } from '../../types.js'

export const name = 'Talking Points'
export const logo = 'https://cdn.rcd.gg/PreMiD/websites/J/Jackbox/assets/30.png'

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
      return { state: 'Taking a profile picture' }
    }
    case 'EnterSingleText': {
      const { entryId } = playerState
      if (entryId?.startsWith('prompt'))
        return { state: 'Creating topics' }
      else if (entryId === 'WriteQuote')
        return { state: 'Writing a quote about the talk' }
      else if (entryId === 'NameAward')
        return { state: 'Naming an award' }
      break
    }
    case 'Awards': {
      return { state: 'Giving out their award' }
    }
    case 'MakeSingleChoice': {
      const { classes, choices, prompt } = playerState
      if (prompt?.html === 'PICK THE TITLE OF THE TALK YOU WILL GIVE') {
        return { state: 'Choosing a talk title' }
      }
      else {
        switch (classes?.[0]) {
          case 'SkipTutorial': {
            return { state: 'Watching the tutorial' }
          }
          case 'Presenter': {
            if (prompt?.html?.startsWith('RATE HOW WELL '))
              return { state: 'Rating their assistant' }
            else if (prompt?.text === 'THANK YOU.')
              return { state: 'Presenting their talk - thank you' }
            else return { state: 'Presenting their talk - preparation' }
          }
          case 'Assistant': {
            if (prompt?.html === 'PICK THE BEST PICTURE TO REPRESENT THE TALK')
              return { state: 'Choosing a picture for the talk' }
            else return { state: 'Assisting their presenter' }
          }
          default: {
            if ((choices as { className: string }[])[0]?.className === 'voteUp')
              return { state: 'Reacting to the speech' }
          }
        }
      }
      break
    }
    case 'Draw': {
      return { state: 'Presenting their talk - slide' }
    }
  }
  return {}
}
