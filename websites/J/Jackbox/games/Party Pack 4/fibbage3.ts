import type { GameCallbackParams } from '../../types.js'

export const name = 'Fibbage 3'
export const logo = 'https://cdn.rcd.gg/PreMiD/websites/J/Jackbox/assets/14.png'

export function getPresenceData({
  playerState,
}: GameCallbackParams): PresenceData {
  const presenceData: PresenceData = {}
  presenceData.smallImageKey = getComputedStyle(
    document.querySelector<HTMLDivElement>('#playericon')!,
  )?.backgroundImage?.match(/^url\("(.*)"\)$/)?.[1]
  switch (playerState.state) {
    case 'Lobby': {
      presenceData.state = 'Waiting in lobby'
      break
    }
    case 'EndShortie': {
      presenceData.state = 'Waiting for the next prompt'
      break
    }
    case 'ChooseLike': {
      presenceData.state = 'Liking responses'
      break
    }
    case 'ChooseLie': {
      presenceData.state = 'Looking for the truth'
      break
    }
    case 'Logo': {
      presenceData.state = 'Waiting'
      break
    }
    case 'EnterText':
    case 'EnterTruth': {
      presenceData.state = `Answering a prompt: ${playerState.question}`
      break
    }
    case 'CategorySelection': {
      if (playerState.isChoosing)
        presenceData.state = 'Choosing a category'
      else
        presenceData.state = 'Waiting for another player to choose a category'
      break
    }
  }
  return presenceData
}
