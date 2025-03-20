import type { GameCallbackParams } from '../../types.js'

export const name = 'Zeeple Dome'
export const logo = 'https://cdn.rcd.gg/PreMiD/websites/J/Jackbox/assets/20.png'

export function getPresenceData({
  playerState,
}: GameCallbackParams): PresenceData {
  switch (playerState.state) {
    case 'Lobby': {
      return { state: 'Waiting in lobby' }
    }
    case 'Logo': {
      return { state: 'Waiting' }
    }
    case 'Shoot': {
      return { state: 'Shooting' }
    }
  }
  return {}
}
