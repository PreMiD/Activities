const presence = new Presence({
  clientId: '1520522633060552746',
})

enum ActivityAssets {
  Logo = 'https://i.imgur.com/TYwcsZL.png',
}

const browsingTimestamp = Math.floor(Date.now() / 1000)

// ---------------------------------------------------------------------------
// Slug → display name helpers
// ---------------------------------------------------------------------------

/**
 * Overrides applied to a full slug OR to individual hyphen-split words.
 * Keys must be lowercase.
 */
const SLUG_DISPLAY: Record<string, string> = {
  // Leagues / organisations
  nfl: 'NFL',
  nba: 'NBA',
  mlb: 'MLB',
  nhl: 'NHL',
  wnba: 'WNBA',
  ncaa: 'NCAA',
  cfl: 'CFL',
  ufl: 'UFL',
  xfl: 'XFL',
  // Combat sports
  mma: 'MMA',
  ufc: 'UFC',
  pfl: 'PFL',
  // Competitions / leagues
  fifa: 'FIFA',
  efl: 'EFL',
  epl: 'EPL',
  mls: 'MLS',
}

/**
 * Sport "container" segments whose sub-segment is the real sport name.
 * e.g. /martial-arts/mma/... → primary label is "MMA", not "Martial Arts".
 */
const SPORT_CONTAINERS = new Set(['martial-arts'])

/**
 * Path segments that carry no meaningful display information and should be
 * suppressed when building the state string.
 * Note: 'futures' and 'props' are intentionally excluded — they are
 * meaningful betting markets (e.g. "NFL · Futures", "NFL · Props").
 */
const NOISE_SEGMENTS = new Set(['bouts', 'results'])

/** Sub-paths under /casino/games/ mapped to display names. */
const CASINO_GAMES_MAP: Record<string, string> = {
  'live-casino': 'Live Casino',
  'table-games-blackjack': 'Blackjack',
  'slots': 'Slots',
  'video-poker': 'Video Poker',
}

/**
 * Converts a URL slug to a human-readable label.
 *
 * Examples:
 *   "mma"              → "MMA"
 *   "wimbledon-women"  → "Wimbledon Women"
 *   "ufc-baku"         → "UFC Baku"
 *   "e-sports-soccer"  → "Esports Soccer"
 *   "pfl-san-diego"    → "PFL San Diego"
 */
function slugToDisplay(slug: string): string {
  if (SLUG_DISPLAY[slug])
    return SLUG_DISPLAY[slug]

  if (slug === 'e-sports')
    return 'Esports'
  if (slug.startsWith('e-sports-'))
    return `Esports ${slugToDisplay(slug.slice('e-sports-'.length))}`

  return slug
    .split('-')
    .map(word => SLUG_DISPLAY[word] ?? (word.charAt(0).toUpperCase() + word.slice(1)))
    .join(' ')
}

// ---------------------------------------------------------------------------
// Page detection
// ---------------------------------------------------------------------------

interface PageDetails {
  details: string
  state?: string
}

/**
 * Builds the Sportsbook details/state from the URL segments that follow
 * the "sportsbook" segment.
 *
 * URL shapes observed on BetOnline:
 *   /sportsbook                                   → Sportsbook
 *   /sportsbook/live                              → Sportsbook · Live Betting
 *   /sportsbook/live/sport/{sport}                → Sportsbook · Live: {Sport}
 *   /sportsbook/live/live-streaming               → Sportsbook · Live Streaming
 *   /sportsbook/{sport}                           → Sportsbook · {Sport}
 *   /sportsbook/{sport}/{league-or-event}         → Sportsbook · {Sport} · {League}
 *   /sportsbook/martial-arts/mma/{event}          → Sportsbook · MMA · {Event}
 *   /sportsbook/boxing/bouts/bouts                → Sportsbook · Boxing  (noise filtered)
 */
function getSportsbookDetails(sub: string[]): PageDetails {
  const first = sub[0]
  if (!first)
    return { details: 'Sportsbook' }

  // ── Live betting ──────────────────────────────────────────────────────────
  if (first === 'live') {
    if (sub[1] === 'live-streaming')
      return { details: 'Sportsbook', state: 'Live Streaming' }
    if (sub[1] === 'sport' && sub[2])
      return { details: 'Sportsbook', state: `Live: ${slugToDisplay(sub[2])}` }
    return { details: 'Sportsbook', state: 'Live Betting' }
  }

  // ── Regular sportsbook ────────────────────────────────────────────────────
  // Determine the primary sport label and which segment index follows it.
  let sportLabel: string
  let afterIdx: number

  if (SPORT_CONTAINERS.has(first) && sub[1]) {
    // e.g. ["martial-arts", "mma", "ufc-baku"] → primary = "MMA", after = index 2
    sportLabel = slugToDisplay(sub[1])
    afterIdx = 2
  }
  else {
    sportLabel = slugToDisplay(first)
    afterIdx = 1
  }

  const nextSlug = sub[afterIdx]

  // No further segment, or the next segment is noise → show sport label only
  if (!nextSlug || NOISE_SEGMENTS.has(nextSlug))
    return { details: 'Sportsbook', state: sportLabel }

  return { details: 'Sportsbook', state: `${sportLabel} · ${slugToDisplay(nextSlug)}` }
}

/**
 * Maps the current URL pathname to the details/state pair shown in Discord.
 */
function getPageDetails(pathname: string): PageDetails {
  // Normalise: strip trailing slash, split into non-empty segments
  const segments = pathname.replace(/\/$/, '').split('/').filter(Boolean)

  if (!segments.length)
    return { details: 'Home' }

  switch (segments[0]) {
    // ── Sportsbook (includes live betting) ─────────────────────────────────
    case 'sportsbook':
      return getSportsbookDetails(segments.slice(1))

    // ── Esports hub ────────────────────────────────────────────────────────
    // The URL does not change when navigating between individual esports
    // markets, so we can only report that the user is on the Esports section.
    // Live esports betting surfaces under /sportsbook/live/sport/e-sports-*
    case 'esports':
      return { details: 'Esports' }

    // ── Casino ─────────────────────────────────────────────────────────────
    // Individual games load via query params (?gameId=…), so we only detect
    // dedicated sub-paths and show plain "Casino" for everything else.
    case 'casino': {
      if (segments[1] === 'games') {
        const game = segments[2] ? CASINO_GAMES_MAP[segments[2]] : undefined
        if (game)
          return { details: 'Casino', state: game }
      }
      return { details: 'Casino', state: segments[1] ? slugToDisplay(segments[1]) : undefined }
    }

    // ── Racebook ────────────────────────────────────────────────────────────
    case 'horse-betting':
    case 'racebook':
      return { details: 'Racebook', state: 'Horse Racing' }

    // ── Poker ────────────────────────────────────────────────────────────────
    case 'poker':
      return { details: 'Poker' }

    // ── Contests / Survivor Pools ─────────────────────────────────────────
    case 'contests':
      return { details: 'Contests' }

    // ── VIP Rewards ──────────────────────────────────────────────────────────
    case 'vip-rewards':
      return { details: 'VIP Rewards' }

    // ── Promotions ───────────────────────────────────────────────────────────
    case 'promotions':
    case 'bonus':
      return { details: 'Promotions' }

    // ── Crypto ───────────────────────────────────────────────────────────────
    case 'crypto': {
      const coin = segments[1]
      return {
        details: 'Crypto',
        state: coin ? `${slugToDisplay(coin)} Gambling` : undefined,
      }
    }

    // Banking, account, help, and info pages are intentionally not labelled
    // specifically — showing "Browsing BetOnline" is less distracting and avoids
    // surfacing private activity (deposits, responsible-gaming, etc.) in a
    // Discord status.
    default:
      return { details: 'Browsing BetOnline' }
  }
}

// ---------------------------------------------------------------------------
// Main update loop
// ---------------------------------------------------------------------------

presence.on('UpdateData', async () => {
  // Default values are used if settings haven't been initialised yet
  // (e.g. first load in developer mode before the extension populates them).
  const [
    showBrowsingStatus = true,
    showTimestamp = true,
    showButtons = false,
  ] = await Promise.all([
    presence.getSetting<boolean>('showBrowsingStatus'),
    presence.getSetting<boolean>('showTimestamp'),
    presence.getSetting<boolean>('showButtons'),
  ])

  const { pathname, href } = document.location

  const presenceData: PresenceData = {
    name: 'BetOnline',
    largeImageKey: ActivityAssets.Logo,
  }

  if (showBrowsingStatus) {
    const { details, state } = getPageDetails(pathname)
    presenceData.details = details
    if (state !== undefined)
      presenceData.state = state
  }

  if (showTimestamp)
    presenceData.startTimestamp = browsingTimestamp

  if (showButtons)
    presenceData.buttons = [{ label: 'View on BetOnline', url: href }]

  if (presenceData.details !== undefined)
    presence.setActivity(presenceData)
  else
    presence.clearActivity()
})
