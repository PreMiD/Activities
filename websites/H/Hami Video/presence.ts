import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1394513095367463043',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/H/Hami%20Video/assets/logo.png',
}

enum ContentType {
  Movie = 'movie',
  Series = 'series',
  Anime = 'anime',
  Documentary = 'documentary',
  Kids = 'kids',
  Variety = 'variety',
  SportsLive = 'sportsLive',
  SportsReplay = 'sportsReplay',
  // Live /channel/ pages that aren't a sports broadcast — Hami Video uses
  // /channel/ for every TV channel (cartoons, news, movies, variety, kids,
  // sports, etc.), not just sports, so this is the generic fallback for
  // "live channel, not sports".
  TV = 'tv',
  Unknown = 'unknown',
}

enum SportType {
  Baseball = 'baseball',
  Basketball = 'basketball',
  Formula1 = 'formula1',
  MotorcycleRacing = 'motorcycleRacing',
  MMA = 'mma',
  Badminton = 'badminton',
  Golf = 'golf',
  Football = 'football',
  AmericanFootball = 'americanFootball',
  IceHockey = 'iceHockey',
  Tennis = 'tennis',
  Volleyball = 'volleyball',
  Esports = 'esports',
  Unknown = 'unknown',
}

/**
 * ===========================================================================
 * Rich Presence flicker prevention
 * ===========================================================================
 * `setActivity`/`clearActivity` calls are cheap to *call* but each one still
 * causes a visible refresh of the Discord status. `UpdateData` can fire many
 * times per second (DOM mutations, timers, etc.), so we only forward a call
 * to the SDK when the serialized payload actually changed since last time.
 */
let lastSnapshot = ''

function setActivityIfChanged(data: PresenceData): void {
  const snapshot = JSON.stringify(data)
  if (snapshot !== lastSnapshot) {
    lastSnapshot = snapshot
    presence.setActivity(data)
  }
}

function clearActivityAndReset(): void {
  // Reset the snapshot so that the *next* setActivity call (even if it is
  // identical to whatever was showing before clearActivity) is not
  // incorrectly swallowed as a "no change" no-op.
  lastSnapshot = ''
  presence.clearActivity()
}

/**
 * ===========================================================================
 * Player access
 * ===========================================================================
 * All direct access to the `<video>` element is funneled through this
 * function. Hami Video currently renders its player inline in the page, but
 * isolating this lookup means that if the player ever moves into an iframe,
 * only this function (and the future iframe bridge it would call into)
 * needs to change — the rest of the file can stay untouched.
 */
function getVideoElement(): HTMLVideoElement | null {
  // TODO(iframe support): if Hami Video moves to an iframe-based player,
  // this is the seam to swap in a `contentWindow`/`postMessage` lookup.
  return document.querySelector<HTMLVideoElement>('video')
}

/**
 * Best-effort lookup of a dotted path on `window` (e.g.
 * `myPlayer.cast.currentMediaTitle`), used as a fallback when the page
 * variable bridge doesn't have a value. Never throws — any failure (missing
 * segment, non-object intermediate value, etc.) simply resolves to
 * `undefined` so callers can keep falling back to DOM/meta lookups.
 */
function readWindowPath<T>(path: string): T | undefined {
  try {
    let current: unknown = window as unknown as Record<string, unknown>
    for (const segment of path.split('.')) {
      if (current === null || typeof current !== 'object')
        return undefined
      current = (current as Record<string, unknown>)[segment]
    }
    return current as T | undefined
  }
  catch {
    return undefined
  }
}

/**
 * `getPageVariable` is only ever called with a single key at a time, per
 * variable, as it is used across the current Activities repository.
 *
 * Robustness: if the page-variable bridge doesn't have the value (returns
 * `undefined`), we fall back to reading the same dotted path directly off
 * `window`, since some Hami Video player builds expose the identical data
 * as a plain global instead of (or in addition to) the bridge. This never
 * throws — a missing value just flows through as `undefined`, same as
 * before, so every existing call site's own DOM/meta fallback chain still
 * behaves exactly as it did.
 */
async function getPageVar<T = string>(key: string): Promise<T | undefined> {
  const data = await presence.getPageVariable<Record<string, T>>(key)
  const value = data?.[key]
  if (value !== undefined)
    return value

  return readWindowPath<T>(key)
}

function getElement(query: string): string | undefined {
  const text = document.querySelector(query)?.textContent
  return text?.trim() || undefined
}

function getAttr(query: string, attribute: string): string | undefined {
  const value = document.querySelector(query)?.getAttribute(attribute)
  return value?.trim() || undefined
}

/**
 * `_vod_category` / `_vod_subcategory` fall back to OpenGraph/meta tags
 * when the page variable is missing, so classification degrades gracefully
 * instead of silently landing on `Unknown`.
 */
async function getVodCategory(): Promise<string | undefined> {
  return (
    (await getPageVar<string>('_vod_category'))
    ?? getAttr('meta[property="article:section"]', 'content')
    ?? getAttr('meta[property="video:tag"]', 'content')
  )
}

async function getVodSubcategory(): Promise<string | undefined> {
  return (
    (await getPageVar<string>('_vod_subcategory'))
    ?? getAttr('meta[property="video:tag"]', 'content')
  )
}

async function getStrings() {
  return presence.getStrings({
    playing: 'general.playing',
    paused: 'general.paused',
    live: 'general.live',
    season: 'general.season',
    episode: 'general.episode',
    watchingMovie: 'hamivideo.watchingMovie',
    watchingSeries: 'hamivideo.watchingSeries',
    watchingAnime: 'hamivideo.watchingAnime',
    watchingDocumentary: 'hamivideo.watchingDocumentary',
    watchingKids: 'hamivideo.watchingKids',
    watchingVariety: 'hamivideo.watchingVariety',
    watchingSportsLive: 'hamivideo.watchingSportsLive',
    watchingSportsReplay: 'hamivideo.watchingSportsReplay',
    watchingTV: 'hamivideo.watchingTV',
    watchingBaseball: 'hamivideo.watchingBaseball',
    watchingBasketball: 'hamivideo.watchingBasketball',
    watchingFormula1: 'hamivideo.watchingFormula1',
    watchingMotorcycleRacing: 'hamivideo.watchingMotorcycleRacing',
    watchingMMA: 'hamivideo.watchingMMA',
    watchingBadminton: 'hamivideo.watchingBadminton',
    watchingGolf: 'hamivideo.watchingGolf',
    watchingFootball: 'hamivideo.watchingFootball',
    watchingAmericanFootball: 'hamivideo.watchingAmericanFootball',
    watchingIceHockey: 'hamivideo.watchingIceHockey',
    watchingTennis: 'hamivideo.watchingTennis',
    watchingVolleyball: 'hamivideo.watchingVolleyball',
    watchingEsports: 'hamivideo.watchingEsports',
    liveEventFallback: 'hamivideo.liveEventFallback',
    browsingCategory: 'hamivideo.browsingCategory',
    browsingAnime: 'hamivideo.browsingAnime',
    searching: 'hamivideo.searching',
    watchButton: 'hamivideo.watchButton',
    watchEpisodeButton: 'hamivideo.watchEpisodeButton',
    viewSeriesButton: 'hamivideo.viewSeriesButton',
    watchLiveButton: 'hamivideo.watchLiveButton',
    watchReplayButton: 'hamivideo.watchReplayButton',
  })
}

type Strings = Awaited<ReturnType<typeof getStrings>>

/**
 * Best-effort category classifier. Hami Video exposes `_vod_category` /
 * `_vod_subcategory` as short Traditional Chinese labels (and sometimes
 * English codes) on the page's global player state; this keyword match is
 * intentionally loose so minor label wording changes on the site don't
 * silently break classification. Verify these keywords against the live
 * site's current category labels before submitting the PR.
 */
function classifyContentType(category: string, subcategory: string, isLive: boolean): ContentType {
  const haystack = `${category} ${subcategory}`.toLowerCase()
  const has = (...needles: string[]) => needles.some(needle => haystack.includes(needle))

  if (has('運動', 'sport', 'sports'))
    return isLive ? ContentType.SportsLive : ContentType.SportsReplay
  if (has('動漫', '動畫', 'anime', 'cartoon'))
    return ContentType.Anime
  if (has('紀錄', '記錄', 'documentary'))
    return ContentType.Documentary
  if (has('兒童', '親子', 'kids', 'children'))
    return ContentType.Kids
  if (has('綜藝', 'variety'))
    return ContentType.Variety
  if (has('影集', '戲劇', '劇集', 'series', 'drama', 'tv'))
    return ContentType.Series
  if (has('電影', 'movie', 'film'))
    return ContentType.Movie

  return ContentType.Unknown
}

/**
 * Hami Video does not reliably set the `isLive` page variable on every live
 * broadcast, and neither category labels nor a single DOM selector are
 * stable across site changes. Every signal below is combined with OR so
 * that any one of them firing is enough to classify the page as live — this
 * deliberately biases toward SportsLive over SportsReplay, since showing a
 * live match as a "replay" is a worse failure than the reverse.
 */
function detectIsLive(
  pageIsLive: boolean | undefined,
  pathname: string,
  documentTitle: string,
  metaDescription: string,
  ogDescription: string,
): boolean {
  // 1. Official page variable
  if (pageIsLive)
    return true
  // 2. URL pattern
  if (/\/channel\//i.test(pathname) || /\/OTT_LIVE_/i.test(pathname))
    return true
  // 3. Document title marker
  if (documentTitle.includes('Live直播'))
    return true
  // 4. Meta description contains LIVE
  if (/\bLIVE\b/i.test(metaDescription))
    return true
  // 5. OpenGraph description contains LIVE
  if (/\bLIVE\b/i.test(ogDescription))
    return true
  // 6. Meta description starts with a channel name followed by LIVE
  //    (e.g. "HAMI大聯盟1台 LIVE MLB 海盜 VS 紅人"). Overlaps with #4/#5 in
  //    most cases, kept as an explicit, documented fallback for pages where
  //    "LIVE" only appears once, right after the channel name.
  if (/^\S.*\bLIVE\b/i.test(metaDescription) || /^\S.*\bLIVE\b/i.test(ogDescription))
    return true

  return false
}

/**
 * Audio-track / language suffixes that Hami Video appends to live event
 * titles (e.g. "海盜 VS 紅人(原音)"). These carry no information for a
 * Discord status and are stripped before display. Extend this list if the
 * site adds more language tags.
 */
const AUDIO_SUFFIX_REGEX = /[(（](?:原音|中文|雙語|國語|台語|日語|英語|轉播)[)）]/g

function stripAudioSuffix(text: string): string {
  return text.replace(AUDIO_SUFFIX_REGEX, '').replace(/\s{2,}/g, ' ').trim()
}

/**
 * Live meta descriptions follow the pattern `{channel} LIVE {event}`, e.g.
 * "HAMI大聯盟1台 LIVE MLB 海盜 VS 紅人(原音)". Splitting at the first
 * standalone "LIVE" token separates the channel name (not useful to show,
 * since it's redundant with "Watching <Sport>") from the actual event text,
 * which is further broken down into league + event by
 * `extractLeagueAndEvent`.
 */
function parseLiveDescription(raw: string | undefined): { channel?: string, event?: string } {
  if (!raw)
    return {}

  const cleaned = stripAudioSuffix(raw)
  const liveMatch = cleaned.match(/\bLIVE\b/i)

  if (!liveMatch || liveMatch.index === undefined)
    return { channel: cleaned || undefined, event: undefined }

  const channel = cleaned.slice(0, liveMatch.index).trim() || undefined
  const event = cleaned.slice(liveMatch.index).trim() || undefined

  return { channel, event }
}

interface LiveEventInfo {
  league?: string
  event?: string
}

/**
 * League label -> matcher keywords (Traditional Chinese and English), used
 * by `extractLeagueAndEvent` to pull a clean league name (e.g. "MLB") out of
 * an already-"LIVE"-stripped event string, leaving the rest (e.g.
 * "海盜 VS 紅人") as the event text. Order matters where one league's
 * keyword could be a substring of another's; none currently collide.
 */
const LEAGUE_KEYWORDS: [string, string[]][] = [
  ['MLB', ['mlb']],
  ['CPBL', ['cpbl', '中華職棒']],
  ['NBA', ['nba']],
  ['WNBA', ['wnba']],
  ['Premier League', ['premier league']],
  ['LaLiga', ['laliga', 'la liga']],
  ['Serie A', ['serie a']],
  ['Bundesliga', ['bundesliga']],
  ['Champions League', ['champions league']],
  ['F1', ['f1', 'formula 1', 'formula1']],
  ['MotoGP', ['motogp']],
  ['UFC', ['ufc']],
  ['ATP', ['atp']],
  ['WTA', ['wta']],
  ['PGA', ['pga']],
  ['LPGA', ['lpga']],
  ['BWF', ['bwf']],
  ['NFL', ['nfl']],
  ['NHL', ['nhl']],
  ['Esports', ['esports', '電競']],
]

/**
 * Splits an already-"LIVE"-stripped event string like "MLB 海盜 VS 紅人"
 * into `{ league: 'MLB', event: '海盜 VS 紅人' }`. If no known league
 * keyword is found, the whole string is returned as `event` with no
 * `league` — this deliberately avoids showing a league label the source
 * text never actually contained (e.g. a bare "LIVE Belgian GP" description
 * with no explicit "F1" token stays as `event: 'Belgian GP'` only).
 */
function extractLeagueAndEvent(rawEvent: string | undefined): LiveEventInfo {
  if (!rawEvent)
    return {}

  const withoutLivePrefix = rawEvent.replace(/^\s*LIVE\s*/i, '').trim()
  const haystack = withoutLivePrefix.toLowerCase()

  for (const [league, needles] of LEAGUE_KEYWORDS) {
    const matchedNeedle = needles.find(needle => haystack.includes(needle))
    if (!matchedNeedle)
      continue

    const needleIndex = haystack.indexOf(matchedNeedle)
    const before = withoutLivePrefix.slice(0, needleIndex)
    const after = withoutLivePrefix.slice(needleIndex + matchedNeedle.length)
    const event = `${before}${after}`.replace(/^[\s.,:·-]+|[\s.,:·-]+$/g, '').trim() || undefined

    return { league, event }
  }

  return { event: withoutLivePrefix || undefined }
}

/**
 * Loose, best-effort sport classifier over any combination of the parsed
 * live event text, channel name, category fields, and title. Matching is
 * intentionally case-insensitive substring matching (mirroring
 * `classifyContentType`), and supports both Traditional Chinese and English
 * keywords, so small label variations don't break detection; verify these
 * keywords against the live site before submitting the PR.
 */
function detectSportType(text: string): SportType {
  const haystack = text.toLowerCase()
  const has = (...needles: string[]) => needles.some(needle => haystack.includes(needle.toLowerCase()))

  if (has('mlb', 'cpbl', '中華職棒', '棒球'))
    return SportType.Baseball
  if (has('nba', 'wnba', '籃球'))
    return SportType.Basketball
  if (has('f1', 'formula 1', 'formula1'))
    return SportType.Formula1
  if (has('motogp'))
    return SportType.MotorcycleRacing
  if (has('ufc'))
    return SportType.MMA
  if (has('bwf'))
    return SportType.Badminton
  if (has('pga', 'lpga'))
    return SportType.Golf
  if (has('nfl'))
    return SportType.AmericanFootball
  if (has('nhl'))
    return SportType.IceHockey
  if (has('tennis', 'atp', 'wta', '網球'))
    return SportType.Tennis
  if (has('volleyball', '排球'))
    return SportType.Volleyball
  if (has('esports', '電競'))
    return SportType.Esports
  if (has('足球', 'premier league', 'laliga', 'la liga', 'serie a', 'bundesliga', 'champions league'))
    return SportType.Football

  return SportType.Unknown
}

/**
 * Known sports-channel brand names on Hami Video's /channel/ pages.
 */
const SPORTS_CHANNEL_NAMES = ['Hami體育', '愛爾達體育', '博斯運動', '博斯網球', '博斯高球']

/**
 * Keywords that indicate an actual sporting event/league is currently
 * airing, as opposed to just being on a /channel/ page — Hami Video uses
 * /channel/ for every TV channel (Cartoon Network, Nick Jr., Discovery,
 * HBO, TVBS, CNN, movie/variety/kids channels, sports channels, etc.), so
 * the URL pattern alone is never enough to say "this is sports".
 */
const SPORTS_PROGRAM_KEYWORDS = [
  'MLB',
  'CPBL',
  'NBA',
  'WNBA',
  'NFL',
  'NHL',
  'F1',
  'MotoGP',
  'UFC',
  'ATP',
  'WTA',
  'PGA',
  'LPGA',
  'BWF',
  '棒球',
  '籃球',
  '足球',
  '羽球',
  '網球',
  '排球',
]

/**
 * True when any of the given texts (channel name, current program title,
 * category fields, ...) name a known sports-channel brand or contain a
 * sports league/keyword. Used to decide whether a live /channel/ page is an
 * actual sports broadcast (`SportsLive`) or just a regular live TV channel
 * (`TV`) — verify the channel-name and keyword lists against the live site
 * before submitting the PR.
 */
function isSportsChannelOrProgram(...texts: (string | undefined)[]): boolean {
  const haystack = texts.filter((text): text is string => Boolean(text)).join(' ')
  if (haystack === '')
    return false

  if (SPORTS_CHANNEL_NAMES.some(name => haystack.includes(name)))
    return true

  const lowerHaystack = haystack.toLowerCase()
  return SPORTS_PROGRAM_KEYWORDS.some(keyword => lowerHaystack.includes(keyword.toLowerCase()))
}

/**
 * Best-effort lookup of the active player's container element, so
 * channel/program DOM searches can be scoped to "the player that's
 * actually playing" instead of the whole page — which also holds
 * recommendation cards, sidebars, and other channel listings that could
 * otherwise be matched by the same class names. Falls back to the whole
 * document only when no known player container can be found. Selectors are
 * best-effort guesses; verify against the live site before submitting the
 * PR.
 */
function getPlayerScope(): ParentNode {
  return (
    document.querySelector('.player-info')
    ?? document.querySelector('.player-container')
    ?? document.querySelector('#player')
    ?? document.querySelector('.video-player')
    ?? document
  )
}

function getScopedElement(scope: ParentNode, query: string): string | undefined {
  const text = scope.querySelector(query)?.textContent
  return text?.trim() || undefined
}

/**
 * Extracts a "currently airing" program title out of a free-text meta
 * description, when it follows a `{channel} 現正播出/正在播出 {title}` /
 * `{channel} Now Playing/On Air {title}` style pattern. Returns `undefined`
 * (rather than guessing) when no such pattern is present.
 */
function extractProgramTitleFromDescription(description: string | undefined): string | undefined {
  if (!description)
    return undefined

  const match = description.match(/(?:現正播出|正在播出|Now Playing|On Air)[:：\s]*([^\n|｜]+)/i)
  return match?.[1]?.trim() || undefined
}

/**
 * Best-effort extraction of a program/show name out of any JSON-LD
 * structured-data blocks on the page (schema.org `BroadcastEvent`,
 * `TVEpisode`, `VideoObject`). Never throws — malformed or unexpected
 * JSON-LD simply resolves to `undefined` so callers keep falling through.
 */
function getProgramTitleFromJsonLd(): string | undefined {
  const scripts = document.querySelectorAll('script[type="application/ld+json"]')
  for (const script of scripts) {
    try {
      const data: unknown = JSON.parse(script.textContent ?? '')
      const entries = Array.isArray(data) ? data : [data]
      for (const entry of entries) {
        if (entry === null || typeof entry !== 'object')
          continue
        const record = entry as Record<string, unknown>
        const type = record['@type']
        if (type !== 'BroadcastEvent' && type !== 'TVEpisode' && type !== 'VideoObject')
          continue
        const name = record.name ?? record.headline
        if (typeof name === 'string' && name.trim())
          return name.trim()
      }
    }
    catch {
      // Malformed JSON-LD on this block — ignore and keep checking others.
    }
  }
  return undefined
}

/**
 * Prefix Hami Video's live TV player puts in front of the current program
 * name inside `#programName` (e.g. "現正播出：超級蝙蝠車" /
 * "正在播出:超級蝙蝠車"). Stripped so only the bare program title remains.
 */
const PROGRAM_NAME_PREFIX_REGEX = /^(?:現正播出|正在播出)\s*[:：]?\s*/

/**
 * Reads the channel's current program title. The player exposes this
 * directly via `#programName` (e.g. `<p id="programName">現正播出：超級蝙蝠車</p>`
 * inside `.player_title .com`), which is checked first and returned
 * immediately when present — deliberately skipping OpenGraph/meta
 * description/document.title in that case, since those only carry the
 * channel name (e.g. "CN卡通頻道－Live直播線上看｜HamiVideo"), not the program.
 * When `#programName` isn't present, falls back to the existing
 * multi-source detection: (1) official page variables the player may
 * expose, (2) DOM elements scoped to the active player container, (3)
 * OpenGraph title, (4) a "currently airing" pattern in the meta
 * description, (5) JSON-LD structured data, (6) `undefined` if nothing
 * matches.
 */
async function getCurrentProgramTitle(): Promise<string | undefined> {
  // Highest priority: the official on-page "現正播出"/"正在播出" element.
  const officialProgramName = document.querySelector('#programName')?.textContent
  if (officialProgramName) {
    const cleaned = officialProgramName.replace(PROGRAM_NAME_PREFIX_REGEX, '').trim()
    if (cleaned)
      return cleaned
  }

  // 1. Official JS variables
  const officialVar
    = (await getPageVar<string>('currentProgram'))
      ?? (await getPageVar<string>('programTitle'))
      ?? (await getPageVar<string>('epgTitle'))
      ?? (await getPageVar<string>('currentTitle'))
  if (officialVar?.trim())
    return officialVar.trim()

  // 2. Player DOM, scoped to the active player container
  const scope = getPlayerScope()
  const domTitle
    = getScopedElement(scope, '.now-playing__title')
      ?? getScopedElement(scope, '.epg-current__title')
      ?? getScopedElement(scope, '.epg-now__title')
      ?? getScopedElement(scope, '.program-title')
      ?? getScopedElement(scope, '.channel-program__title')
  if (domTitle)
    return domTitle

  // 3. OpenGraph
  const ogTitle = getAttr('meta[property="og:title"]', 'content')
  if (ogTitle?.trim())
    return ogTitle.trim()

  // 4. Meta description
  const fromDescription = extractProgramTitleFromDescription(getAttr('meta[name="description"]', 'content'))
  if (fromDescription)
    return fromDescription

  // 5. Structured data (JSON-LD)
  const fromJsonLd = getProgramTitleFromJsonLd()
  if (fromJsonLd)
    return fromJsonLd

  // 6. Fallback
  return undefined
}

/**
 * Reads the current TV channel's display name (e.g. "CN卡通頻道"). The
 * player exposes this directly via `.player_title .com h3`, which is
 * checked first and returned immediately when present. When it isn't,
 * falls back to the existing multi-source detection: official page
 * variables, then DOM scoped to the active player container, then
 * OpenGraph, and finally the original unscoped selectors as a last-resort
 * fallback so behavior never regresses if nothing above resolves.
 */
async function getChannelName(): Promise<string | undefined> {
  // Highest priority: the official channel-name heading.
  const officialChannelName = document.querySelector('.player_title .com h3')?.textContent?.trim()
  if (officialChannelName)
    return officialChannelName

  // 1. Official JS variables
  const officialVar
    = (await getPageVar<string>('channelName'))
      ?? (await getPageVar<string>('currentChannel'))
      ?? (await getPageVar<string>('channelTitle'))
  if (officialVar?.trim())
    return officialVar.trim()

  // 2. Player DOM, scoped to the active player container — avoids matching
  // recommendation cards, sidebars, or other channel listings elsewhere on
  // the page.
  const scope = getPlayerScope()
  const domChannel
    = getScopedElement(scope, '.channel-name')
      ?? getScopedElement(scope, '.player-info__channel')
      ?? getScopedElement(scope, '.channel-info__name')
  if (domChannel)
    return domChannel

  // 3. OpenGraph
  const ogSiteName = getAttr('meta[property="og:site_name"]', 'content')
  if (ogSiteName?.trim())
    return ogSiteName.trim()

  // 4. Current (pre-existing, unscoped) implementation, kept as the final
  // fallback.
  return (
    getElement('.channel-name')
    ?? getElement('.player-info__channel')
    ?? getElement('.channel-info__name')
  )
}

function getSportDetailsString(sport: SportType, strings: Strings): string {
  switch (sport) {
    case SportType.Baseball:
      return strings.watchingBaseball
    case SportType.Basketball:
      return strings.watchingBasketball
    case SportType.Formula1:
      return strings.watchingFormula1
    case SportType.MotorcycleRacing:
      return strings.watchingMotorcycleRacing
    case SportType.MMA:
      return strings.watchingMMA
    case SportType.Badminton:
      return strings.watchingBadminton
    case SportType.Golf:
      return strings.watchingGolf
    case SportType.Football:
      return strings.watchingFootball
    case SportType.AmericanFootball:
      return strings.watchingAmericanFootball
    case SportType.IceHockey:
      return strings.watchingIceHockey
    case SportType.Tennis:
      return strings.watchingTennis
    case SportType.Volleyball:
      return strings.watchingVolleyball
    case SportType.Esports:
      return strings.watchingEsports
    default:
      return strings.watchingSportsLive
  }
}

/**
 * `RegExpMatchArray` access is unchecked under `noUncheckedIndexedAccess`,
 * so every captured group is read into a `string | undefined` local first
 * and explicitly checked before it's ever passed to `Number.parseInt`.
 */
function parseSeasonEpisode(raw: string | undefined): { season: number | null, episode: number | null } {
  if (!raw)
    return { season: null, episode: null }

  const seasonMatch = raw.match(/S(?:eason)?\s*(\d+)/i) ?? raw.match(/第\s*(\d+)\s*季/)
  const episodeMatch = raw.match(/E(?:pisode|P)?\s*(\d+)/i) ?? raw.match(/第\s*(\d+)\s*集/)

  const seasonGroup = seasonMatch?.[1]
  const episodeGroup = episodeMatch?.[1]

  return {
    season: seasonGroup !== undefined ? Number.parseInt(seasonGroup, 10) : null,
    episode: episodeGroup !== undefined ? Number.parseInt(episodeGroup, 10) : null,
  }
}

/**
 * `currentMediaThumb` (and similar per-title official fields) are only
 * populated once by the site's player bootstrap and are not always
 * refreshed by in-page "next episode" / "switch title" handlers. Caching
 * resolved artwork by `contentPk` means each title's poster is resolved once
 * and reused, instead of flickering to the logo fallback whenever a resolve
 * attempt briefly comes up empty during a title change.
 */
const ARTWORK_CACHE_LIMIT = 100
const artworkCache = new Map<string, string>()

function cacheArtwork(contentPk: string | undefined, poster: string | undefined): string | undefined {
  if (!contentPk)
    return poster

  if (poster) {
    if (!artworkCache.has(contentPk) && artworkCache.size >= ARTWORK_CACHE_LIMIT) {
      const oldestKey = artworkCache.keys().next().value
      if (oldestKey !== undefined)
        artworkCache.delete(oldestKey)
    }
    artworkCache.set(contentPk, poster)
    return poster
  }

  return artworkCache.get(contentPk)
}

function isHomepage(pathname: string): boolean {
  return pathname === '/' || pathname === '' || pathname === '/index' || pathname === '/home'
}

function isCategoryBrowsePage(pathname: string): boolean {
  return /\/(category|channel|list)\//i.test(pathname)
}

function isAnimeBrowsePage(pathname: string): boolean {
  return /\/anime\b/i.test(pathname)
}

function isSearchPage(pathname: string): boolean {
  return /\/search\b/i.test(pathname)
}

function getSearchKeyword(): string | undefined {
  const params = new URLSearchParams(document.location.search)
  return (
    params.get('keyword')
    ?? params.get('q')
    ?? params.get('query')
    ?? getAttr('input[type="search"]', 'value')
    ?? getAttr('.search-input', 'value')
    ?? undefined
  )
}

/**
 * Strips query parameters (tracking params, `utm_*`, `autoplay`, session
 * ids, etc.) and hash fragments from a URL so Discord buttons never carry
 * ephemeral/tracking state, e.g.
 * `https://hamivideo.hinet.net/product/123456.do?autoplay=true&utm_source=x`
 * becomes `https://hamivideo.hinet.net/product/123456.do`. Returns
 * `undefined` for anything that isn't a valid, parseable URL, so callers can
 * treat that as "no usable URL" (see URL SAFETY: never create invalid or
 * empty button URLs).
 */
function cleanUrl(rawUrl: string | undefined): string | undefined {
  if (!rawUrl)
    return undefined
  try {
    const url = new URL(rawUrl)
    url.search = ''
    url.hash = ''
    return url.toString()
  }
  catch {
    return undefined
  }
}

/**
 * Resolves a possibly-relative URL (e.g. an `href` pulled off a breadcrumb
 * or nav `<a>` tag) against the current page before cleaning it.
 */
function resolveUrl(rawUrl: string | undefined, base: string = document.location.href): string | undefined {
  if (!rawUrl)
    return undefined
  try {
    return cleanUrl(new URL(rawUrl, base).toString())
  }
  catch {
    return undefined
  }
}

/**
 * `String.prototype.split()` is unchecked-indexed too, so the first segment
 * is read into a local `string | undefined` before use — no non-null
 * assertion, with an explicit fallback instead.
 */
function currentPageUrl(): string {
  return cleanUrl(document.location.href) ?? document.location.href
}

function fallbackTitleFromDocumentTitle(): string | undefined {
  const firstSegment = document.title.split(/[-|]/)[0]
  return firstSegment?.trim() || undefined
}

/**
 * ===========================================================================
 * Series URL detection + smart series memory
 * ===========================================================================
 * The episode player page and the series' own homepage are two different
 * URLs, and the site doesn't consistently expose a direct link between them
 * on every episode page. `getSeriesUrl` tries a priority-ordered chain of
 * signals to resolve "the series homepage" from wherever we currently are;
 * `resolveSeriesUrl` layers a tiny in-memory cache on top so that once a
 * series URL has been resolved once (typically from the series' own landing
 * page, where detection is most reliable), later episode-page updates for
 * the *same* series reuse it instead of re-running detection (and instead of
 * losing the "View Series" button if a mid-transition detection attempt
 * briefly comes up empty).
 */
interface SeriesMemoryEntry {
  seriesName?: string
  seriesUrl: string
  contentId: string
}

let seriesMemory: SeriesMemoryEntry | undefined

/**
 * Priority-ordered series URL detection, per spec:
 * 1. Official JS variables, 2. canonical link, 3. OpenGraph URL,
 * 4. breadcrumb links, 5. series navigation links, 6. current page (only
 * meaningful when the current page already *is* the series page, which
 * callers decide — this function itself never assumes that).
 *
 * Variable/selector names below are best-effort guesses following the same
 * convention as the rest of the file (e.g. `_vod_category`); verify against
 * the live site before submitting the PR.
 */
async function getSeriesUrl(): Promise<string | undefined> {
  const officialVar
    = (await getPageVar<string>('seriesUrl'))
      ?? (await getPageVar<string>('_series_url'))
      ?? (await getPageVar<string>('programUrl'))
  const official = cleanUrl(officialVar)
  if (official)
    return official

  const canonical = resolveUrl(getAttr('link[rel="canonical"]', 'href'))
  if (canonical)
    return canonical

  const openGraph = resolveUrl(getAttr('meta[property="og:url"]', 'content'))
  if (openGraph)
    return openGraph

  const breadcrumb = resolveUrl(
    getAttr('.breadcrumb a:last-of-type', 'href')
    ?? getAttr('nav.breadcrumb a:last-of-type', 'href'),
  )
  if (breadcrumb)
    return breadcrumb

  const seriesNav = resolveUrl(
    getAttr('.series-nav a', 'href')
    ?? getAttr('a.series-link', 'href'),
  )
  if (seriesNav)
    return seriesNav

  return undefined
}

/**
 * Resolves the series homepage URL for `contentId`, preferring the
 * remembered value from `seriesMemory` when it's still for the same series.
 * The cache is refreshed whenever detection succeeds, and dropped as soon as
 * `contentId` no longer matches what's cached — i.e. it "automatically
 * expires when navigating to another series".
 */
async function resolveSeriesUrl(contentId: string | undefined, seriesName: string | undefined): Promise<string | undefined> {
  if (contentId && seriesMemory?.contentId !== contentId)
    seriesMemory = undefined

  if (contentId && seriesMemory?.contentId === contentId)
    return seriesMemory.seriesUrl

  const detected = await getSeriesUrl()
  if (contentId && detected) {
    seriesMemory = { seriesName, seriesUrl: detected, contentId }
    return detected
  }

  return detected
}

/**
 * The PreMiD SDK doesn't export a standalone button type, so it's inferred
 * directly from `PresenceData["buttons"]` instead (which is the fixed tuple
 * `[ButtonData, ButtonData?]`) rather than declaring a custom interface.
 */
type PresenceButtons = NonNullable<PresenceData['buttons']>
type PresenceButton = PresenceButtons[0]

/**
 * Builds the (0-2) Discord Rich Presence buttons for the current content
 * type. Discord allows a maximum of two buttons, `showButtons`/`privacyMode`
 * are enforced by the caller before this is ever invoked, and duplicate URLs
 * are never emitted (two buttons pointing at the same place is treated the
 * same as only having one).
 */
async function buildButtons(
  contentType: ContentType,
  episodeUrl: string | undefined,
  seriesId: string | undefined,
  seriesName: string | undefined,
  strings: Strings,
): Promise<PresenceButton[]> {
  const buttons: PresenceButton[] = []
  const cleanedEpisodeUrl = cleanUrl(episodeUrl)

  switch (contentType) {
    case ContentType.Series:
    case ContentType.Anime: {
      if (cleanedEpisodeUrl)
        buttons.push({ label: strings.watchEpisodeButton, url: cleanedEpisodeUrl })

      const seriesUrl = (await resolveSeriesUrl(seriesId, seriesName)) ?? cleanedEpisodeUrl
      if (seriesUrl && seriesUrl !== cleanedEpisodeUrl)
        buttons.push({ label: strings.viewSeriesButton, url: seriesUrl })
      break
    }

    case ContentType.SportsLive:
      if (cleanedEpisodeUrl)
        buttons.push({ label: strings.watchLiveButton, url: cleanedEpisodeUrl })
      break

    case ContentType.SportsReplay:
      if (cleanedEpisodeUrl)
        buttons.push({ label: strings.watchReplayButton, url: cleanedEpisodeUrl })
      break

    // Movie, Documentary, Kids, Variety, and any unclassified content all
    // get the single generic "Watch on Hami Video" button.
    default:
      if (cleanedEpisodeUrl)
        buttons.push({ label: strings.watchButton, url: cleanedEpisodeUrl })
  }

  return buttons.slice(0, 2)
}

/**
 * `PresenceData.buttons` is typed as the fixed tuple `PresenceButtons`
 * (`[ButtonData, ButtonData?]`), not a plain array — this adapts
 * `buildButtons`' `PresenceButton[]` (already capped at 2 entries) into that
 * tuple shape, or `undefined` when there are no buttons to show.
 */
function toPresenceButtons(buttons: PresenceButton[]): PresenceButtons | undefined {
  const [first, second] = buttons
  if (!first)
    return undefined
  return [first, second]
}

presence.on('UpdateData', async () => {
  const [
    privacyMode,
    showTitle,
    showEpisodeNumber,
    showEpisodeTitle,
    showLiveBadge,
    showButtons,
    showTimestamp,
    showPauseState,
  ] = await Promise.all([
    presence.getSetting<boolean>('privacyMode'),
    presence.getSetting<boolean>('showTitle'),
    presence.getSetting<boolean>('showEpisodeNumber'),
    presence.getSetting<boolean>('showEpisodeTitle'),
    presence.getSetting<boolean>('showLiveBadge'),
    presence.getSetting<boolean>('showButtons'),
    presence.getSetting<boolean>('showTimestamp'),
    presence.getSetting<boolean>('showPauseState'),
  ])

  const strings = await getStrings()

  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: ActivityAssets.Logo,
  }

  const { pathname } = document.location
  const video = getVideoElement()

  if (video && video.readyState > 0 && !video.ended) {
    const currentMediaTitle = await getPageVar<string>('myPlayer.cast.currentMediaTitle')
    const currentMediaTitleEn = await getPageVar<string>('myPlayer.cast.currentMediaTitleEn')
    const currentMediaThumb = await getPageVar<string>('myPlayer.cast.currentMediaThumb')
    const productName = await getPageVar<string>('productName')
    const vodCategory = await getVodCategory()
    const vodSubcategory = await getVodSubcategory()
    const pageIsLive = await getPageVar<boolean>('isLive')
    const contentPk = await getPageVar<string>('contentPk')
    // Best-effort series identifier, used only to key the series-URL memory
    // cache; falls back to `contentPk` (movies/replays don't have a
    // separate series concept anyway, so any identifier is fine there).
    const seriesId
      = (await getPageVar<string>('seriesPk'))
        ?? (await getPageVar<string>('programPk'))
        ?? contentPk
    const seriesName = await getPageVar<string>('seriesName') ?? productName

    const metaDescription = getAttr('meta[name="description"]', 'content') ?? ''
    const ogDescription = getAttr('meta[property="og:description"]', 'content') ?? ''
    const ogImage = getAttr('meta[property="og:image"]', 'content')

    const liveDetected = detectIsLive(pageIsLive, pathname, document.title, metaDescription, ogDescription)

    // `liveDetected` also fires for the generic /channel/ URL pattern,
    // which Hami Video uses for every TV channel — sports, cartoons, news,
    // movies, variety, kids, etc. — not just sports broadcasts. Read the
    // channel/program info once up front so it can both (a) decide sports
    // vs. plain TV below, and (b) be reused for the "Watching TV" state.
    const channelName = liveDetected ? await getChannelName() : undefined
    const currentProgramTitle = liveDetected ? await getCurrentProgramTitle() : undefined

    let contentType = classifyContentType(vodCategory ?? '', vodSubcategory ?? '', liveDetected)
    if (liveDetected) {
      const isSports
        = contentType === ContentType.SportsLive
          || isSportsChannelOrProgram(channelName, currentProgramTitle, vodCategory, vodSubcategory)
      contentType = isSports ? ContentType.SportsLive : ContentType.TV
    }

    const title
      = currentMediaTitle
        ?? currentMediaTitleEn
        ?? productName
        ?? getElement('.player-info__title')
        ?? getElement('.vod-title')
        ?? getAttr('meta[property="og:title"]', 'content')
        ?? fallbackTitleFromDocumentTitle()

    const episodeTitle = getElement('.player-info__episode-title') ?? getElement('.episode-title')
    const { season, episode } = parseSeasonEpisode(getElement('.player-info__episode') ?? getElement('.episode-number'))

    const liveDescription = contentType === ContentType.SportsLive
      ? parseLiveDescription(ogDescription || metaDescription)
      : {}

    const liveSportType = contentType === ContentType.SportsLive
      ? detectSportType(
          [liveDescription.event, liveDescription.channel, vodCategory, vodSubcategory, title]
            .filter((part): part is string => Boolean(part))
            .join(' '),
        )
      : SportType.Unknown

    const rawPoster
      = contentType === ContentType.SportsLive
        // Live broadcasts rarely carry a per-title thumbnail; prefer the
        // OpenGraph image (usually the channel/match art) before falling
        // back to whatever the player has cached, then finally the logo.
        ? (ogImage ?? currentMediaThumb)
        : (currentMediaThumb
            ?? ogImage
            ?? getAttr('.player-info__poster img', 'src')
            ?? getAttr('.vod-poster img', 'src'))

    const poster = cacheArtwork(contentPk, rawPoster)
    const pageUrl = currentPageUrl()

    if (poster) {
      presenceData.largeImageKey = poster
      if (showTitle && !privacyMode && title !== undefined)
        presenceData.largeImageText = title
    }

    let details: string
    let state: string | undefined

    switch (contentType) {
      case ContentType.Movie:
      case ContentType.SportsReplay:
        details = contentType === ContentType.Movie ? strings.watchingMovie : strings.watchingSportsReplay
        state = privacyMode || !showTitle ? undefined : title
        break

      case ContentType.Series:
        details = strings.watchingSeries
        state = privacyMode ? undefined : buildEpisodicState()
        break

      case ContentType.Anime:
        details = strings.watchingAnime
        state = privacyMode ? undefined : buildEpisodicState()
        break

      case ContentType.Documentary:
        details = strings.watchingDocumentary
        state = privacyMode ? undefined : buildEpisodicState()
        break

      case ContentType.Kids:
        details = strings.watchingKids
        state = privacyMode ? undefined : buildEpisodicState()
        break

      case ContentType.Variety:
        details = strings.watchingVariety
        state = privacyMode ? undefined : buildEpisodicState()
        break

      case ContentType.SportsLive: {
        details = getSportDetailsString(liveSportType, strings)
        if (privacyMode) {
          state = undefined
        }
        else {
          const { league, event } = extractLeagueAndEvent(liveDescription.event)
          const fallbackMatch = getElement('.live-info__match') ?? getElement('.live-info__league')
          const resolvedEvent = event ?? fallbackMatch ?? title

          // Never fall back to showing just the raw channel name — only a
          // parsed event (optionally prefixed with its league), or the
          // generic fallback string.
          state = resolvedEvent
            ? (league ? `${league} · ${resolvedEvent}` : resolvedEvent)
            : strings.liveEventFallback
        }
        break
      }

      case ContentType.TV: {
        details = strings.watchingTV
        if (privacyMode || !showTitle) {
          state = undefined
        }
        else {
          const programTitle = currentProgramTitle
          const channel = channelName ?? title
          state = programTitle && channel && programTitle !== channel
            ? `${programTitle} · ${channel}`
            : (programTitle ?? channel)
        }
        break
      }

      default:
        details = strings.watchingMovie
        state = privacyMode || !showTitle ? undefined : title
    }

    function buildEpisodicState(): string | undefined {
      const seasonEpisode
        = showEpisodeNumber && season !== null && episode !== null
          ? `${strings.season} ${season} · ${strings.episode} ${episode}`
          : showEpisodeNumber && episode !== null
            ? `${strings.episode} ${episode}`
            : undefined

      const episodeTitleText = showEpisodeTitle ? episodeTitle : undefined

      if (seasonEpisode && episodeTitleText)
        return `${seasonEpisode} · ${episodeTitleText}`
      if (seasonEpisode)
        return seasonEpisode
      if (episodeTitleText)
        return episodeTitleText
      return showTitle ? title : undefined
    }

    presenceData.details = details
    if (state !== undefined)
      presenceData.state = state

    if (liveDetected && showLiveBadge && !privacyMode) {
      presenceData.smallImageKey = Assets.Live
      presenceData.smallImageText = strings.live
    }
    else if (showPauseState) {
      presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
      presenceData.smallImageText = video.paused ? strings.paused : strings.playing
    }

    // Live sports have no fixed duration and no seek bar, so a progress bar
    // or "elapsed since page load" timer is meaningless — never show
    // timestamps for live content, only for on-demand playback.
    if (showTimestamp && !video.paused && !liveDetected && contentType !== ContentType.SportsLive) {
      const [start, end] = getTimestamps(Math.floor(video.currentTime), Math.floor(video.duration))
      presenceData.startTimestamp = start
      presenceData.endTimestamp = end
    }

    if (showButtons && !privacyMode && pageUrl) {
      const buttons = await buildButtons(contentType, pageUrl, seriesId, seriesName, strings)
      const presenceButtons = toPresenceButtons(buttons)
      if (presenceButtons)
        presenceData.buttons = presenceButtons
    }

    setActivityIfChanged(presenceData)
    return
  }

  if (privacyMode || isHomepage(pathname)) {
    clearActivityAndReset()
    return
  }

  if (isSearchPage(pathname)) {
    presenceData.details = strings.searching
    const keyword = getSearchKeyword()
    if (keyword !== undefined)
      presenceData.state = keyword
    presenceData.smallImageKey = Assets.Search
    setActivityIfChanged(presenceData)
    return
  }

  if (isAnimeBrowsePage(pathname)) {
    presenceData.details = strings.browsingAnime
    setActivityIfChanged(presenceData)
    return
  }

  if (isCategoryBrowsePage(pathname)) {
    presenceData.details = strings.browsingCategory
    setActivityIfChanged(presenceData)
    return
  }

  clearActivityAndReset()
})
