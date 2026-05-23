import * as afkJourney from './afk-journey.js'
import * as arknightsEndfield from './arknights-endfield.js'
import * as ashEchoes from './ash-echoes.js'
import * as counterSide from './counter-side.js'
import * as etheriaRestart from './etheria-restart.js'
import * as eversoul from './eversoul.js'
import * as gflExilium from './gfl-exilium.js'
import * as limbusCompany from './limbus-company.js'
import * as nikke from './nikke.js'
import * as re1999 from './re1999.js'
import * as soloLeveling from './solo-leveling.js'
import * as starRail from './star-rail.js'
import * as wutheringWaves from './wuthering-waves.js'
import * as zenless from './zenless.js'

export interface GameDetails {
  apply: (presenceData: PresenceData, pathList: string[]) => Awaitable<true | unknown>
}

export default {
  'afk-journey': afkJourney,
  'arknights-endfield': arknightsEndfield,
  'ash-echoes': ashEchoes,
  'counter-side': counterSide,
  'etheria-restart': etheriaRestart,
  eversoul,
  'gfl-exilium': gflExilium,
  'limbus-company': limbusCompany,
  nikke,
  re1999,
  'solo-leveling': soloLeveling,
  'star-rail': starRail,
  'wuthering-waves': wutheringWaves,
  zenless,
} as Record<string, GameDetails>
