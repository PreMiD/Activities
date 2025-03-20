import type { GameCallbackParams } from '../../types.js'

export const name = 'Mad Verse City'
export const logo = 'https://cdn.rcd.gg/PreMiD/websites/J/Jackbox/assets/19.png'

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
    case 'MakeSingleChoice': {
      const { text, html } = playerState.prompt!
      if (text === 'Press this button to skip the tutorial...') {
        presenceData.state = 'Skipping the tutorial'
      }
      else if (
        html === 'Rapidly press these buttons to make weird stuff happen...'
      ) {
        presenceData.state = 'Making weird stuff happen'
      }
      else {
        switch (text) {
          case 'Listen to the RAP': {
            presenceData.state = 'Listening to the rap'
            break
          }
          case 'Tap if you think this rhyme is DOPE': {
            presenceData.state = 'Voting on the rap'
            break
          }
          case 'Who won this battle??': {
            presenceData.state = 'Voting on the winner of the battle'
            break
          }
        }
      }
      break
    }
    case 'EnterSingleText': {
      presenceData.state = `Entering a ${
        playerState.prompt?.html?.match(/\((.+?)\)$/)?.[1]
      }`
      break
    }
  }
  return presenceData
}
