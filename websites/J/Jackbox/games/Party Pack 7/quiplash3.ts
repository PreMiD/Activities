import type { GameCallbackParams } from '../../types.js'

export const name = 'Quiplash 3'
export const logo = 'https://cdn.rcd.gg/PreMiD/websites/J/Jackbox/assets/31.png'

export function getPresenceData({
  playerState,
}: GameCallbackParams): PresenceData {
  const presenceData: PresenceData = {}
  presenceData.smallImageKey = getComputedStyle(
    document.querySelector<HTMLDivElement>('#playericon')!,
  ).backgroundImage.match(/^url\("(.*)"\)$/)?.[1]
  switch (playerState.state) {
    case 'Lobby': {
      presenceData.state = 'Waiting in lobby'
      break
    }
    case 'Logo': {
      presenceData.state = 'Waiting'
      break
    }
    case 'EnterSingleText': {
      presenceData.state = 'Answering a prompt'
      break
    }
    case 'MakeSingleChoice': {
      presenceData.state = 'Voting for their favorite answer'
      break
    }
    case 'EnterTextList': {
      presenceData.state = 'Answering a Thriplash prompt'
      break
    }
    default: {
      if (playerState.validActions) {
        switch ((playerState.validActions as string[]).join(',')) {
          case 'toggle-visibility,new,load,exit': {
            presenceData.state = 'In the Custom Content menu'
            break
          }
          case 'title,close': {
            presenceData.state = 'Naming a custom Quiplash episode'
            break
          }
          case 'add,toggle-visibility,close':
          case 'add,remove,toggle-visibility,done': {
            presenceData.state = 'Adding prompts to a custom Quiplash episode'
            break
          }
          case 'submit,unlock,toggle-visibility,play,remove-content,episodes': {
            presenceData.state = 'Viewing a custom Quiplash episode'
            break
          }
        }
      }
    }
  }
  return presenceData
}
