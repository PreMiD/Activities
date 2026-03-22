import type { Resolver } from '../util/interfaces.js'
import { ActivityType } from 'premid'
import { ActivityAssets, formatMatch, getGameMode, getPlayerData, hasPlayerControls } from '../util/index.js'

enum GameStatus {
  Searching,
  Playing,
  Spectating,
  Finished,
  Archive,
  Lobby,
  Daily,
  Loading,
}

function getGameStatus(doc: Document): GameStatus {
  const path = doc.location.pathname

  if (path.includes('/games/view/'))
    return GameStatus.Archive
  if (path.includes('/play/online/watch'))
    return GameStatus.Spectating
  if (path.includes('/daily'))
    return GameStatus.Daily

  const hasControls = hasPlayerControls(doc)
  const hasClock = !!doc.querySelector('.clock-component, [data-cy="clock-time"]')

  const topNode = doc.querySelector('.player-component.player-top, .player-row-component')
  const topName = topNode?.querySelector('[data-test-element="user-tagline-username"], .user-username-component')

  if (path.includes('/play/online') || path.includes('/live')) {
    if (!hasControls && !hasClock && !topNode)
      return GameStatus.Lobby
  }

  if (hasControls)
    return GameStatus.Playing

  if (doc.querySelector('.game-over-message-component, .game-result-component'))
    return GameStatus.Finished

  if (topName || hasClock)
    return GameStatus.Spectating
  if (topNode && !topName)
    return GameStatus.Searching

  return GameStatus.Loading
}

const gameResolver: Resolver = {
  isActive: (pathname) => {
    const isGame = pathname.includes('/game/') || pathname.includes('/games/')
    const isPlay = pathname.includes('/play/online') || pathname.includes('/live') || pathname.includes('/daily')
    const isWatch = pathname.includes('/watch')

    return (isGame || isPlay || isWatch) && !pathname.includes('/variants')
  },

  getType: (t, doc) => {
    const status = getGameStatus(doc)
    if (status === GameStatus.Playing || status === GameStatus.Daily || status === GameStatus.Lobby) {
      return ActivityType.Playing
    }
    return ActivityType.Watching
  },

  getDetails: (t, doc) => {
    const status = getGameStatus(doc)
    const mode = getGameMode(doc) || t.game_online

    switch (status) {
      case GameStatus.Archive:
        return t.archive
      case GameStatus.Lobby:
        return t.play_lobby
      case GameStatus.Searching:
        return `${t.searching} ${mode}...`
      case GameStatus.Playing:
      case GameStatus.Daily:
        return `${t.play} ${mode}`
      case GameStatus.Finished:
      {
        const gameOverEl = doc.querySelector('.game-over-message-component strong, .game-result-component')
        return gameOverEl?.textContent?.trim() || t.game_finished
      }
      case GameStatus.Spectating:
        if (doc.location.pathname.includes('/game/live/'))
          return t.watching_replay
        return `${t.spectating} ${mode}`
      default:
        return t.home
    }
  },

  getState: (t, doc, displayFormat, hideRating) => {
    const status = getGameStatus(doc)

    if (status === GameStatus.Searching || status === GameStatus.Loading) {
      return t.waiting
    }

    if (status === GameStatus.Lobby) {
      return undefined
    }

    const topNode = doc.querySelector('.player-component.player-top, .player-row-container')
    const bottomNode = doc.querySelector('.player-component.player-bottom')

    const top = getPlayerData(topNode)
    const bottom = getPlayerData(bottomNode)

    if (status === GameStatus.Archive) {
      if (bottom.name && top.name) {
        return `${bottom.name} ${t.vs_separator} ${top.name}`
      }
      return document.title.replace(' - Chess.com', '').trim()
    }

    if (top.name && bottom.name) {
      const state = formatMatch(top, bottom, displayFormat, hideRating, t.vs_separator)
      if (state)
        return state

      const p1 = bottom.rating ? `${bottom.name} (${bottom.rating})` : bottom.name
      const p2 = top.rating ? `${top.name} (${top.rating})` : top.name
      return `${p1} ${t.vs_separator} ${p2}`
    }

    if (status === GameStatus.Playing && doc.querySelector('.clock-component')) {
      return t.match_in_progress
    }

    return 'Chess.com'
  },

  getButtons: (t, doc) => {
    const status = getGameStatus(doc)
    if (status !== GameStatus.Searching && status !== GameStatus.Loading && status !== GameStatus.Lobby) {
      const currentUrl = doc.location.href
      const cleanUrl = currentUrl.split('?')[0] || currentUrl
      return [{ label: t.button_view_game, url: cleanUrl }]
    }
    return undefined
  },

  getLargeImageKey: () => ActivityAssets.Logo,

  getSmallImageKey: (t, doc) => {
    const mode = getGameMode(doc)?.toLowerCase()

    if (mode === 'bullet')
      return ActivityAssets.Bullet
    if (mode === 'blitz')
      return ActivityAssets.Blitz
    if (mode === 'rapid')
      return ActivityAssets.Rapid
    if (mode === 'daily')
      return ActivityAssets.Daily

    return ActivityAssets.Logo
  },

  getSmallImageText: (t, doc) => {
    const status = getGameStatus(doc)
    const mode = getGameMode(doc) || t.play_live

    switch (status) {
      case GameStatus.Playing:
      case GameStatus.Daily:
        return `${t.play} ${mode}`
      case GameStatus.Spectating: return `${t.spectating} ${mode}`
      case GameStatus.Archive: return t.archive
      case GameStatus.Finished: return t.media_finished
      case GameStatus.Searching: return t.searching
      default: return t.home
    }
  },
}

export default gameResolver
