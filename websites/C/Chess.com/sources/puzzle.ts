import type { Resolver } from '../util/interfaces.js'
import { ActivityAssets, getText } from '../util/index.js'

const puzzleResolver: Resolver = {
  isActive: pathname => pathname.includes('/puzzles'),

  getDetails: (t, doc, lang) => {
    if (doc.location.pathname.includes('/rush')) {
      if (doc.querySelector('[data-cy="startSession"]')) {
        return t.puzzle_rush
      }

      const icon3Min = doc.querySelector('svg[data-glyph="game-time-blitz"]')
      const icon5Min = doc.querySelector('svg[data-glyph="game-time-rapid"]')

      const getDuration = (minutes: number) => {
        const IntlAny = Intl as any
        if (lang && IntlAny.DurationFormat) {
          return new IntlAny.DurationFormat(lang, { style: 'narrow' }).format({ minutes })
        }
        return `${minutes} ${t.min}`
      }

      if (icon3Min)
        return `${t.puzzle_rush} (${getDuration(3)})`
      if (icon5Min)
        return `${t.puzzle_rush} (${getDuration(5)})`
      return `${t.puzzle_rush} (${t.survival})`
    }

    if (doc.location.pathname.includes('/battle')) {
      return t.puzzle_battle
    }

    return t.puzzle_solving
  },

  getState: (t, doc) => {
    if (doc.location.pathname.includes('/rush')) {
      if (doc.querySelector('[data-cy="startSession"]'))
        return t.common_menu
      const score = getText(['[data-cy="solved-count"]'])
      return score ? `${t.score}: ${score}` : `${t.score}: 0`
    }

    if (doc.location.pathname.includes('/battle')) {
      const scores = doc.querySelectorAll('.battle-player-details-playing-score')

      const myScoreEl = scores[0]
      const opponentScoreEl = scores[1]

      if (myScoreEl && opponentScoreEl) {
        const myScore = myScoreEl.textContent?.trim() || '0'
        const opponentScore = opponentScoreEl.textContent?.trim() || '0'
        return `${t.score}: ${myScore} - ${opponentScore}`
      }

      return t.common_menu
    }

    const rating = getText([
      '[data-cy="path-points"]',
      '.puzzle-rating-component',
      '.ui-label-item-value',
      '.rating-score',
    ])
    const level = getText(['.puzzle-tier-icon-level', '[data-cy^="level-"]'])

    if (rating) {
      if (level)
        return `${t.level} ${level} • ${rating}`
      return `${t.rating}: ${rating}`
    }
    return undefined
  },

  getLargeImageKey: (t, doc) => {
    if (doc.location.pathname.includes('/rush'))
      return ActivityAssets.PuzzleRush
    if (doc.location.pathname.includes('/battle'))
      return ActivityAssets.PuzzleRush

    return ActivityAssets.Logo
  },

  getSmallImageKey: (t, doc) => {
    if (doc.location.pathname.includes('/rush') || doc.location.pathname.includes('/battle')) {
      return ActivityAssets.Logo
    }
    return ActivityAssets.Puzzle
  },

  getSmallImageText: t => t.puzzle_tactics,
}

export default puzzleResolver
