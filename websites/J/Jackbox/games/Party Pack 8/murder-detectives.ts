import type { GameCallbackParams } from '../../types.js'

export const name = 'Weapons Drawn'
export const logo = 'https://cdn.rcd.gg/PreMiD/websites/J/Jackbox/assets/35.png'

export function getPresenceData({
  playerState,
}: GameCallbackParams): PresenceData {
  const presenceData: PresenceData = {}
  const icon = document.querySelector<HTMLDivElement>('.header.avatar')
  const { kind, prompt } = playerState
  if (icon) {
    presenceData.smallImageKey = getComputedStyle(
      icon,
      ':after',
    ).backgroundImage.match(/^url\("(.*)"\)$/)?.[1]
  }
  switch (kind) {
    case 'lobby': {
      presenceData.state = 'Waiting in lobby'
      break
    }
    case 'choosing': {
      if (prompt?.text === 'Which case do you want to investigate?') {
        presenceData.state = 'Choosing a case to investigate'
      }
      else if (
        prompt?.text
        === '[header]WRONG[/header][section]Try again in 5 seconds...[/section]'
        || prompt?.text === 'Choose a guest to target.'
        || (prompt as string).startsWith('Guess which detective brought ')
      ) {
        presenceData.state = 'Murdering guests'
      }
      else if ((prompt as string).startsWith('Who do you think murdered ')) {
        presenceData.state = 'Deciding on the culprit'
      }
      break
    }
    case 'drawing': {
      presenceData.state = 'Drawing their weapon clue'
      break
    }
    case 'inspecting': {
      presenceData.state = 'Inspecting the killing weapons'
      break
    }
    case 'writing': {
      presenceData.state = 'Inviting accomplices'
      break
    }
    case 'postGame': {
      presenceData.state = 'Viewing the results'
      break
    }
    default: {
      presenceData.state = 'Waiting'
    }
  }
  return presenceData
}
