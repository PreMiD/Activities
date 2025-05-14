import * as afkJourney from './afk-journey.js'
import * as counterSide from './counter-side.js'

export interface GameDetails {
  apply: (presenceData: PresenceData, pathList: string[]) => Awaitable<true | unknown>
}

export default {
  'afk-journey': afkJourney,
  'counter-side': counterSide,
} as Record<string, GameDetails>
