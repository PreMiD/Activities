import * as counterSide from "./counter-side.js"

export interface GameDetails {
    apply: (presenceData: PresenceData, pathList: string[]) => Awaitable<void>
}

export default {
    "counter-side": counterSide
} as Record<string, GameDetails>
