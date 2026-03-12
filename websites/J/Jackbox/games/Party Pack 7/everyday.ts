import type { GameCallbackParams } from '../../types.js'

export const name = 'The Devils and the Details'
export const logo
  = 'https://cdn.rcd.gg/PreMiD/websites/J/Jackbox/assets/29.png'

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
      switch (playerState.choiceId) {
        case 'ChangeCharacter': {
          return { state: 'Choosing a character' }
        }
        default: {
          if (playerState.choiceType === 'SkipIntro')
            return { state: 'Watching the intro' }
          else if (playerState.choiceType === 'ShowTutorial')
            return { state: 'Deciding if they want to watch the tutorial' }
        }
      }
      break
    }
    case 'CancelerMechanic': {
      return { state: 'Blocking a member from their selfish task' }
    }
    case 'TaskList': {
      return { state: 'Choosing a task' }
    }
    case 'NothingMechanic': {
      return { state: 'Doing nothing' }
    }
    case 'ScrubMechanic': {
      return { state: 'Scrubbing something' }
    }
    case 'RotateMechanic': {
      return { state: 'Rotating something' }
    }
    case 'TapMechanic': {
      return { state: 'Tapping something' }
    }
    case 'SwipeMechanic': {
      return { state: 'Swiping something' }
    }
    case 'TravelMechanicParticipant': {
      return { state: 'Travelling as a passenger' }
    }
    case 'TravelMechanicCaptain': {
      return { state: 'Travelling as the driver' }
    }
    case 'PhoneMechanic': {
      return { state: 'Calling someone' }
    }
    case 'DialogMechanic': {
      return { state: 'Talking to someone' }
    }
    case 'SearchMechanicCaptain':
    case 'SearchMechanicParticipant': {
      return { state: 'Searching for something' }
    }
    case 'TextMechanicParticipant': {
      return { state: 'Writing a text' }
    }
    case 'TextMechanicCaptain': {
      return { state: 'Reading a text' }
    }
    case 'InstructionsMechanicCaptain': {
      return { state: 'Following instructions' }
    }
    case 'InstructionsMechanicParticipant': {
      return { state: 'Giving instructions' }
    }
    case 'HoldMechanic': {
      return { state: 'Holding something' }
    }
  }
  return {}
}
