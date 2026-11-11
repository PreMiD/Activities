import type { WatchState } from '../config/types.js'
import { ActivityType } from 'premid'
import { ActivityAssets, browsingTimestamp } from '../config/constants.js'
import { buildButtons, smallImageFor } from '../util/activity.js'
import { clean, isVisible, latinDigits, prettify, queryAttr, queryText, safeDecode, textOf } from '../util/dom.js'
import { getArtwork } from '../util/images.js'
import { getPlayback, getPlaybackTimestamps, getVideo, isMainPlayer } from '../util/playback.js'

/** Whether `element` sits inside a group labelled as the player's server/source/provider switcher. */
export function isInServerControl(element: Element): boolean {
  const group = element.closest(
    '[role="group"], [role="radiogroup"], [role="tablist"], [role="listbox"], [role="menu"], [id*="server" i], [class*="server" i], [data-server]',
  )

  if (!group) {
    return false
  }

  const labelledBy = (group.getAttribute('aria-labelledby') ?? '')
    .split(/\s+/)
    .map(id => textOf(document.getElementById(id)) ?? '')
    .join(' ')

  const label = [
    group.getAttribute('aria-label'),
    labelledBy,
    group.id,
    group.getAttribute('class'),
    group.hasAttribute('data-server') ? 'server' : '',
  ].join(' ')

  return /server|source|provider/i.test(label)
}

/** Reads the label of the active server/source control in the player. */
export function sourceFromSelectedControl(): string | undefined {
  const selectors = [
    '[aria-pressed="true"]',
    '[aria-selected="true"]',
    '[aria-checked="true"]',
    '[data-state="active"]',
    '[data-state="selected"]',
    '[data-selected="true"]',
    '.active',
    '.selected',
    '.current',
    '.chosen',
  ]

  const elements = Array.from(
    document.querySelectorAll(selectors.join(',')),
  ).filter(isVisible)

  for (const element of elements) {
    const value = textOf(element)

    if (!value || value.length > 60) {
      continue
    }

    if (
      /^(?:watch|play|next|previous|episode|episodes|server|source|provider|stream|player|dub|sub|quality|auto|default)$/i.test(
        value,
      )
    ) {
      continue
    }

    const parentText = clean(element.parentElement?.textContent) ?? ''

    if (
      isInServerControl(element)
      || /server|source|provider|stream|player/i.test(parentText)
    ) {
      return value
    }
  }

  return undefined
}

/** Parses `/watch/<source>/<slug>/<episode>` from the URL path. */
export function parseWatchPath():
  | { source: string, slug: string, episode?: string }
  | undefined {
  const match = document.location.pathname.match(
    /\/watch\/([^/]+)\/([^/]+)(?:\/([^/]+))?\/?$/,
  )

  if (!match?.[1] || !match[2]) {
    return undefined
  }

  return {
    source: safeDecode(match[1]),
    slug: safeDecode(match[2]),
    episode: match[3] && /^\d{1,4}(?:\.\d+)?$/.test(match[3]) ? match[3] : undefined,
  }
}

/** Resolves the provider from a watch URL, else the app section or a `source`/`server`/`provider` param. */
export function sourceFromUrl(): string | undefined {
  const watchPath = parseWatchPath()

  if (watchPath) {
    return prettify(watchPath.source)
  }

  const sources: Record<string, string> = {
    anisto: 'Anisto',
    mangasto: 'Mangasto',
    movisto: 'Movisto',
    booksto: 'Booksto',
    novelsto: 'Novelsto',
    codesto: 'Codesto',
    tvsto: 'Tvsto',
    toolsto: 'Toolsto',
    gamesto: 'Gamesto',
    studysto: 'Studysto',
    plansto: 'Plansto',
    roomsto: 'Roomsto',
  }

  const params = new URLSearchParams(document.location.search)

  for (const key of ['source', 'server', 'provider']) {
    const value = clean(params.get(key))

    if (value) {
      return value
    }
  }

  for (const part of document.location.pathname.split('/').filter(Boolean)) {
    const source = sources[part.toLowerCase()]

    if (source) {
      return source
    }
  }

  return undefined
}

/** Extracts an episode number from text such as "S1E5", "Episode 5", "Ep 5" or "#5". */
export function extractEpisode(value: string | undefined): string | undefined {
  if (!value) {
    return undefined
  }

  const text = latinDigits(value)
  const patterns = [
    /\bS\d{1,2}\s*E(\d{1,4})\b/i,
    /\bEpisode\s*(\d{1,4})\b/i,
    /\bEp\.?\s*(\d{1,4})\b/i,
    /(?:الحلقة|حلقة)\s*(\d{1,4})/,
    /(?:^|\s)#(\d{1,4})(?:\s|$)/,
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)

    if (match?.[1]) {
      return match[1]
    }
  }

  return undefined
}

/** Finds the current episode number from the URL, title, or page elements. */
export function getEpisode(): string | undefined {
  const listed = textOf(
    document.querySelector(
      'aside[aria-labelledby="episodes-title"] [aria-current="true"] span',
    ),
  )
  const fromList = listed && latinDigits(listed)

  if (fromList && /^\d{1,4}(?:\.\d+)?$/.test(fromList)) {
    return fromList
  }

  const fromPath = parseWatchPath()?.episode

  if (fromPath) {
    return fromPath
  }

  const params = new URLSearchParams(document.location.search)
  const fromQuery = params.get('ep') ?? params.get('episode')

  if (fromQuery && /^\d{1,4}(?:\.\d+)?$/.test(fromQuery)) {
    return fromQuery
  }

  const candidates = [
    document.location.pathname,
    document.location.search,
    document.title,
    queryText([
      '[data-episode]',
      '[class*="episode"]',
      '[id*="episode"]',
      '[aria-label*="Episode" i]',
      '[aria-label*="الحلقة"]',
    ]),
    queryAttr(['[data-episode]'], 'data-episode'),
  ]

  for (const candidate of candidates) {
    const episode = extractEpisode(candidate)

    if (episode) {
      return episode
    }
  }

  return undefined
}

/** Removes a trailing "· storm" site suffix and "- Episode N" or "- Chapter N" from a title. */
export function stripEpisode(value: string): string {
  return value
    .replace(/\s*[-|•·]\s*storm\s*$/i, '')
    .replace(
      /\s*[-|•·]\s*(?:Episode|Ep\.?|Chapter|Ch\.?|الحلقة|حلقة|الفصل|فصل)\s*[\d\u0660-\u0669]{1,5}\s*$/i,
      '',
    )
    .trim()
}

/** Finds the title of the show being watched, ignoring generic site titles. */
export function getAnimeTitle(): string | undefined {
  const candidates = [
    queryAttr(
      [
        'meta[property="og:title"]',
        'meta[name="twitter:title"]',
      ],
      'content',
    ),
    queryText([
      'main a[href*="/title/"]',
      'main h1',
      'article h1',
      '[data-anime-title]',
      '[class*="anime-title"]',
      '[class*="show-title"]',
      '[class*="series-title"]',
    ]),
    document.title,
  ]

  for (const candidate of candidates) {
    if (!candidate) {
      continue
    }

    const title = clean(stripEpisode(candidate))

    if (
      title
      && !/^(?:storm|stormd|storm tempest|anisto|mangasto|movisto|novelsto|booksto|tvsto|anime|watch anime)$/i.test(
        title,
      )
    ) {
      return title
    }
  }

  return undefined
}

/** Whether the current page is a watch/episode page or shows a main player. */
export function isWatchPage(): boolean {
  const url
    = `${document.location.pathname}${document.location.search}`.toLowerCase()

  if (
    /\/watch\b/.test(url)
    || /\/episode\b/.test(url)
    || /\/play\b/.test(url)
    || /[?&](?:episode|ep)=/i.test(url)
  ) {
    return true
  }

  const video = getVideo()

  return Boolean(video && isMainPlayer(video))
}

/** Finds the total number of episodes from the page description or text, such as "13 episodes". */
export function getTotalEpisodes(): string | undefined {
  const listed = document.querySelectorAll(
    'aside[aria-labelledby="episodes-title"] ol li',
  ).length

  if (listed > 0) {
    return String(listed)
  }

  const candidates = [
    queryAttr(
      [
        'meta[property="og:description"]',
        'meta[name="twitter:description"]',
        'meta[name="description"]',
      ],
      'content',
    ),
    queryText(['[data-episodes]', '[class*="episodes" i]']),
  ]

  for (const candidate of candidates) {
    const match = candidate && latinDigits(candidate).match(/(\d{1,4})\s*(?:episodes|eps\b|حلقات|حلقة)/i)

    if (match?.[1]) {
      return match[1]
    }
  }

  return undefined
}

/** Collects the title, source, episode, artwork and video of the current watch page. */
export function getWatchState(): WatchState {
  const video = getVideo()
  const slug = parseWatchPath()?.slug
  const episode = getEpisode()
  const totalEpisodes = getTotalEpisodes()

  return {
    title: getAnimeTitle() ?? (slug ? prettify(slug) : 'Unknown Anime'),
    source: sourceFromUrl() ?? sourceFromSelectedControl(),
    episode,
    totalEpisodes:
      episode && totalEpisodes && Number(totalEpisodes) >= Number(episode)
        ? totalEpisodes
        : undefined,
    url: document.location.href,
    image: getArtwork(video),
    video,
  }
}

/** Builds the presence shown while watching an episode, a movie or a live channel. */
export function buildWatchActivity(watch: WatchState, privacy: boolean): PresenceData {
  const playback = getPlayback(watch.video)
  const path = document.location.pathname
  const live = path.startsWith('/tvsto/')
  const kind = live
    ? 'live TV'
    : path.startsWith('/movisto/') ? 'a movie' : 'an anime'
  const source = watch.source ?? 'Unknown Source'
  const episode = watch.episode
    ? watch.totalEpisodes
      ? `Episode ${watch.episode} of ${watch.totalEpisodes}`
      : `Episode ${watch.episode}`
    : undefined
  const info = live
    ? `Live TV • ${source}`
    : episode ? `${episode} • ${source}` : source

  return {
    type: ActivityType.Watching,
    details: privacy ? `Watching ${kind}` : watch.title,
    state: privacy ? undefined : info,
    largeImageKey: privacy
      ? ActivityAssets.Logo
      : watch.image ?? ActivityAssets.Logo,
    ...smallImageFor(playback, !privacy && Boolean(watch.image)),
    buttons: privacy
      ? buildButtons()
      : buildButtons({
          label: live ? 'Open Channel' : 'Open Series',
          url: watch.url,
        }),
    ...(live && !playback?.paused && { startTimestamp: browsingTimestamp }),
    ...getPlaybackTimestamps(playback),
  }
}
