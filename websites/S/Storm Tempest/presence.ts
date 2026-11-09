import { ActivityType, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1233213267053248633',
})

const STORM_TEMPEST_IMAGE = 'https://cdn.rcd.gg/PreMiD/websites/S/Storm%20Tempest/assets/logo.png'

const browsingTimestamp = Math.floor(Date.now() / 1000)

interface WatchState {
  title: string
  source?: string
  episode?: string
  url: string
  video?: HTMLVideoElement
}

interface PageState {
  name: string
  url: string
}

/** Collapses whitespace and trims `value`, returning `undefined` for an empty result. */
function clean(value: string | null | undefined): string | undefined {
  const normalized = value?.replace(/\s+/g, ' ').trim()

  return normalized || undefined
}

/** Returns the cleaned text content of `element`, if any. */
function textOf(element: Element | null): string | undefined {
  return clean(element?.textContent)
}

/** Returns the cleaned value of `attribute` on `element`, if any. */
function attrOf(
  element: Element | null,
  attribute: string,
): string | undefined {
  return clean(element?.getAttribute(attribute))
}

/** Returns the text of the first element matching any of `selectors`. */
function queryText(selectors: string[]): string | undefined {
  for (const selector of selectors) {
    const value = textOf(document.querySelector(selector))

    if (value) {
      return value
    }
  }

  return undefined
}

/** Returns `attribute` from the first element matching any of `selectors`. */
function queryAttr(
  selectors: string[],
  attribute: string,
): string | undefined {
  for (const selector of selectors) {
    const value = attrOf(document.querySelector(selector), attribute)

    if (value) {
      return value
    }
  }

  return undefined
}

/** Whether `element` is rendered with a non-empty box. */
function isVisible(element: Element): boolean {
  const node = element as HTMLElement
  const style = window.getComputedStyle(node)
  const rect = node.getBoundingClientRect()

  return (
    style.display !== 'none'
    && style.visibility !== 'hidden'
    && rect.width > 0
    && rect.height > 0
  )
}

/** Reads the label of the active server/source control in the player. */
function sourceFromSelectedControl(): string | undefined {
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

    if (/server|source|provider|stream|player/i.test(parentText)) {
      return value
    }
  }

  return undefined
}

/** Resolves the current app section (or a `source`/`server`/`provider` param) from the URL. */
function sourceFromUrl(): string | undefined {
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
  }

  for (const part of document.location.pathname.split('/').filter(Boolean)) {
    const source = sources[part.toLowerCase()]

    if (source) {
      return source
    }
  }

  const params = new URLSearchParams(document.location.search)

  for (const key of ['source', 'server', 'provider']) {
    const value = clean(params.get(key))

    if (value) {
      return value
    }
  }

  return undefined
}

/** Extracts an episode number from text such as "S1E5", "Episode 5", "Ep 5" or "#5". */
function extractEpisode(value: string | undefined): string | undefined {
  if (!value) {
    return undefined
  }

  const patterns = [
    /\bS\d{1,2}\s*E(\d{1,4})\b/i,
    /\bEpisode\s*(\d{1,4})\b/i,
    /\bEp\.?\s*(\d{1,4})\b/i,
    /(?:^|\s)#(\d{1,4})(?:\s|$)/,
  ]

  for (const pattern of patterns) {
    const match = value.match(pattern)

    if (match?.[1]) {
      return match[1]
    }
  }

  return undefined
}

/** Finds the current episode number from the URL, title, or page elements. */
function getEpisode(): string | undefined {
  const candidates = [
    document.location.pathname,
    document.location.search,
    document.title,
    queryText([
      '[data-episode]',
      '[class*="episode"]',
      '[id*="episode"]',
      '[aria-label*="Episode" i]',
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

/** Removes a trailing "- Episode N" suffix from a title. */
function stripEpisode(value: string): string {
  return value
    .replace(
      /\s*[-|•·]\s*(?:Episode|Ep\.?)\s*\d{1,4}\s*$/i,
      '',
    )
    .trim()
}

/** Finds the title of the show being watched, ignoring generic site titles. */
function getAnimeTitle(): string | undefined {
  const candidates = [
    queryAttr(
      [
        'meta[property="og:title"]',
        'meta[name="twitter:title"]',
      ],
      'content',
    ),
    queryText([
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
      && !/^(?:storm|stormd|storm tempest|anisto|mangasto|movisto|anime|watch anime)$/i.test(
        title,
      )
    ) {
      return title
    }
  }

  return undefined
}

/** Returns the first loaded, unfinished `<video>` element on the page. */
function getVideo(): HTMLVideoElement | undefined {
  return Array.from(
    document.querySelectorAll<HTMLVideoElement>('video'),
  ).find(video => !video.ended && video.readyState > 0)
}

/** Whether the current page is a watch/episode page or has an active video. */
function isWatchPage(): boolean {
  const url
    = `${document.location.pathname}${document.location.search}`.toLowerCase()

  return (
    /\/watch\b/.test(url)
    || /\/episode\b/.test(url)
    || /\/play\b/.test(url)
    || /[?&](?:episode|ep)=/i.test(url)
    || Boolean(getVideo())
  )
}

/** Collects the title, source, episode and video of the current watch page. */
function getWatchState(): WatchState {
  return {
    title: getAnimeTitle() ?? 'Unknown Anime',
    source: sourceFromSelectedControl() ?? sourceFromUrl(),
    episode: getEpisode(),
    url: document.location.href,
    video: getVideo(),
  }
}

/** Returns a display name for the current browsing page. */
function getPageName(): string {
  const pathname = document.location.pathname
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0) {
    return 'Home'
  }

  const firstSegment = segments[0]

  if (!firstSegment) {
    return 'Home'
  }

  const pageNames: Record<string, string> = {
    anisto: 'Anime',
    mangasto: 'Manga',
    movisto: 'Movies',
    novelsto: 'Novels',
    booksto: 'Books',
    tvsto: 'Live TV',
    gamesto: 'Games',
    codesto: 'Code Tools',
    toolsto: 'Tools',
    studysto: 'Study',
  }

  const pageName = pageNames[firstSegment.toLowerCase()]

  if (pageName) {
    return pageName
  }

  const title = clean(document.title)

  if (
    title
    && !/^(?:storm|stormd|storm tempest)$/i.test(title)
  ) {
    return stripEpisode(title)
  }

  return 'Storm Tempest'
}

/** Collects the name and URL of the current browsing page. */
function getPageState(): PageState {
  return {
    name: getPageName(),
    url: document.location.href,
  }
}

/** Builds start/end timestamps from `video`, or none while it is paused or unknown. */
function getPlaybackTimestamps(
  video: HTMLVideoElement | undefined,
): {
  startTimestamp?: number
  endTimestamp?: number
} {
  if (
    !video
    || video.paused
    || video.ended
    || !Number.isFinite(video.duration)
    || video.duration <= 0
    || !Number.isFinite(video.currentTime)
  ) {
    return {}
  }

  const [startTimestamp, endTimestamp] = getTimestamps(
    Math.floor(video.currentTime),
    Math.floor(video.duration),
  )

  return {
    startTimestamp,
    endTimestamp,
  }
}

/** Builds the presence shown while watching an episode. */
function buildWatchActivity(watch: WatchState): PresenceData {
  const source = watch.source ?? 'Unknown Source'
  const episode = watch.episode
    ? `Episode ${watch.episode}`
    : 'Episode ?'

  return {
    type: ActivityType.Watching,
    details: 'Watching Storm Tempest',
    state: `${source}\n${watch.title} - ${episode}`,
    largeImageKey: STORM_TEMPEST_IMAGE,
    buttons: [
      {
        label: 'Open Storm Tempest',
        url: watch.url,
      },
    ],
    ...getPlaybackTimestamps(watch.video),
  }
}

/** Builds the presence shown while browsing, keeping the elapsed time fixed. */
function buildPageActivity(page: PageState): PresenceData {
  return {
    type: ActivityType.Watching,
    details: `Browsing ${page.name}`,
    state: 'Storm Tempest',
    largeImageKey: STORM_TEMPEST_IMAGE,
    startTimestamp: browsingTimestamp,
    buttons: [
      {
        label: 'Storm Tempest',
        url: page.url,
      },
    ],
  }
}

/** Updates the presence with watch or browsing activity on every refresh. */
presence.on('UpdateData', async () => {
  if (isWatchPage()) {
    presence.setActivity(
      buildWatchActivity(getWatchState()),
    )

    return
  }

  presence.setActivity(
    buildPageActivity(getPageState()),
  )
})
