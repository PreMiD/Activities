import type { GameCallbackParams } from '../../types.js'

export const name = 'Monster Seeking Monster'
export const logo = 'https://cdn.rcd.gg/PreMiD/websites/J/Jackbox/assets/15.png'

export function getPresenceData({
  playerState,
}: GameCallbackParams): PresenceData {
  const presenceData: PresenceData = {}
  const icon = document.querySelector<HTMLDivElement>('.chatAvatar.playerIcon')
  if (icon) {
    presenceData.smallImageKey = getComputedStyle(icon).backgroundImage.match(/^url\("(.*)"\)$/)?.[1]
  }
  switch (playerState.state) {
    case 'Lobby': {
      presenceData.state = 'Waiting in lobby'
      break
    }
    case 'MakeSingleChoice': {
      if (
        (playerState.text as { blackBox: string })?.blackBox
        === 'Press this to skip the tutorial...'
      ) {
        presenceData.state = 'Watching the tutorial'
        break
      }
      break
    }
    case 'Logo': {
      presenceData.state = 'Waiting'
      break
    }
    case 'chat': {
      const mode = (playerState.chat as { mode: string })?.mode
      if (mode === 'chat')
        presenceData.state = 'Chatting'
      else if (mode === 'browse')
        presenceData.state = 'Browsing messages'
      else presenceData.state = 'Choosing a date'
      break
    }
  }
  return presenceData
}
