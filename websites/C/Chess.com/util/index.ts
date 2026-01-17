export const presence = new Presence({
  clientId: '699204548664885279',
})

export enum ActivityAssets {
  Logo = 'https://i.imgur.com/gvzQPV7.png',
  Statistics = 'https://i.imgur.com/Ea3sTPD.png',
  GamesArchive = 'https://i.imgur.com/3MhMFdF.png',
  Daily = 'https://i.imgur.com/O9GkttW.png',
  Computer = 'https://i.imgur.com/v4dGVx2.png',
  FourPC = 'https://i.imgur.com/QuY5QRU.png',
  Variants = 'https://i.imgur.com/On8TNaJ.png',
  Puzzle = 'https://i.imgur.com/mRKagoX.png',
  PuzzleRush = 'https://i.imgur.com/A931dHG.png',
  Analysis = 'https://i.imgur.com/HeDh1BE.png',
  Lessons = 'https://i.imgur.com/4V7r0tB.png',
  TV = 'https://i.imgur.com/Xq5IOrC.png',
  Bullet = 'https://i.imgur.com/7Lk1sdL.png',
  Blitz = 'https://i.imgur.com/BGIwR1E.png',
  Rapid = 'https://i.imgur.com/GKFT3rk.png',
  IconPlay = 'https://i.imgur.com/DYQRYll.png',
  IconPause = 'https://i.imgur.com/FsGA414.png',
  WhiteKing = 'https://i.imgur.com/ZP7zJTy.png',
  BlackKing = 'https://i.imgur.com/C8AzwmP.png',
}

export interface PlayerData {
  name: string | null
  rating: string | null
}

export function getText(selectors: string[], parent: ParentNode = document): string | null {
  for (const selector of selectors) {
    const element = parent.querySelector(selector)
    if (element && element.textContent) {
      return element.textContent.trim()
    }
  }
  return null
}

export function cleanRating(text: string | null): string {
  if (!text)
    return ''
  return text.replace(/[()]/g, '').trim()
}

export function getPlayerData(container: ParentNode | null): PlayerData {
  if (!container)
    return { name: null, rating: null }

  const name = getText([
    '[data-test-element="user-tagline-username"]',
    '.user-username-component',
    '.cc-user-username-white',
  ], container)

  const ratingRaw = getText([
    '[data-cy="user-tagline-rating"]',
    '.user-tagline-rating',
    '.cc-user-rating-white',
  ], container)

  return { name, rating: ratingRaw ? cleanRating(ratingRaw) : null }
}

export function formatMatch(top: PlayerData, bottom: PlayerData, format: number = 0, hideRating: boolean = false, vsString: string = 'vs'): string | undefined {
  const formatPlayer = (p: PlayerData) => {
    const name = p.name || undefined
    if (!name)
      return undefined
    return (p.rating && !hideRating) ? `${name} (${p.rating})` : name
  }

  if (!top.name && !bottom.name)
    return undefined

  if (format === 2) {
    return bottom.name ? formatPlayer(bottom) : undefined
  }

  if (format === 1) {
    if (top.name && bottom.name) {
      return `${formatPlayer(bottom)} ${vsString} ${formatPlayer(top)}`
    }
  }

  if (top.name) {
    return `${vsString.charAt(0).toUpperCase() + vsString.slice(1)} ${formatPlayer(top)}`
  }

  if (bottom.name) {
    return formatPlayer(bottom)
  }

  return undefined
}

export function hasPlayerControls(doc: Document): boolean {
  return !!doc.querySelector([
    '.resign-button-component',
    '[data-cy="resign-button"]',
    '.draw-button-component',
    'button[data-cy="abort-button"]',
    '.abort-button-component',
    '.daily-game-footer-component',
  ].join(','))
}

export function getGameMode(doc: Document): string | null {
  const modeEl = doc.querySelector('.player-component [rating-type], .cc-user-block-component[rating-type], [rating-type]')
  if (!modeEl)
    return null

  const raw = modeEl.getAttribute('rating-type')
  return raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : null
}
