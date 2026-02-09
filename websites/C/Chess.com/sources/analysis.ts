import type { ButtonTuple, Resolver } from '../util/interfaces.js'
import { ActivityType } from 'premid'
import { ActivityAssets, formatMatch, getPlayerData, getText } from '../util/index.js'

const analysisResolver: Resolver = {
  isActive: pathname => pathname.includes('/analysis') || pathname.includes('/review'),

  getDetails: (t, doc) => {
    if (doc.location.pathname.includes('/review')) {
      return t.game_review
    }
    return t.media_analysis
  },

  getState: (t, doc, displayFormat, hideRating) => {
    const topNode = doc.querySelector('#player-top')
    const bottomNode = doc.querySelector('#player-bottom')

    const top = getPlayerData(topNode as ParentNode)
    const bottom = getPlayerData(bottomNode as ParentNode)

    if (bottom.name || top.name) {
      const state = formatMatch(top, bottom, displayFormat, hideRating, t.vs_separator)
      if (state)
        return state
    }

    if (doc.location.pathname.includes('/review')) {
      const coachMsg = getText(['[data-cy="bot-speech-content-message"]', '.bot-speech-content-content-container'])
      if (coachMsg) {
        return coachMsg.length > 128 ? `${coachMsg.substring(0, 125)}...` : coachMsg
      }
    }

    const whiteStandard = getText(['.board-player-default-white .user-username-component'])
    const blackStandard = getText(['.board-player-default-black .user-username-component'])

    if (whiteStandard && blackStandard) {
      return `${whiteStandard} ${t.vs_separator} ${blackStandard}`
    }

    return undefined
  },

  getType: () => ActivityType.Watching,
  getButtons: (t, doc) => {
    const href = doc.location?.href
    if (!href)
      return undefined
    const cleanUrl = href.split('?')[0] || href
    return [{ label: t.button_view_game, url: cleanUrl }] as ButtonTuple
  },

  getLargeImageKey: () => ActivityAssets.Logo,
  getSmallImageKey: () => ActivityAssets.Analysis,
  getSmallImageText: (t, doc) => {
    if (doc.location.pathname.includes('/review'))
      return t.game_review
    return t.media_analysis
  },
}

export default analysisResolver
