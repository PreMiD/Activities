import type { GameCallbackParams } from '../../types.js'

export const name = 'Roomerang'
export const logo = 'https://cdn.rcd.gg/PreMiD/websites/J/Jackbox/assets/40.png'

export function getPresenceData({
  playerState,
}: GameCallbackParams): PresenceData {
  const presenceData: PresenceData = {}
  presenceData.smallImageKey = document.querySelector<HTMLImageElement>('.avatar > img')?.src
  switch (playerState.kind) {
    case 'lobby': {
      presenceData.state = 'Waiting in lobby'
      break
    }
    case 'postGame': {
      presenceData.state = 'Viewing the results'
      break
    }
    case 'eliminating': {
      presenceData.state = 'Voting to eliminate a player'
      break
    }
    case 'choosing': {
      if (playerState.prompt?.text === '')
        presenceData.state = 'Voting for a response'
      else if (playerState.round === 'firestarter')
        presenceData.state = 'Choosing a player to burn'
      else if (playerState.round === 'finale')
        presenceData.state = 'Deciding who should win'
      break
    }
    case 'waiting': {
      presenceData.state = 'Waiting'
      break
    }
    case 'writing': {
      if (playerState.isGoodbye) {
        presenceData.state = 'Writing a goodbye message'
      }
      else {
        switch (playerState.round) {
          case 'intro': {
            presenceData.state = 'Writing an introduction'
            break
          }
          case 'connection': {
            presenceData.state = 'Writing about a connection'
            break
          }
          case 'quickie': {
            presenceData.state = 'Writing an anonymous response'
            break
          }
          case 'firestarter': {
            presenceData.state = 'Writing a dramatic response'
            break
          }
          case 'finale': {
            presenceData.state = 'Writing a response for the finale'
            break
          }
          case '': {
            presenceData.state = 'Writing a victory speech'
            break
          }
          default: {
            presenceData.state = 'Writing a response'
          }
        }
      }
      break
    }
  }
  return presenceData
}
