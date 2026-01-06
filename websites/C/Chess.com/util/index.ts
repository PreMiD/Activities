import { ActivityType } from 'premid';

// La classe Presence est globale, pas besoin de l'importer.
export const presence = new Presence({
  clientId: '699204548664885279',
});

export enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/C/Chess/assets/logo.png',
  Statistics = 'https://cdn.rcd.gg/PreMiD/websites/C/Chess/assets/0.png',
  GamesArchive = 'https://cdn.rcd.gg/PreMiD/websites/C/Chess/assets/1.png',
  Daily = 'https://cdn.rcd.gg/PreMiD/websites/C/Chess/assets/2.png',
  Computer = 'https://cdn.rcd.gg/PreMiD/websites/C/Chess/assets/3.png',
  FourPC = 'https://cdn.rcd.gg/PreMiD/websites/C/Chess/assets/4.png',
  Variants = 'https://cdn.rcd.gg/PreMiD/websites/C/Chess/assets/5.png',
  Puzzle = 'https://cdn.rcd.gg/PreMiD/websites/C/Chess/assets/19.png',
  PuzzleRush = 'https://cdn.rcd.gg/PreMiD/websites/C/Chess/assets/20.png',
  Analysis = 'https://cdn.rcd.gg/PreMiD/websites/C/Chess/assets/26.png',
  Lessons = 'https://cdn.rcd.gg/PreMiD/websites/C/Chess/assets/25.png',
  TV = 'https://cdn.rcd.gg/PreMiD/websites/C/Chess/assets/38.png',
  Bullet = 'https://i.imgur.com/7Lk1sdL.png',
  Blitz = 'https://i.imgur.com/BGIwR1E.png',
  Rapid = 'https://i.imgur.com/GKFT3rk.png',
  IconPlay = 'hhttps://i.imgur.com/DYQRYll.png',
  IconPause = 'https://i.imgur.com/FsGA414.png',
  WhiteKing = 'https://i.imgur.com/ZP7zJTy.png',
  BlackKing = 'https://i.imgur.com/C8AzwmP.png',
}

export interface PlayerData {
  name: string | null;
  rating: string | null;
}

export function getText(selectors: string[], parent: ParentNode = document): string | null {
  for (const selector of selectors) {
    const element = parent.querySelector(selector);
    if (element && element.textContent) {
      return element.textContent.trim();
    }
  }
  return null;
}

export function cleanRating(text: string | null): string {
  if (!text) return 'Unknown';
  return text.replace(/[()]/g, '').trim();
}

export function getPlayerData(container: ParentNode | null): PlayerData {
  if (!container) return { name: null, rating: null };

  const name = getText([
      '[data-test-element="user-tagline-username"]', 
      '.user-username-component',
      '.cc-user-username-white'
  ], container);

  const ratingRaw = getText([
      '[data-cy="user-tagline-rating"]', 
      '.user-tagline-rating', 
      '.cc-user-rating-white'
  ], container);

  return { name, rating: ratingRaw ? cleanRating(ratingRaw) : null };
}

export function formatMatch(top: PlayerData, bottom: PlayerData, format: number = 0, hideRating: boolean = false): string | undefined {
    const formatPlayer = (p: PlayerData) => {
        const name = p.name || undefined; 
        if (!name) return undefined;
        return (p.rating && !hideRating) ? `${name} (${p.rating})` : name;
    };

    if (!top.name && !bottom.name) return undefined;

    if (format === 2) {
        return bottom.name ? formatPlayer(bottom) : undefined;
    }

    if (format === 1) {
        if (top.name && bottom.name) {
            return `${formatPlayer(bottom)} vs ${formatPlayer(top)}`;
        }
    }

    if (top.name) {
        return `Vs ${formatPlayer(top)}`;
    }

    if (bottom.name) {
        return formatPlayer(bottom);
    }

    return undefined;
}

// === FONCTIONS PARTAGÉES ===

export function hasPlayerControls(doc: Document): boolean {
    return !!doc.querySelector([
        '.resign-button-component', 
        '[data-cy="resign-button"]', 
        '.draw-button-component',
        'button[data-cy="abort-button"]',
        '.abort-button-component',
        '.daily-game-footer-component'
    ].join(','));
}

export function getGameMode(doc: Document): string | null {
    // Sélecteur combiné pour couvrir tous les cas (Play et Game)
    const modeEl = doc.querySelector('.player-component [rating-type], .cc-user-block-component[rating-type], [rating-type]');
    if (!modeEl) return null;
    
    const raw = modeEl.getAttribute('rating-type');
    return raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : null;
}