import type { GameCallbackParams } from '../../types.js'

export const name = 'Patently Stupid'
export const logo = 'https://cdn.rcd.gg/PreMiD/websites/J/Jackbox/assets/18.png'

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
    case 'MakeSingleChoice': {
      const { html } = playerState.prompt!
      switch (html) {
        case '': {
          return { state: 'Watching the tutorial' }
        }
        case '<div>Choose an Issue</div><div>to base your invention on.</div>': {
          return { state: 'Choosing an issue to work on' }
        }
        case '<div>Present your idea!</div><div>It\'s your turn to show off your invention!<br /><br />Would you like to present your invention, or would you like the game to do it for you?</div>': {
          return { state: 'Choosing presentation options' }
        }
        case '<div>Present your idea!</div><div>You can control the timing!<br />(Show elements in any order.)</div>': {
          return { state: 'Presenting their invention' }
        }
        default:
          if (html?.startsWith('<div>Invest in the best!</div>'))
            return { state: 'Investing in an invention' }
          else if (/choose an issue.*?to base your invention on/is.test(html ?? ''))
            return { state: 'Choosing the final issue to work on' }
      }
      break
    }
    case 'EnterSingleText': {
      const { html } = playerState.prompt!
      if (html?.startsWith('<div>Fill in the Blank!</div>'))
        return { state: 'Creating a problem' }
      else if (html === '<div>Write a title</div><div>for your invention</div>')
        return { state: 'Naming their invention' }
      else if (
        html === '<div>Write a tagline</div><div>for your invention</div>'
      )
        return { state: 'Creating a tagline for their invention' }
      break
    }
    case 'Draw': {
      return { state: 'Drawing their invention' }
    }
  }
  return {}
}
