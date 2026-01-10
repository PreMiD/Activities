import type { Resolver } from '../util/interfaces.js'
import { ActivityAssets, cleanRating } from '../util/index.js'

const computerResolver: Resolver = {
  isActive: pathname => pathname.includes('/play/computer') || pathname.includes('/play/coach'),

  getDetails: t => t.computer_vs,

  getState: (t, doc, _, hideRating) => {
    const nameEl = doc.querySelector('[data-test-element="user-tagline-username"]')
    const name = nameEl?.textContent?.trim()

    if (!name)
      return t.computer_selecting

    const ratingEl = doc.querySelector('[data-cy="user-tagline-rating"]')
    const rating = ratingEl?.textContent ? cleanRating(ratingEl.textContent) : null

    return (rating && !hideRating) ? `${name} (${rating})` : name
  },

  getLargeImageKey: (t, doc) => {
    const img = doc.querySelector<HTMLImageElement>('img[data-cy="avatar"]')

    if (img && img.src && !img.src.includes('svg') && !img.src.includes('transparent')) {
      return img.src
    }

    return ActivityAssets.Logo
  },

  getSmallImageKey: (t, doc) => {
    const board = doc.querySelector('chess-board') || doc.querySelector('.board')
    const isFlipped = board?.classList.contains('flipped')

    return isFlipped ? ActivityAssets.BlackKing : ActivityAssets.WhiteKing
  },

  getSmallImageText: (t, doc) => {
    const board = doc.querySelector('chess-board') || doc.querySelector('.board')
    const isFlipped = board?.classList.contains('flipped')
    return isFlipped ? t.playing_as_black : t.playing_as_white
  },
}

export default computerResolver
