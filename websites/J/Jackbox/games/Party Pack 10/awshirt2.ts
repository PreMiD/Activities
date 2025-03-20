import type { GameCallbackParams } from '../../types.js'

import { uploadFile } from '../../util.js'

export const name = 'Tee-K.O. 2'
export const logo = 'https://cdn.rcd.gg/PreMiD/websites/J/Jackbox/assets/43.png'

let lastImage: string
let lastImageTime = 0

export async function getPresenceData({
  playerState,
  presence,
}: GameCallbackParams): Promise<PresenceData> {
  switch (playerState.kind) {
    case 'lobby': {
      return { state: 'Waiting in lobby' }
    }
    case 'postGame': {
      return { state: 'Viewing the results' }
    }
    case 'assembling': {
      return { state: 'Assembling a T-Shirt' }
    }
    case 'remaking': {
      return { state: 'Deciding whether to remake a T-Shirt' }
    }
    case 'drawing': {
      const now = Date.now()
      if (now - lastImageTime > 2000) {
        const canvas = document.querySelector('canvas')!
        lastImageTime = now
        lastImage = await uploadFile(
          canvas.toDataURL('image/png'),
          logo,
          presence,
        )
      }
      return {
        state: 'Drawing a T-Shirt image',
        largeImageKey: lastImage,
      }
    }
    case 'writing': {
      return { state: 'Writing a T-Shirt slogan' }
    }
    case 'voting': {
      return { state: 'Voting for a T-Shirt' }
    }
    default: {
      return { state: 'Waiting' }
    }
  }
}
