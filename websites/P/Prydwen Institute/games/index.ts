import * as afkJourney from './afk-journey.js'
import * as arknightsEndfield from './arknights-endfield.js'
import * as ashEchoes from './ash-echoes.js'
import * as counterSide from './counter-side.js'
import * as etheriaRestart from './etheria-restart.js'
import * as eversoul from './eversoul.js'

export interface GameDetails {
  apply: (presenceData: PresenceData, pathList: string[]) => Awaitable<true | unknown>
}

export default {
  'afk-journey': afkJourney,
  'arknights-endfield': arknightsEndfield,
  'ash-echoes': ashEchoes,
  'counter-side': counterSide,
  'etheria-restart': etheriaRestart,
  eversoul
} as Record<string, GameDetails>
