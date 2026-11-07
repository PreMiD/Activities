import type { RouteContext } from './routes/index.js'

import { ActivityAssets } from './constants.js'
import { route } from './routes/index.js'
import {
  getState,
  updateState,
} from './state/presence-state.js'

const presence = new Presence({
  clientId: '1507679791053144114',
})

interface IframeVideoState {
  currentTime: number
  duration: number
  paused: boolean
  referrer?: string
}

function cleanText(text?: string | null): string {
  return text?.replace(/\s+/g, ' ').trim() ?? ''
}

function getMetaContent(selector: string): string {
  return cleanText(
    document.querySelector<HTMLMetaElement>(selector)?.content,
  )
}

function getLinkHref(selector: string): string {
  return cleanText(
    document.querySelector<HTMLLinkElement>(selector)?.href,
  )
}

function getResolvedPageUrl(): URL {
  const candidates = [
    getLinkHref('link[rel="canonical"]'),
    getMetaContent('meta[property="og:url"]'),
    document.location.href,
  ]

  for (const candidate of candidates) {
    if (!candidate)
      continue

    try {
      return new URL(candidate, document.location.origin)
    }
    catch {

    }
  }

  return new URL(document.location.href)
}

function detectPageRoute(): 'home' | 'search' | 'schedule' | 'anime' | 'watch' | 'other' {
  const pathname = document.location.pathname
  const canonicalPathname = (() => {
    try {
      return new URL(getLinkHref('link[rel="canonical"]') || getMetaContent('meta[property="og:url"]')).pathname
    }
    catch {
      return ''
    }
  })()
  const title = cleanText(document.title)

  if (
    pathname.startsWith('/watch/')
    || canonicalPathname.startsWith('/watch/')
    || document.querySelector('a.episode-playing')
    || document.querySelector('.watch-servers-enter')
    || document.querySelector('.progress-line-animated')
    || document.querySelector('[data-episodes-container]')
    || /Episode\s+\d+/i.test(title)
  ) {
    return 'watch'
  }

  if (
    pathname.startsWith('/anime/')
    || canonicalPathname.startsWith('/anime/')
    || document.querySelector('h2[title]')
    || document.querySelector('.watch-sidebar-enter')
  ) {
    return 'anime'
  }

  if (pathname === '/' || pathname === '/home')
    return 'home'

  if (pathname.startsWith('/search'))
    return 'search'

  if (pathname.startsWith('/schedule'))
    return 'schedule'

  return 'other'
}

function getAnimeTitle(): string {
  const headingTitle = cleanText(document.querySelector('h2[title]')?.textContent)
  const ogTitle = getMetaContent('meta[property="og:title"]')
    .replace(/^Watch\s+/i, '')
    .replace(/\s+Episode\s+\d+\s+Online Free\s+\|\s+Re:ANIME$/i, '')
  const pageTitle = cleanText(document.title)
    .replace(/\s*-\s*Episode\s+\d+\s*\|\s*Re:ANIME$/i, '')
    .replace(/\s*\|\s*Re:ANIME$/i, '')

  return headingTitle || ogTitle || pageTitle || 'Re:Anime'
}

function getPoster(): string {
  const sidebarPoster = document.querySelector<HTMLImageElement>(
    'img[src*="anilistcdn/media/anime/cover"]',
  )?.src
  const ogImage = getMetaContent('meta[property="og:image"]')
  const twitterImage = getMetaContent('meta[name="twitter:image"]')
  const sitePoster = document.querySelector<HTMLImageElement>(
    '.watch-sidebar-enter img, .watch-info-enter img',
  )?.src

  const candidates = [sidebarPoster, ogImage, twitterImage, sitePoster]
    .map(url => cleanText(url))
    .filter(Boolean)

  for (const candidate of candidates) {
    try {
      const url = new URL(candidate)

      if (
        url.protocol === 'https:'
        && !url.href.startsWith('data:')
        && !url.pathname.includes('/placeholder')
        && /\.(?:png|jpe?g|webp|gif)$/i.test(url.pathname)
      ) {
        return url.href
      }
    }
    catch {

    }
  }

  return (
    ActivityAssets.Thumbnail
    || ActivityAssets.Logo
  )
}

function getCurrentEpisodeLabel(): string {
  const activeCardLabel = cleanText(
    document.querySelector('a.episode-playing .line-clamp-1')?.textContent,
  )

  if (activeCardLabel) {
    const separatorIndex = activeCardLabel.indexOf('. ')
    if (separatorIndex > 0) {
      const episodeNumber = activeCardLabel.slice(0, separatorIndex).trim()
      const episodeTitle = activeCardLabel.slice(separatorIndex + 2).trim()

      if (/^\d+$/.test(episodeNumber) && /^Episode\s+\d+$/i.test(episodeTitle))
        return episodeTitle

      if (/^\d+$/.test(episodeNumber) && episodeTitle)
        return `Episode ${episodeNumber}: ${episodeTitle}`
    }

    return activeCardLabel
  }

  const watchBoxLabel = cleanText(
    document.querySelector('.watch-servers-enter .text-primary')?.textContent,
  )

  if (watchBoxLabel)
    return `Episode ${watchBoxLabel.replace(/^Episode\s*/i, '')}`

  const ep = new URLSearchParams(document.location.search).get('ep')
  return ep ? `Episode ${ep}` : 'Watching Anime'
}

function getWatchingStateLabel(episodeLabel: string): string {
  const normalized = episodeLabel.replace(/^Watching\s+/i, '').trim()

  if (/^Episode\s+\d+/i.test(normalized))
    return `Watching ${normalized}`

  return normalized ? `Watching ${normalized}` : 'Watching Anime'
}

function getAnimeDetailUrl(): string | null {
  const directLink = document.querySelector<HTMLAnchorElement>(
    'a[href^="/anime/"]',
  )?.href

  if (directLink)
    return directLink

  const canonical = getLinkHref('link[rel="canonical"]')
  if (canonical.includes('/watch/')) {
    return canonical
      .replace('/watch/', '/anime/')
      .replace(/\?.*$/, '')
  }

  return null
}

function getSeasonEpisodeText(episode: string): string | undefined {
  const season = getAnimeTitle().match(/Season\s+(\d+)/i)?.[1]

  if (season && episode)
    return `Season ${season}, Episode ${episode}`
}

function getSearchQuery(): string {
  const params = new URLSearchParams(document.location.search)
  return (
    params.get('q')
    || cleanText(
      document.querySelector<HTMLInputElement>('input[placeholder*="Search"]')
        ?.value,
    )
  )
}

function getWatchContext(): {
  episode: string
  language: string
} {
  const params = new URLSearchParams(document.location.search)
  return {
    episode: params.get('ep') ?? '',
    language: (params.get('lang') ?? '').toUpperCase(),
  }
}

presence.on('iFrameData', (data: IframeVideoState) => {
  if (data.referrer) {
    try {
      const refUrl = new URL(data.referrer)
      const currentUrl = new URL(document.location.href)

      if (refUrl.origin !== currentUrl.origin)
        return
    }
    catch {

    }
  }

  updateState({
    iframePlayback: {
      currentTime: data.currentTime ?? 0,
      duration: data.duration ?? 0,
      paused: data.paused ?? true,
      referrer: data.referrer,
    },
  })
})

function getDurationFromPage(): number {
  const ldJsonScripts = document.querySelectorAll<HTMLScriptElement>(
    'script[type="application/ld+json"]',
  )

  for (const script of ldJsonScripts) {
    const text = script.textContent
    if (!text?.includes('"@type":"TVEpisode"'))
      continue

    const durationMatch = text.match(/"duration":"PT(?:(\d+)M)?(?:(\d+)S)?"/)
    if (!durationMatch)
      continue

    const minutes = Number(durationMatch[1] ?? 0)
    const seconds = Number(durationMatch[2] ?? 0)
    const duration = minutes * 60 + seconds

    if (duration > 0)
      return duration
  }

  return 0
}

function getProgressBarCurrentTime(duration: number): number {
  const progressLine = document.querySelector<HTMLElement>(
    'a.episode-playing .progress-line-animated',
  )

  const width = progressLine?.style.width
  if (!width?.endsWith('%') || duration <= 0)
    return 0

  const percent = Number(width.replace('%', '').trim())
  if (Number.isNaN(percent) || percent <= 0)
    return 0

  return duration * (percent / 100)
}

function readPlaybackStateFromPage(): {
  currentTime: number
  duration: number
} {
  const ldJsonDuration = getDurationFromPage()
  const progressBarCurrentTime = getProgressBarCurrentTime(ldJsonDuration)

  if (progressBarCurrentTime > 0 && ldJsonDuration > 0) {
    return {
      currentTime: progressBarCurrentTime,
      duration: ldJsonDuration,
    }
  }

  const scripts = document.scripts

  for (const script of scripts) {
    const text = script.textContent
    if (!text)
      continue

    const watchProgressMatch = text.match(
      /watch_progress:\{currentTime:([0-9.]+),duration:([0-9.]+)/,
    )
    if (watchProgressMatch?.[1] && watchProgressMatch?.[2]) {
      const currentTime = Number(watchProgressMatch[1])
      const duration = Number(watchProgressMatch[2])

      if (progressBarCurrentTime > 0 && duration > 0) {
        return {
          currentTime: progressBarCurrentTime,
          duration,
        }
      }

      return {
        currentTime,
        duration,
      }
    }

    const progressMatch = text.match(
      /progress:\{current_time:([0-9.]+),duration:([0-9.]+)/,
    )
    if (progressMatch?.[1] && progressMatch?.[2]) {
      const currentTime = Number(progressMatch[1])
      const duration = Number(progressMatch[2])

      if (progressBarCurrentTime > 0 && duration > 0) {
        return {
          currentTime: progressBarCurrentTime,
          duration,
        }
      }

      return {
        currentTime,
        duration,
      }
    }

    const fallbackMatch = text.match(
      /current:([0-9.]+),duration:([0-9.]+)/,
    )
    if (fallbackMatch?.[1] && fallbackMatch?.[2]) {
      const currentTime = Number(fallbackMatch[1])
      const duration = Number(fallbackMatch[2])

      if (progressBarCurrentTime > 0 && duration > 0) {
        return {
          currentTime: progressBarCurrentTime,
          duration,
        }
      }

      return {
        currentTime,
        duration,
      }
    }
  }

  return {
    currentTime: 0,
    duration: 0,
  }
}

function getPlaybackState(href: string): {
  currentTime: number
  duration: number
  paused: boolean
} {
  const now = Date.now()
  const state = getState()

  if (state.iframePlayback.duration > 0 || state.iframePlayback.currentTime > 0) {
    return {
      currentTime: state.iframePlayback.currentTime,
      duration: state.iframePlayback.duration,
      paused: state.iframePlayback.paused,
    }
  }

  if (href !== state.lastPlaybackHref) {
    updateState({
      lastPlaybackHref: href,
      lastPlaybackRead: 0,
      playbackState: {
        currentTime: 0,
        duration: 0,
        sampledAt: now,
        paused: false,
        stagnantSamples: 0,
      },
    })
  }

  if (now - state.lastPlaybackRead > 3000) {
    updateState({ lastPlaybackRead: now })

    const sampled = readPlaybackStateFromPage()
    const predictedCurrentTime = state.playbackState.sampledAt > 0 && !state.playbackState.paused
      ? state.playbackState.currentTime + (now - state.playbackState.sampledAt) / 1000
      : 0
    const difference = sampled.currentTime - predictedCurrentTime
    const sampleDidNotMove = Math.abs(sampled.currentTime - state.playbackState.currentTime) <= 0.15

    let stagnantSamples = sampleDidNotMove && sampled.currentTime > 0
      ? state.playbackState.stagnantSamples + 1
      : 0
    let nextCurrentTime = predictedCurrentTime > 0
      ? predictedCurrentTime
      : sampled.currentTime
    let paused = stagnantSamples >= 2 && Math.abs(difference) <= 2

    const shouldAcceptCheckpoint = state.playbackState.currentTime <= 0
      || Math.abs(difference) >= 8
      || difference >= 12

    if (shouldAcceptCheckpoint && sampled.currentTime > 0) {
      nextCurrentTime = sampled.currentTime
      stagnantSamples = 0
      paused = false
    }
    else if (paused) {
      nextCurrentTime = sampled.currentTime > 0
        ? sampled.currentTime
        : state.playbackState.currentTime
    }

    updateState({
      playbackState: {
        currentTime: nextCurrentTime,
        duration: sampled.duration || state.playbackState.duration,
        sampledAt: now,
        paused: state.iframePlayback.duration > 0 || state.iframePlayback.currentTime > 0
          ? state.iframePlayback.paused
          : paused,
        stagnantSamples,
      },
    })
  }

  const currentState = getState()
  const elapsedSeconds = currentState.playbackState.sampledAt > 0
    ? (now - currentState.playbackState.sampledAt) / 1000
    : 0

  const currentTime = Math.min(
    currentState.playbackState.currentTime + (currentState.playbackState.paused ? 0 : elapsedSeconds),
    currentState.playbackState.duration || Number.POSITIVE_INFINITY,
  )

  return {
    currentTime,
    duration: currentState.playbackState.duration,
    paused: currentState.playbackState.paused,
  }
}

presence.on('UpdateData', async () => {
  const [privacy, showButtons, displayType] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<number>('displayType'),
  ])
  const resolvedUrl = getResolvedPageUrl()
  const href = resolvedUrl.href
  const routeName = detectPageRoute()
  const animeTitle = getAnimeTitle()
  const poster = getPoster()

  const context: RouteContext = {
    presence,
    privacy,
    showButtons,
    displayType,
    href,
    resolvedUrl,
    animeTitle,
    poster,
    browsingTimestamp: getState().browsingTimestamp,
  }

  // Add route-specific data
  if (routeName === 'watch') {
    const { episode, language } = getWatchContext()
    const episodeLabel = getCurrentEpisodeLabel()
    const detailUrl = getAnimeDetailUrl()
    const seasonEpisodeText = getSeasonEpisodeText(episode)
    const { currentTime, duration, paused } = getPlaybackState(href)

    Object.assign(context, {
      episode,
      language,
      episodeLabel,
      watchingStateLabel: getWatchingStateLabel(episodeLabel),
      detailUrl,
      seasonEpisodeText,
      currentTime,
      duration,
      paused,
    })
  }
  else if (routeName === 'search') {
    context.searchQuery = getSearchQuery()
  }

  route(routeName, context)
})
