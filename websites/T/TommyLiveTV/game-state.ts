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

function activity(details: string, state = '', options: ActivityOptions = {}): PresenceData {
  const {
    type = ActivityType.Playing,
    name = 'TommyLiveTV',
    pageUrl = '',
    playback = null,
  } = options
  const common = {
    name,
    details,
    ...(state ? { state } : {}),
    largeImageKey: LOGO,
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
      return activity(title, 'TommyLiveTV', { type: ActivityType.Watching, pageUrl, playback })
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
      return activity(eventTitle, 'TommyLiveTV', { type: ActivityType.Watching, name: 'SportsLive', pageUrl })
    }
    return activity('Browsing TommyLiveTV', 'SportsLive')
  }

  return activity('Browsing TommyLiveTV', browsingState(pathname))
}
