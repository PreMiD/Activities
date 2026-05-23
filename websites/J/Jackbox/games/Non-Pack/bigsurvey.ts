import type { GameCallbackParams } from '../../types.js'
import { Assets } from 'premid'

export const name = 'The Jackbox Survey Scramble'
export const logo = 'https://cdn.rcd.gg/PreMiD/websites/J/Jackbox/assets/49.png'

function getGoalString(goal: string) {
  switch (goal) {
    case 'High':
      return 'most popular'
    case 'Low':
      return 'least popular'
  }
}

export async function getPresenceData({
  playerState,
}: GameCallbackParams): Promise<PresenceData> {
  switch (playerState.kind) {
    case 'lobby': {
      if (playerState.textEntry) {
        const input = document.querySelector<HTMLInputElement>('#input')
        let detailsText = playerState.textEntry.prompt
        if (input?.value)
          detailsText += ` - "${input.value}"`

        return {
          state: 'Waiting in lobby',
          smallImageKey: Assets.Question,
          smallImageText: detailsText,
        }
      }
      return { state: 'Waiting in lobby' }
    }
    case 'postGame': {
      return { state: 'Viewing the results' }
    }
    case 'choices': {
      switch (playerState.responseKey) {
        case 'objectGuess:3': {
          const prompt = playerState.prompt as string
          if (prompt?.includes('MORE'))
            return { state: `Dare: Guessing ${prompt}` }

          return { state: 'High-Low: Guessing the more popular answer' }
        }
        case 'voteResponse:3': {
          return { state: 'Voting for a topic' }
        }
      }
      return { state: 'Making a choice' }
    }
    case 'teamChoice': {
      return { state: 'Choosing their team' }
    }
    case 'bounce': {
      if (playerState.instructions?.includes('Try'))
        return { state: 'Bounce: Practicing answers' }

      return {
        state: 'Bounce: Submitting answers',
      }
    }
    case 'ticTacToe': {
      return {
        state: `Tic Tac Toe: ${
          playerState.instructions?.includes('next') ? 'Suggesting' : 'Guessing'
        } prompts`,
        smallImageKey: Assets.Question,
        smallImageText: document.querySelector('.prompt'),
      }
    }
    case 'speed': {
      return {
        state: 'Speed: Guessing answers',
        smallImageKey: Assets.Question,
        smallImageText: document.querySelector('.prompt'),
      }
    }
    case 'highLow': {
      return {
        state: `High-Low: Guessing the ${getGoalString(
          playerState.goal!,
        )} answer`,
        smallImageKey: Assets.Question,
        smallImageText: document.querySelector('.prompt'),
      }
    }
    case 'horseRace': {
      return {
        state: `Dash: Guessing the ${getGoalString(playerState.goal!)} answer`,
        smallImageKey: Assets.Question,
        smallImageText: `Between '${playerState.options?.join(', ')}`,
      }
    }
    case 'dare': {
      return { state: 'Dare: Choosing opponent\'s difficulty' }
    }
    case 'dareText': {
      if (playerState.successfulGuess)
        return { state: 'Dare: Guessing rank of submission' }

      return {
        state: 'Dare: Providing guess',
        smallImageKey: Assets.Question,
        smallImageText: document.querySelector('.prompt'),
      }
    }
    default: {
      return { state: 'Waiting' }
    }
  }
}
