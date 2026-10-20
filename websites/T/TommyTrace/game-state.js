const HOME = 'https://tommytrace.com/';
const REGIONS = { world: 'World', malaysia: 'Malaysia', sabah: 'Sabah' };

function visible(element) {
  if (!element) return false;
  for (let current = element; current; current = current.parentElement) {
    if (current.hidden || current.classList.contains('hidden') || current.getAttribute('aria-hidden') === 'true') return false;
    if (current.classList.contains('screen') && !current.classList.contains('active')) return false;
  }
  return true;
}

function text(document, id) {
  return document.getElementById(id)?.textContent?.trim() || '';
}

function regionFrom(value) {
  const key = String(value).toLowerCase().match(/\b(world|malaysia|sabah)\b/)?.[1];
  return key ? REGIONS[key] : '';
}

function modeFrom(badge) {
  if (/\bTUTORIAL\b/i.test(badge)) return 'Learning to play';
  if (/\bDAILY CHALLENGE\b/i.test(badge)) return 'Daily Challenge';
  if (/\bFRIEND CHALLENGE\b/i.test(badge)) return 'Friend Challenge';
  if (/\bFRIENDLY DUEL\b/i.test(badge)) return 'Friendly Duel';
  if (/\bDUEL\b/i.test(badge)) return 'Ranked Duel';
  if (/\bMULTIPLAYER\b/i.test(badge)) return 'Private Multiplayer';
  return 'Solo Expedition';
}

function roundFrom(value) {
  const match = value.match(/^\s*([1-5])\s*\/\s*5\s*$/);
  return match ? `Round ${Number(match[1])} of 5` : 'In a round';
}

/**
 * Read only the game's public UI labels. Never inspect Street View, Google Maps,
 * account state, storage, lobby codes, chat, location answers or URL parameters.
 * A fresh payload on every update prevents old lobby fields surviving a match.
 */
export function createPresenceData(document, url, startedAt, options = {}) {
  if (url.protocol !== 'https:' || !['tommytrace.com', 'www.tommytrace.com'].includes(url.hostname)) return null;
  if (!['/', '/index.html'].includes(url.pathname)) return null;

  const screen = [...document.querySelectorAll('.screen.active')].find(visible);
  if (!screen) return null;
  let details;
  let state;
  let party;

  if (screen.id === 'menuScreen') {
    if (visible(document.getElementById('dailyHubModal'))) {
      details = 'Daily Challenge';
      state = 'Viewing the Daily Hub';
    } else if (visible(document.getElementById('playSetupModal'))) {
      const selected = document.querySelector('#playSetupModal [data-region].active');
      const region = REGIONS[selected?.getAttribute('data-region')];
      details = ['Solo Expedition', region].filter(Boolean).join(' · ');
      state = 'Choosing a game';
    } else {
      details = 'Main menu';
      state = 'Choosing a game';
    }
  } else if (screen.id === 'lobbyScreen') {
    // The rendered label is kept in sync for both hosts and guests. A hidden
    // region select can retain a default value, so it is not authoritative.
    details = ['Private Multiplayer', regionFrom(text(document, 'lobbyRegion'))].filter(Boolean).join(' · ');
    state = 'In lobby';
    const rawCount = text(document, 'lobbyPlayerCount');
    const count = /^\d+$/.test(rawCount) ? Number(rawCount) : 0;
    if (count >= 1 && count <= 4) {
      state = `In lobby · ${count} of 4 players`;
      // PreMiD 2.14+: native Discord party badge. No room ID is disclosed.
      party = { partySize: count, maxPartySize: 4 };
    }
  } else if (screen.id === 'duelScreen') {
    details = 'Ranked Duel';
    const matched = screen.classList.contains('duel-match-found-unified-mode')
      || screen.querySelector('.duel-shell')?.classList.contains('duel-match-found-unified-mode');
    state = matched ? 'Opponent found' : 'Finding an opponent';
  } else if (screen.id === 'multiplayerScreen') {
    details = 'Private Multiplayer';
    state = 'Creating or joining a lobby';
  } else if (['gameScreen', 'resultScreen', 'finalScreen', 'mpResultScreen', 'mpFinalScreen'].includes(screen.id)) {
    const badge = text(document, 'modeBadge');
    let mode = modeFrom(badge);
    if (['mpResultScreen', 'mpFinalScreen'].includes(screen.id) && mode === 'Solo Expedition') mode = 'Private Multiplayer';
    const region = mode === 'Learning to play' ? '' : regionFrom(badge);
    details = [mode, region].filter(Boolean).join(' · ');
    if (screen.id === 'mpFinalScreen') state = 'Match complete';
    else if (screen.id === 'finalScreen') state = mode === 'Daily Challenge' || mode === 'Friend Challenge' ? 'Challenge complete' : 'Expedition complete';
    else if (mode === 'Learning to play') state = 'Practice round';
    else {
      state = roundFrom(text(document, 'roundText'));
      if (['resultScreen', 'mpResultScreen'].includes(screen.id)) state += ' · Viewing results';
    }
  } else return null;

  return {
    name: 'TommyTrace',
    type: 0,
    details,
    state,
    largeImageKey: `${HOME}favicon.png`,
    ...(party ? { party } : {}),
    ...(options.showTimestamp !== false ? { startTimestamp: startedAt } : {}),
  };
}
