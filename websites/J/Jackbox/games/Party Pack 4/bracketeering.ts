import type { GameCallbackParams } from '../../types.js'

export const name = 'Bracketeering'
export const logo = 'https://cdn.rcd.gg/PreMiD/websites/J/Jackbox/assets/13.png'

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
    case 'MakeSingleChoice': {
      if (playerState.text === 'Press this to skip the tutorial') {
        presenceData.state = 'Watching the tutorial'
        break
      }
      else if (
        (playerState.text as string).includes(
          'Which answer will get the most votes?',
        )
      ) {
        presenceData.state = 'Predicting the most popular answer'
      }
      else if (
        (playerState.text as string).includes(
          'Vote for the answer that deserves to win.',
        )
      ) {
        presenceData.state = 'Voting on an answer'
      }
      break
    }
    case 'EnterSingleText': {
      presenceData.state = 'Answering a prompt'
      break
    }
    case 'Logo': {
      presenceData.state = 'Waiting'
      break
    }
  }
  return presenceData
}
