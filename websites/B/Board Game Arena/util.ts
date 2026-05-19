export interface GameMetadata extends Record<string, unknown> {
  bRealtime: number
  bTutorial: boolean
  channel: string
  chatDetached: boolean
  current_player_is_active: boolean
  current_player_name: string
  game_group: string
  game_id: number
  game_name: string
  game_status: string
  isSpectator: boolean
  is_coop: boolean
  is_sandbox: boolean
  is_solo: boolean
  metasiteurl: string
  player_id: number
  gamedatas: Record<string, unknown>
}

const dataCache: GameMetadata = {} as GameMetadata
const dataCacheTime: Record<string, number> = {}

export function getGameTag(presence: Presence): Promise<string> {
  return getMetadata<string>(presence, 'game_name', true)
}

function getCachedItem(key: string) {
  return dataCache[key]
}

function setCachedItem(key: string, value: unknown) {
  dataCache[key] = value
}

function getCacheTime(key: string) {
  return dataCacheTime[key] ?? 0
}

function setCacheTime(key: string, time: number) {
  dataCacheTime[key] = time
}

async function getPageVar<T>(
  variable: string,
  presence: Presence,
  isString = false,
): Promise<T> {
  const result = await presence.getPageVariable<Record<string, T>>(variable)
  const value = result[variable]
  if (isString)
    return String(value) as T
  return value as T
}

export async function getMetadata<T>(
  presence: Presence,
  key: string,
  isString = false,
): Promise<T> {
  const now = Date.now()
  if (now - getCacheTime(key) > 1000) {
    setCacheTime(key, now)
    const data = await getPageVar<T>(`gameui.${key}`, presence, isString)
    setCachedItem(key, data)
    return data
  }
  else {
    return getCachedItem(key) as T
  }
}

export function getGameData<T>(
  presence: Presence,
  key: string,
  isString = false,
): Promise<T> {
  return getMetadata<T>(presence, `gamedatas.${key}`, isString)
}

export interface PlayerData {
  name: string
  id: number
  score: string
  avatar: string
}

export function getPlayerData(
  presence: Presence,
  id: number,
): Promise<PlayerData> {
  return getGameData<PlayerData>(presence, `players.${id}`)
}

export function getCurrentGameState(presence: Presence): Promise<string> {
  return getGameData<string>(presence, 'gamestate.name', true)
}

export function getCurrentGameStateType(presence: Presence): Promise<string> {
  return getGameData<string>(presence, 'gamestate.type', true)
}

export function getActivePlayerId(presence: Presence): Promise<number> {
  return getGameData<number>(presence, 'gamestate.active_player')
}

export function getUserPlayerId(presence: Presence): Promise<number> {
  return getMetadata<number>(presence, 'player_id')
}

export function getPlayerAvatar(id: number): string {
  return document.querySelector<HTMLImageElement>(`#avatar_${id}`)?.src ?? ''
}

export function getPlayerScore(id: number): string {
  return document.querySelector<HTMLSpanElement>(`#player_score_${id}`)
    ?.textContent ?? ''
}
