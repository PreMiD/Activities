import type { GameCallbackParams } from '../../types.js'
import { uploadFile } from '../../util.js'

export const name = 'Champ\'d Up'
export const logo = 'https://cdn.rcd.gg/PreMiD/websites/J/Jackbox/assets/32.png'

export async function getPresenceData({
  playerState,
  presence,
}: GameCallbackParams): Promise<PresenceData> {
  const presenceData: PresenceData = {}
  presenceData.smallImageKey = getComputedStyle(
    document.querySelector('#playericon')!,
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
    case 'MakeSingleChoice': {
      const { choiceId } = playerState
      if (choiceId) {
        if (choiceId.startsWith('FlipChoice'))
          presenceData.state = 'Flipping their character'
      }
      else if (playerState.prompt?.html?.startsWith('Who is <br>')) {
        presenceData.state = 'Voting for the best champion'
      }
      else if (
        playerState.prompt?.html?.startsWith(
          'Swap your character or keep it in<br>',
        )
      ) {
        presenceData.state = 'Choosing whether to swap their character'
      }
      else {
        presenceData.state = 'Watching the tutorial'
      }
      break
    }
    case 'Draw': {
      const { entryId } = playerState
      if (entryId?.startsWith('champion')) {
        presenceData.state = 'Drawing a champion'
        break
      }
      else if (entryId?.startsWith('challenger')) {
        const imageLink = document.querySelector<HTMLImageElement>('.imageData')?.src
        if (imageLink) {
          presenceData.largeImageKey = await uploadFile(
            imageLink,
            'https://cdn.rcd.gg/PreMiD/websites/J/Jackbox/assets/32.png',
            presence,
          )
        }

        presenceData.state = 'Drawing a challenger'
        break
      }
      break
    }
  }
  return presenceData
}
