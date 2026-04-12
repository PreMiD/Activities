import type { Resolver } from '../util/interfaces.js'
import { ActivityType } from 'premid'
import { ActivityAssets } from '../util/index.js'

const variantsResolver: Resolver = {
  isActive: pathname => pathname.includes('/variants'),

  getDetails: (t, doc) => {
    const path = doc.location.pathname
    const parts = path.split('/').filter(p => p)

    const variantKey = parts.find(p => p !== 'variants' && p !== 'live' && p !== 'play' && p !== 'game')

    let variantName = t.variants_menu

    if (variantKey) {
      const cleanName = variantKey
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')

      variantName = `${t.variants_menu}: ${cleanName}`
    }

    const isUrlAnalysis = parts.length > 4 && parts.includes('game')
    if (isUrlAnalysis) {
      return variantName
    }

    const isGameOverHTML = !!doc.querySelector([
      '.game-over-modal',
      '.game-result-component',
      '.game-over-message-component',
      '.game-rate-sport-message-component',
      '.game-buttons-container-component',
      'button[data-cy="rematch-button"]',
    ].join(','))

    if (isGameOverHTML) {
      return `${variantName} - ${t.media_finished}`
    }

    return variantName
  },

  getState: (t, doc) => {
    const parts = doc.location.pathname.split('/').filter(p => p)
    if (parts.length > 4 && parts.includes('game')) {
      return t.game_reviewing
    }

    const resultEl = doc.querySelector('.game-over-modal-header, .game-result-component, .game-over-message-component strong')
    if (resultEl) {
      return resultEl.textContent?.trim() || t.game_over
    }

    const isFinished = !!doc.querySelector([
      '.game-buttons-container-component',
      '.game-rate-sport-message-component',
      'button[data-cy="rematch-button"]',
    ].join(','))

    if (isFinished) {
      return t.game_over
    }

    if (doc.querySelector('.playerbox-clock, .clock-component')) {
      return t.play
    }

    return t.common_menu
  },

  getType: (t, doc) => {
    const parts = doc.location.pathname.split('/').filter(p => p)

    if (parts.length > 4 && parts.includes('game')) {
      return ActivityType.Watching
    }

    const isGameOver = !!doc.querySelector([
      '.game-over-modal',
      '.game-result-component',
      '.game-over-message-component',
      '.game-rate-sport-message-component',
      '.game-buttons-container-component',
      'button[data-cy="rematch-button"]',
    ].join(','))

    const hasClock = !!doc.querySelector('.playerbox-clock, .clock-component')

    if (hasClock && !isGameOver)
      return ActivityType.Playing

    return ActivityType.Watching
  },

  getButtons: (t, doc) => {
    if (doc.location.pathname.includes('/game/')) {
      const parts = doc.location.href.split('/')
      const gameIndex = parts.indexOf('game')

      if (gameIndex !== -1 && parts[gameIndex + 1]) {
        const cleanUrl = parts.slice(0, gameIndex + 2).join('/')
        return [{ label: t.button_view_game, url: cleanUrl }]
      }
    }
    return undefined
  },

  getLargeImageKey: () => ActivityAssets.Variants,
  getSmallImageKey: () => ActivityAssets.Logo,
  getSmallImageText: t => t.variants_menu,
}

export default variantsResolver
