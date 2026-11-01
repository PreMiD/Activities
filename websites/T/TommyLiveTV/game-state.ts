import { ActivityType } from 'premid'

const HOME = 'https://watch.tommytrace.com/'
const LOGO = 'https://raw.githubusercontent.com/jackreacherdota/Activities/9132e5093f99ecb397ec5fd05dcfd24f81979a65/websites/T/TommyLiveTV/assets/logo.png'

interface PlaybackTimes {
  startTimestamp: number
  endTimestamp: number
}

interface ActivityOptions {
  type?: ActivityType.Playing | ActivityType.Watching
  name?: string
  pageUrl?: string
  playback?: PlaybackTimes | null
  imageUrl?: string
  smallImageKey?: string
  smallImageText?: string
}

function isVisible(element: Element | null | undefined): boolean {
  if (!element || !element.isConnected)
    return false

  const view = element.ownerDocument?.defaultView
  for (let current: Element | null = element; current; current = current.parentElement) {
    if (current.hasAttribute('hidden') || current.getAttribute('aria-hidden') === 'true' || current.classList.contains('hidden'))
      return false

    const style = view?.getComputedStyle?.(current)
    if (style && (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0))
      return false
  }
  return true
}

function cleanText(value: string | null | undefined, maxLength = 112): string {
  const text = String(value ?? '')
    // eslint-disable-next-line no-control-regex -- strip control characters from page-provided titles
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (!text)
    return ''
  if (text.length <= maxLength)
    return text
  return `${text.slice(0, maxLength - 1).trimEnd()}…`
}

function readVisibleText(document: Document, selector: string, maxLength?: number): string {
  const element = document.querySelector(selector)
  if (!element || !isVisible(element))
    return ''
  return cleanText(element.textContent, maxLength)
}

function safeArtworkUrl(value: string | null | undefined): string | null {
  if (!value)
    return null

  try {
    const url = new URL(value, HOME)
    return url.protocol === 'https:' && url.origin === 'https://image.tmdb.org'
      ? url.href
      : null
  }
  catch {
    return null
  }
}

function readTitleArtwork(document: Document): string | null {
  const backdrop = document.querySelector<HTMLElement>('.media-detail-backdrop')
  if (backdrop && isVisible(backdrop)) {
    const backgroundImage = backdrop.style.backgroundImage
      || backdrop.ownerDocument.defaultView?.getComputedStyle(backdrop).backgroundImage
      || ''
    const backgroundUrl = /url\((?:"|')?([^"')]+)(?:"|')?\)/i.exec(backgroundImage)?.[1]
    const safeBackgroundUrl = safeArtworkUrl(backgroundUrl)
    if (safeBackgroundUrl)
      return safeBackgroundUrl
  }

  const poster = document.querySelector<HTMLImageElement>('.media-detail-poster')
  return poster && isVisible(poster)
    ? safeArtworkUrl(poster.currentSrc || poster.src || poster.getAttribute('src'))
    : null
}

function titleArtworkOptions(document: Document): Pick<ActivityOptions, 'imageUrl' | 'smallImageKey' | 'smallImageText'> {
  const imageUrl = readTitleArtwork(document)
  return imageUrl
    ? { imageUrl, smallImageKey: LOGO, smallImageText: 'TommyLiveTV' }
    : {}
}

function browsingState(pathname: string): string {
  if (pathname === '/')
    return 'Home'
  if (pathname === '/browse' || pathname.startsWith('/channel/'))
    return 'Browse'
  if (pathname.startsWith('/movies'))
    return 'Movies & TV'
  if (pathname.startsWith('/live/sports'))
    return 'SportsLive'
  if (pathname.startsWith('/live'))
    return 'Live TV'
  if (pathname === '/following')
    return 'Following'
  return 'Browsing'
}

function formatPlaybackTime(totalSeconds: number): string {
  const seconds = Math.floor(Math.max(0, totalSeconds))
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainder = seconds % 60
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`
    : `${minutes}:${String(remainder).padStart(2, '0')}`
}

function compactPlaybackState(playback: PlaybackTimes, now = Date.now()): string {
  const duration = playback.endTimestamp - playback.startTimestamp
  if (!Number.isFinite(duration) || duration <= 0)
    return 'TommyLiveTV'

  const elapsed = Math.min(duration, Math.max(0, now - playback.startTimestamp))
  const barLength = 8
  const filled = Math.round((elapsed / duration) * barLength)
  const bar = `${'█'.repeat(filled)}${'░'.repeat(barLength - filled)}`
  return `${formatPlaybackTime(elapsed / 1000)} ${bar} ${formatPlaybackTime(duration / 1000)}`
}

function activity(details: string, state = '', options: ActivityOptions = {}): PresenceData {
  const {
    type = ActivityType.Playing,
    name = 'TommyLiveTV',
    pageUrl = '',
    playback = null,
    imageUrl = LOGO,
    smallImageKey,
    smallImageText,
  } = options
  // Discord's compact member popout omits timestamps, so mirror playback progress in its visible state line.
  const visibleState = type === ActivityType.Watching && playback
    ? compactPlaybackState(playback)
    : state
  const common = {
    name,
    details,
    ...(visibleState ? { state: visibleState } : {}),
    largeImageKey: imageUrl,
    ...(smallImageKey ? { smallImageKey } : {}),
    ...(smallImageText ? { smallImageText } : {}),
  }

  if (type === ActivityType.Watching) {
    const data: MediaPresenceData = {
      ...common,
      type: ActivityType.Watching,
      largeImageText: 'TommyLiveTV',
    }
    if (playback && Number.isFinite(playback.startTimestamp) && Number.isFinite(playback.endTimestamp)) {
      data.startTimestamp = playback.startTimestamp
      data.endTimestamp = playback.endTimestamp
    }
    if (pageUrl) {
      data.detailsUrl = pageUrl
      data.buttons = [{
        label: name === 'SportsLive' ? 'Watch this event' : 'Watch this title',
        url: pageUrl,
      }]
    }
    return data
  }

  return {
    ...common,
    type: ActivityType.Playing,
  }
}

/** Reads only the current visible TommyLiveTV page; it never reads account or history data. */
export function createPresenceData(
  document: Document,
  location: Pick<Location, 'protocol' | 'pathname'>,
  playback: PlaybackTimes | null = null,
): PresenceData | null {
  if (location.protocol !== 'https:')
    return null

  const pathname = location.pathname || '/'

  if (pathname.startsWith('/movies/movie/') || pathname.startsWith('/movies/tv/')) {
    const title = readVisibleText(document, '.media-now-playing .media-now-playing-title')
    if (title && !/^loading\b/i.test(title)) {
      const pageUrl = new URL(pathname, HOME).href
      return activity(title, '', {
        type: ActivityType.Watching,
        pageUrl,
        playback,
        ...titleArtworkOptions(document),
      })
    }
    return activity('Browsing TommyLiveTV', 'Movies & TV')
  }

  if (pathname === '/live/sports' || pathname === '/live/sports/') {
    // Channel pages use cross-origin players; report the selected visible channel from the parent page.
    const playerCard = Array.from(document.querySelectorAll('.sports-cooking-player-card'))
      .find(card => isVisible(card) && isVisible(card.querySelector('iframe, video')))
    const channelHeading = playerCard?.querySelector('.sports-cooking-player-heading strong')
    const channelTitle = channelHeading && isVisible(channelHeading)
      ? cleanText(channelHeading.textContent, 96)
      : ''
    if (channelTitle) {
      const pageUrl = new URL(pathname, HOME).href
      return activity(channelTitle, 'Live TV', { type: ActivityType.Watching, pageUrl })
    }
    return activity('Browsing TommyLiveTV', 'SportsLive')
  }

  if (pathname.startsWith('/live/sports/') && pathname !== '/live/sports/teams') {
    const eventTitle = readVisibleText(document, '.sports-player-header h1', 96)
    const playerFrame = document.querySelector('.sports-player-frame iframe')
    if (eventTitle && !/^loading\b/i.test(eventTitle) && isVisible(playerFrame)) {
      const pageUrl = new URL(pathname, HOME).href
      return activity(eventTitle, '', { type: ActivityType.Watching, name: 'SportsLive', pageUrl })
    }
    return activity('Browsing TommyLiveTV', 'SportsLive')
  }

  return activity('Browsing TommyLiveTV', browsingState(pathname))
}
