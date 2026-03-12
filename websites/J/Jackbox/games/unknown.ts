import type { GameCallbackParams } from '../types.js'

export const tag = 'unknown'
export const name = 'Unknown Game'
export const logo = 'https://cdn.rcd.gg/PreMiD/websites/J/Jackbox/assets/logo.png'

export function getPresenceData(info: GameCallbackParams): PresenceData {
  return {
    state: `Playing an unsupported game (${info.tag})`,
  }
}
