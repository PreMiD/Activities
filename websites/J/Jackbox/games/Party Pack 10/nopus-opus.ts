import type { GameCallbackParams } from '../../types.js'
import { Assets } from 'premid'
import { getSVGImageData, uploadFile } from '../../util.js'

export const name = 'Dodo Re Mi'
export const logo = 'https://cdn.rcd.gg/PreMiD/websites/J/Jackbox/assets/44.png'

function getAvatarImageData(): Promise<string> {
  return getSVGImageData(document.querySelector<SVGElement>('.avatar')!)
}

export async function getPresenceData({
  playerState,
  presence,
}: GameCallbackParams): Promise<PresenceData> {
  switch (playerState.kind) {
    case 'lobby': {
      return { state: 'Waiting in lobby' }
    }
    case 'credits': {
      return { state: 'Viewing the credits' }
    }
    case 'playback': {
      return { state: 'Listening to the playback' }
    }
    case 'audienceRecording':
    case 'recording': {
      const instrumentImageData = await getSVGImageData(
        document.querySelector<SVGElement>('.instrument')!,
      )
      const instrumentImage = await uploadFile(
        instrumentImageData,
        Assets.Question,
        presence,
      )
      return {
        state: 'Recording a song',
        smallImageText: `on ${
          document.querySelector<HTMLParagraphElement>('.instrument-name')
            ?.textContent
        }`,
        smallImageKey: instrumentImage,
      }
    }
    case 'instrumentSelect': {
      const instrumentImageData = await getSVGImageData(
        document.querySelector<SVGElement>('.selected .instrument')!,
      )
      const instrumentImage = await uploadFile(
        instrumentImageData,
        Assets.Question,
        presence,
      )
      return {
        state: 'Selecting an instrument',
        smallImageText: `on ${
          document.querySelector<HTMLParagraphElement>('.name')?.textContent
        }`,
        smallImageKey: instrumentImage,
      }
    }
    case 'scoreboard': {
      const avatarImageData = await getAvatarImageData()
      const avatarImage = await uploadFile(
        avatarImageData,
        Assets.Question,
        presence,
      )
      return {
        state: 'Viewing the scoreboard',
        smallImageText: document.querySelector<HTMLHeadingElement>('.result')?.textContent,
        smallImageKey: avatarImage,
      }
    }
    case 'songSelect': {
      return {
        state: 'Selecting a song',
        smallImageKey: 'https://cdn.rcd.gg/PreMiD/websites/J/Jackbox/assets/45.png',
        smallImageText: document.querySelector('.name')?.textContent?.trim(),
      }
    }
    default: {
      return { state: 'Waiting' }
    }
  }
}
