import { presence } from './util.js'

const variableCache: Record<string, unknown> = {}
const variableCacheTimes: Record<string, number> = {}

export enum GameScreenType {
  Loading,
  PlayerTurn,
  OtherTurn,
  DrawEnd,
  HandEnd,
  GameEnd,
}

// This is just to make sure that the above line is not removed by eslint
// while at the same time passing Deepscan issues.
const unused_variable = (a: number, b: number) => a + b
unused_variable(1, 2)
interface GameEndResult {
  players: {
    part_point_1: number // final raw score
    total_point: number // +/- value (divide by 1000 to get the displayed value)
    seat: number // player index
  }[] // index indicates the position of the player
}

let wasDrawScreen = false
export async function getGameType(): Promise<GameScreenType> {
  const {
    'uiscript.UI_Win.Inst.enable': enableWinScreen,
    'uiscript.UI_ScoreChange.Inst.enable': enableScoreChangeScreen,
    'uiscript.UI_Huleshow.Inst.enable': enableDrawScreen,
    'uiscript.UI_Loading.Inst.enable': enableLoadingScreen,
    'view.DesktopMgr.Inst.index_player': activePlayerIndex,
    'view.DesktopMgr.Inst.gameEndResult': gameEndResult,
    'view.DesktopMgr.Inst.seat': playerIndex,
  } = await getVariable({
    'view.DesktopMgr.Inst.seat': 0,
    'view.DesktopMgr.Inst.gameEndResult': null as GameEndResult | null,
    'view.DesktopMgr.Inst.index_player': 0,
    'uiscript.UI_Win.Inst.enable': false,
    'uiscript.UI_ScoreChange.Inst.enable': false,
    'uiscript.UI_Huleshow.Inst.enable': false,
    'uiscript.UI_Loading.Inst.enable': false,
  })
  if (enableLoadingScreen)
    return GameScreenType.Loading
  if (enableDrawScreen)
    wasDrawScreen = true
  if (enableWinScreen) {
    wasDrawScreen = false
    return GameScreenType.HandEnd
  }
  if (enableScoreChangeScreen)
    return wasDrawScreen ? GameScreenType.DrawEnd : GameScreenType.HandEnd

  if (gameEndResult)
    return GameScreenType.GameEnd
  if (playerIndex === activePlayerIndex)
    return GameScreenType.PlayerTurn
  return GameScreenType.OtherTurn
}

export async function getBasicGameInfo(): Promise<{
  playerIndex: number
  activePlayerIndex: number
  honbaCount: number
  roundCount: number
  windIndex: number
  tilesLeft: number
  gameMode: number
  gameEndResult: GameEndResult | null
}> {
  const {
    'view.DesktopMgr.Inst.seat': playerIndex,
    'view.DesktopMgr.Inst.index_player': activePlayerIndex,
    'view.DesktopMgr.Inst.index_ben': honbaCount,
    'view.DesktopMgr.Inst.index_ju': roundCount,
    'view.DesktopMgr.Inst.index_change': windIndex,
    'view.DesktopMgr.Inst.left_tile_count': tilesLeft,
    'view.DesktopMgr.Inst.game_config.mode': gameMode,
    'view.DesktopMgr.Inst.gameEndResult': gameEndResult,
  } = await getVariable({
    'view.DesktopMgr.Inst.seat': 0,
    'view.DesktopMgr.Inst.index_player': 0,
    'view.DesktopMgr.Inst.index_ben': 0,
    'view.DesktopMgr.Inst.index_ju': 0,
    'view.DesktopMgr.Inst.index_change': 0,
    'view.DesktopMgr.Inst.left_tile_count': 0,
    'view.DesktopMgr.Inst.game_config.mode': 0,
    'view.DesktopMgr.Inst.gameEndResult': null as GameEndResult | null,
  })
  return {
    playerIndex,
    activePlayerIndex,
    honbaCount,
    roundCount,
    windIndex,
    tilesLeft,
    gameMode,
    gameEndResult,
  }
}

export async function getPlayerInfo(playerIndex: number): Promise<{
  playerSeat: number
  playerScore: number
  playerName: string
}> {
  const {
    [`view.DesktopMgr.Inst.player_datas[${playerIndex}].nickname`]: playerName,
  } = await getVariable({
    [`view.DesktopMgr.Inst.player_datas[${playerIndex}].nickname`]: 'Unknown Player',
  })
  const seatIndex = await getPlayerListIndexFromSeat(playerIndex)
  const {
    [`view.DesktopMgr.Inst.players[${seatIndex}].seat`]: playerSeat,
    [`view.DesktopMgr.Inst.players[${seatIndex}].score`]: playerScore,
  } = await getVariable({
    [`view.DesktopMgr.Inst.players[${seatIndex}].seat`]: 0,
    [`view.DesktopMgr.Inst.players[${seatIndex}].score`]: 0,
  })
  return {
    playerSeat: playerSeat as number,
    playerScore: playerScore as number,
    playerName: playerName as string,
  }
}

async function getPlayerListIndexFromSeat(playerSeat: number): Promise<number> {
  const {
    'view.DesktopMgr.Inst.players[0].seat': seat0,
    'view.DesktopMgr.Inst.players[1].seat': seat1,
    'view.DesktopMgr.Inst.players[2].seat': seat2,
    'view.DesktopMgr.Inst.players[3].seat': seat3,
  } = await getVariable({
    'view.DesktopMgr.Inst.players[0].seat': 0,
    'view.DesktopMgr.Inst.players[1].seat': 1,
    'view.DesktopMgr.Inst.players[2].seat': 2,
    'view.DesktopMgr.Inst.players[3].seat': 3,
  })
  let playerIndex = 0
  switch (playerSeat) {
    case seat0: {
      playerIndex = 0
      break
    }
    case seat1: {
      playerIndex = 1
      break
    }
    case seat2: {
      playerIndex = 2
      break
    }
    case seat3: {
      playerIndex = 3
      break
    }
  }
  return playerIndex
}

export async function getHandEndInfo(): Promise<{
  handScore: number
  seat: number
}> {
  const {
    // while there can be more than one winner, this presence currently only displays the first
    'uiscript.UI_Win.Inst.data.hules[0].dadian': handScore,
    'uiscript.UI_Win.Inst.data.hules[0].seat': seat,
  } = await getVariable({
    'uiscript.UI_Win.Inst.data.hules[0].dadian': 0,
    'uiscript.UI_Win.Inst.data.hules[0].seat': 0,
  })
  return { handScore, seat }
}

export async function isInGame(): Promise<boolean> {
  const { 'GameMgr.Inst.ingame': ingame } = await getVariable({
    'GameMgr.Inst.ingame': false,
  })
  return ingame
}

export async function getAccountInfo(): Promise<{
  nickname: string
  coppers: number
  signature: string
}> {
  const {
    'GameMgr.Inst.account_data.nickname': nickname,
    'GameMgr.Inst.account_data.gold': coppers,
    'GameMgr.Inst.account_data.signature': signature,
  } = await getVariable({
    'GameMgr.Inst.account_data.nickname': 'Unknown Player',
    'GameMgr.Inst.account_data.gold': 0,
    'GameMgr.Inst.account_data.signature': '',
  })
  return { nickname, coppers, signature }
}

export enum HomeScreenType {
  LoggingIn,
  Shop,
  Dorm,
  CreateRoom,
  RoomLobby,
  Gacha,
  Rules,
  PlayerInfo,
  Achievement,
  RankedQueue,
  FriendlyQueue,
  TournamentQueue,
  Loading,
  Home,
}

export async function getHomeScreenType(): Promise<HomeScreenType> {
  const {
    'uiscript.UI_Entrance.Inst.enable': enabledEntrance,
    'uiscript.UI_Lobby.Inst.enable': enabledLobby,
    'uiscript.UI_Shop.Inst.enable': enabledShop,
    'uiscript.UI_Sushe.Inst.enable': enabledDorm,
    'uiscript.UI_Create_Room.Inst.enable': enabledCreateRoom,
    'uiscript.UI_Treasure.Inst.enable': enabledGacha,
    'uiscript.UI_Rules.Inst.enable': enabledRules,
    'uiscript.UI_PlayerInfo.Inst.enable': enabledPlayerInfo,
    'uiscript.UI_Achievement.Inst.enable': enabledAchievement,
    'uiscript.UI_Loading.Inst.enable': enabledLoading,
    'uiscript.UI_WaitingRoom.Inst.enable': enabledRoomLobby,
  } = await getVariable({
    'uiscript.UI_Entrance.Inst.enable': false,
    'uiscript.UI_Lobby.Inst.enable': false,
    'uiscript.UI_Shop.Inst.enable': false,
    'uiscript.UI_Sushe.Inst.enable': false,
    'uiscript.UI_WaitingRoom.Inst.enable': false,
    'uiscript.UI_Treasure.Inst.enable': false,
    'uiscript.UI_Rules.Inst.enable': false,
    'uiscript.UI_PlayerInfo.Inst.enable': false,
    'uiscript.UI_Achievement.Inst.enable': false,
    'uiscript.UI_Loading.Inst.enable': false,
    'uiscript.UI_Create_Room.Inst.enable': false,
  })
  if (enabledEntrance)
    return HomeScreenType.LoggingIn
  if (enabledShop)
    return HomeScreenType.Shop
  if (enabledDorm)
    return HomeScreenType.Dorm
  if (enabledCreateRoom)
    return HomeScreenType.CreateRoom
  if (enabledGacha)
    return HomeScreenType.Gacha
  if (enabledRules)
    return HomeScreenType.Rules
  if (enabledPlayerInfo)
    return HomeScreenType.PlayerInfo
  if (enabledAchievement)
    return HomeScreenType.Achievement
  if (enabledLoading)
    return HomeScreenType.Loading
  if (enabledRoomLobby)
    return HomeScreenType.RoomLobby
  if (enabledLobby) {
    const { 'uiscript.UI_Lobby.Inst.nowpage': lobbyPage } = await getVariable({
      'uiscript.UI_Lobby.Inst.nowpage': 0,
    })
    switch (lobbyPage) {
      case 1:
        return HomeScreenType.RankedQueue
      case 2:
        return HomeScreenType.FriendlyQueue
      case 3:
        return HomeScreenType.TournamentQueue
    }
    return HomeScreenType.Home
  }
  return HomeScreenType.Loading
}

export async function getGachaInfo(): Promise<string> {
  const { 'uiscript.UI_Treasure.Inst.tab_index': tabIndex } = await getVariable(
    {
      'uiscript.UI_Treasure.Inst.tab_index': 0,
    },
  )
  const {
    [`uiscript.UI_Treasure.Inst.tabs[${tabIndex}].name.text`]: tabName,
  } = await getVariable({
    [`uiscript.UI_Treasure.Inst.tabs[${tabIndex}].name.text`]: 'Unknown Tab',
  })
  return tabName!
}

export async function getAchievementInfo(): Promise<{
  totalAchievementCount: number
  totalCountString: string
  bronzeAchievementCount: string
  silverAchievementCount: string
  goldAchievementCount: string
}> {
  const {
    'uiscript.UI_Achievement.Inst.total_achievement_count': totalAchievementCount,
    'uiscript.UI_Achievement.Inst.total_count.text': totalCountString,
    'uiscript.UI_Achievement.Inst.total_achievement.lst[0].text': bronzeAchievementCount,
    'uiscript.UI_Achievement.Inst.total_achievement.lst[1].text': silverAchievementCount,
    'uiscript.UI_Achievement.Inst.total_achievement.lst[2].text': goldAchievementCount,
  } = await getVariable({
    'uiscript.UI_Achievement.Inst.total_achievement_count': 0,
    'uiscript.UI_Achievement.Inst.total_count.text': '0',
    'uiscript.UI_Achievement.Inst.total_achievement.lst[0].text': '0',
    'uiscript.UI_Achievement.Inst.total_achievement.lst[1].text': '0',
    'uiscript.UI_Achievement.Inst.total_achievement.lst[2].text': '0',
  })
  return {
    totalAchievementCount,
    totalCountString,
    bronzeAchievementCount,
    silverAchievementCount,
    goldAchievementCount,
  }
}

export async function getWaitingRoomInfo(): Promise<{
  roomId: number
  mode: string
  maxPlayers: number
  currentPlayers: number
}> {
  const {
    'uiscript.UI_WaitingRoom.Inst.room_id': roomId,
    'uiscript.UI_WaitingRoom.Inst.container_rules.modes[0]': mode,
    'uiscript.UI_WaitingRoom.Inst.max_player_count': maxPlayers,
    'uiscript.UI_WaitingRoom.Inst.players.length': currentPlayers,
  } = await getVariable({
    'uiscript.UI_WaitingRoom.Inst.room_id': 0,
    'uiscript.UI_WaitingRoom.Inst.container_rules.modes[0]': 'Unknown Mode',
    'uiscript.UI_WaitingRoom.Inst.max_player_count': 0,
    'uiscript.UI_WaitingRoom.Inst.players.length': 0,
  })
  return { roomId, mode, maxPlayers, currentPlayers }
}

export async function getVariable<T extends Record<string, unknown>>(
  fallback: T,
): Promise<T> {
  const variables = Object.keys(fallback)
  const results = await Promise.all(
    variables.map(variable => getVariableWrapper(variable).catch(() => ({}))),
  )
  const output = Object.assign({}, fallback)
  for (const result of results) Object.assign(output, result)

  return output as T
}

function getVariableWrapper(
  variable: string,
): Promise<Record<string, unknown>> {
  const now = performance.now()
  if (variableCacheTimes[variable] && now - variableCacheTimes[variable] < 1500)
    return Promise.resolve(variableCache[variable] as Record<string, unknown>)

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Variable retrieval timed out'))
    }, 500)
    presence
      .getPageVariable(variable)
      .then((result) => {
        variableCache[variable] = result
        variableCacheTimes[variable] = now
        resolve(result)
      })
      .catch(reject)
      .finally(() => {
        clearTimeout(timeout)
      })
  })
}
