export const presence = new Presence({
  clientId: '699204548664885279',
})

export enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/C/Chess.com/assets/0.png',
  Statistics = 'https://cdn.rcd.gg/PreMiD/websites/C/Chess.com/assets/1.png',
  GamesArchive = 'https://cdn.rcd.gg/PreMiD/websites/C/Chess.com/assets/2.png',
  Daily = 'https://cdn.rcd.gg/PreMiD/websites/C/Chess.com/assets/3.png',
  Computer = 'https://cdn.rcd.gg/PreMiD/websites/C/Chess.com/assets/4.png',
  FourPC = 'https://cdn.rcd.gg/PreMiD/websites/C/Chess.com/assets/5.png',
  Variants = 'https://cdn.rcd.gg/PreMiD/websites/C/Chess.com/assets/6.png',
  Puzzle = 'https://cdn.rcd.gg/PreMiD/websites/C/Chess.com/assets/7.png',
  PuzzleRush = 'https://cdn.rcd.gg/PreMiD/websites/C/Chess.com/assets/8.png',
  Analysis = 'https://cdn.rcd.gg/PreMiD/websites/C/Chess.com/assets/9.png',
  Lessons = 'https://cdn.rcd.gg/PreMiD/websites/C/Chess.com/assets/10.png',
  TV = 'https://cdn.rcd.gg/PreMiD/websites/C/Chess.com/assets/11.png',
  Bullet = 'https://cdn.rcd.gg/PreMiD/websites/C/Chess.com/assets/12.png',
  Blitz = 'https://cdn.rcd.gg/PreMiD/websites/C/Chess.com/assets/13.png',
  Rapid = 'https://cdn.rcd.gg/PreMiD/websites/C/Chess.com/assets/14.png',
  IconPlay = 'https://cdn.rcd.gg/PreMiD/websites/C/Chess.com/assets/15.png',
  IconPause = 'https://cdn.rcd.gg/PreMiD/websites/C/Chess.com/assets/16.png',
  WhiteKing = 'https://cdn.rcd.gg/PreMiD/websites/C/Chess.com/assets/17.png',
  BlackKing = 'https://cdn.rcd.gg/PreMiD/websites/C/Chess.com/assets/18.png',
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
