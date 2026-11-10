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
  image?: string
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

/** Whether `element` sits inside a group labelled as the player's server/source/provider switcher. */
function isInServerControl(element: Element): boolean {
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

    if (
      isInServerControl(element)
      || /server|source|provider|stream|player/i.test(parentText)
    ) {
      return value
    }
  }

  return undefined
}

/** Decodes a URL path segment, returning it unchanged when it is malformed. */
function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value)
  }
  catch {
    return value
  }
}

/** Turns a slug such as "kaoru-hana-wa-rin-to-saku" into "Kaoru Hana Wa Rin To Saku". */
function prettify(slug: string): string {
  return slug
    .replace(/[-_]+/g, ' ')
    .replace(/\b\p{L}/gu, letter => letter.toUpperCase())
    .trim()
}

/** Parses `/watch/<source>/<slug>/<episode>` from the URL path. */
function parseWatchPath():
  | { source: string, slug: string, episode?: string }
  | undefined {
  const match = document.location.pathname.match(
    /\/watch\/([^/]+)\/([^/]+)(?:\/(\d{1,4}))?\/?$/,
  )

  if (!match?.[1] || !match[2]) {
    return undefined
  }

  return {
    source: safeDecode(match[1]),
    slug: safeDecode(match[2]),
    episode: match[3],
  }
}

/** Resolves the provider from a watch URL, else the app section or a `source`/`server`/`provider` param. */
function sourceFromUrl(): string | undefined {
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
  const fromPath = parseWatchPath()?.episode

  if (fromPath) {
    return fromPath
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

/** Whether `video` is in the viewport and big enough to be the main player rather than a preview. */
function isMainPlayer(video: HTMLVideoElement): boolean {
  const rect = video.getBoundingClientRect()

  return (
    isVisible(video)
    && rect.bottom > 0
    && rect.top < window.innerHeight
    && rect.right > 0
    && rect.left < window.innerWidth
    && rect.width >= 200
    && rect.width >= window.innerWidth * 0.5
  )
}

/** Whether the current page is a watch/episode page or shows a main player. */
function isWatchPage(): boolean {
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

/** Finds the episode or show artwork as an absolute https URL. */
function getArtwork(video: HTMLVideoElement | undefined): string | undefined {
  const candidates = [
    video?.poster,
    queryAttr(
      [
        'meta[property="og:image"]',
        'meta[name="twitter:image"]',
      ],
      'content',
    ),
    queryAttr(['link[rel="image_src"]'], 'href'),
  ]

  for (const candidate of candidates) {
    if (!candidate) {
      continue
    }

    try {
      const url = new URL(candidate, document.location.href)

      if (url.protocol === 'https:') {
        return url.href
      }
    }
    catch {
      continue
    }
  }

  return undefined
}

/** Collects the title, source, episode, artwork and video of the current watch page. */
function getWatchState(): WatchState {
  const video = getVideo()
  const slug = parseWatchPath()?.slug

  return {
    title: getAnimeTitle() ?? (slug ? prettify(slug) : 'Unknown Anime'),
    source: sourceFromSelectedControl() ?? sourceFromUrl(),
    episode: getEpisode(),
    url: document.location.href,
    image: getArtwork(video),
    video,
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
    largeImageKey: watch.image ?? STORM_TEMPEST_IMAGE,
    ...(watch.image && {
      smallImageKey: STORM_TEMPEST_IMAGE,
      smallImageText: 'Storm Tempest',
    }),
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
        label: 'Open Storm Tempest',
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
