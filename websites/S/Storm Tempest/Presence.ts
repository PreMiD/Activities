import { ActivityType, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1233213267053248633',
})

const STORM_TEMPEST_IMAGE = 'https://raw.githubusercontent.com/akuyakii/Web/main/public/logo-512.png'

interface WatchState {
  title: string
  source?: string
  episode?: string
  url: string
  video?: HTMLVideoElement
}

function clean(value: string | null | undefined): string | undefined {
  const normalized = value?.replace(/\s+/g, ' ').trim()

  return normalized || undefined
}

function textOf(element: Element | null): string | undefined {
  return clean(element?.textContent)
}

function attrOf(
  element: Element | null,
  attribute: string,
): string | undefined {
  return clean(element?.getAttribute(attribute))
}

function queryText(selectors: string[]): string | undefined {
  for (const selector of selectors) {
    const value = textOf(document.querySelector(selector))

    if (value) {
      return value
    }
  }

  return undefined
}

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

function isVisible(element: Element): boolean {
  const node = element as HTMLElement
  const style = window.getComputedStyle(node)
  const rect = node.getBoundingClientRect()

  return style.display !== 'none'
    && style.visibility !== 'hidden'
    && rect.width > 0
    && rect.height > 0
}

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
  }

  for (const part of window.location.pathname.split('/').filter(Boolean)) {
    const source = sources[part.toLowerCase()]

    if (source) {
      return source
    }
  }

  const params = new URLSearchParams(window.location.search)

  for (const key of ['source', 'server', 'provider']) {
    const value = clean(params.get(key))

    if (value) {
      return value
    }
  }

  return undefined
}

function extractEpisode(value: string | undefined): string | undefined {
  if (!value) {
    return undefined
  }

  const patterns = [
    /\bS\d{1,2}\s*E(\d{1,4})\b/i,
    /\bEpisode\s*(\d{1,4})\b/i,
    /\bEp\.?\s*(\d{1,4})\b/i,
    /(?:^|\s)#(\d{1,4})(?:\s|$)/i,
  ]

  for (const pattern of patterns) {
    const match = value.match(pattern)

    if (match?.[1]) {
      return match[1]
    }
  }

  return undefined
}

function getEpisode(): string | undefined {
  const candidates = [
    window.location.pathname,
    window.location.search,
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

function stripEpisode(value: string): string {
  return value.replace(
    /\s*[-|•·]\s*(?:Episode|Ep\.?)\s*\d{1,4}\s*$/i,
    '',
  ).trim()
}

function getAnimeTitle(): string | undefined {
  const candidates = [
    queryAttr(
      ['meta[property="og:title"]', 'meta[name="twitter:title"]'],
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
      && !/^(?:storm|stormd|anisto|mangasto|movisto|anime|watch anime)$/i.test(
        title,
      )
    ) {
      return title
    }
  }

  return undefined
}

function getVideo(): HTMLVideoElement | undefined {
  return Array.from(
    document.querySelectorAll<HTMLVideoElement>('video'),
  ).find(video => !video.ended && video.readyState > 0)
}

function isWatchPage(): boolean {
  const url = `${window.location.pathname}${window.location.search}`.toLowerCase()

  const watchRoutes = [
    /\/watch\b/,
    /\/episode\b/,
    /\/play\b/,
    /[?&](?:episode|ep)=/,
  ]

  return watchRoutes.some(pattern => pattern.test(url)) || Boolean(getVideo())
}

function getWatchState(): WatchState {
  return {
    title: getAnimeTitle() ?? 'Unknown Anime',
    source: sourceFromSelectedControl() ?? sourceFromUrl(),
    episode: getEpisode(),
    url: window.location.href,
    video: getVideo(),
  }
}

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

function buildActivity(watch: WatchState): PresenceData {
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

let lastSnapshot = ''

presence.on('UpdateData', async () => {
  if (!isWatchPage()) {
    if (lastSnapshot !== '') {
      lastSnapshot = ''
      presence.clearActivity()
    }

    return
  }

  const activity = buildActivity(getWatchState())
  const snapshot = JSON.stringify(activity)

  if (snapshot === lastSnapshot) {
    return
  }

  lastSnapshot = snapshot
  presence.setActivity(activity)
})