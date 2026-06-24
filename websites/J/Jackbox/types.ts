export interface Game {
  name: string
  logo: string
  getPresenceData: (
    params: GameCallbackParams,
  ) => Promise<PresenceData> | PresenceData
}

export interface GamePlayerState {
  playerName?: string
  username?: string
  playerInfo?: {
    username?: string
  }
  state?: string
  status?: string
  kind?: string
  category?: string
  prompt?: {
    text?: string
    html?: string
  }
  entryId?: string
  choiceId?: string
  responseKey?: string
  placeholder?: string
  choiceType?: string
  classes?: string[]
  instructions?: string
  goal?: string
  options?: string[]
  textEntry?: {
    prompt: string
  }
  [x: string]: unknown
}

export interface GameInfoState {
  name?: string
}

export interface GameCallbackParams {
  playerState: GamePlayerState
  infoState: GameInfoState
  tag: string
  presence: Presence
}
