export interface MediaData {
  playbackState: 'playing' | 'paused' | 'none'
  title?: string
  artist?: string
  album?: string
  artwork?: string
  duration?: number
}

export interface MediaDataGetter {
  getMediaData: () => MediaData
  getWatchId: () => string | undefined
  getRepeatMode: () => string | null
  getVideoElement: () => HTMLMediaElement | null
  getAlbumArtistLink: () => string | undefined
  getArtistLink: () => string | undefined
  getCurrentAndTotalTime: () => [string, string] | null
  hasValidPlaybackState: () => boolean
  isPlaying: () => boolean
  isAdPlaying: () => boolean
}

function getTextContent(selector: string): string | undefined {
  const text = document.querySelector(selector)?.textContent?.trim()

  return text && text.length > 0 ? text : undefined
}

/**
 * Discord only accepts public http(s) images with a short URL, so
 * placeholders (data:/blob:) and very long URLs are discarded.
 */
function cleanArtwork(url: string | undefined): string | undefined {
  if (!url || !/^https?:\/\//.test(url))
    return undefined

  let cleaned = url
  if (/^https?:\/\/[^/]*ytimg\.com\//.test(cleaned))
    cleaned = cleaned.split('?')[0] ?? cleaned
  else if (/googleusercontent\.com|ggpht\.com/.test(cleaned))
    cleaned = cleaned.replace(/=w\d+-h\d[^/?]*$/, '=w544-h544-l90-rj')

  return cleaned.length > 250 ? undefined : cleaned
}

function getValidImageSource(selector: string): string | undefined {
  for (const image of document.querySelectorAll<HTMLImageElement>(selector)) {
    const src = cleanArtwork(image.currentSrc || image.src)
    if (src)
      return src
  }

  return undefined
}

function getPlayerLinks(): HTMLAnchorElement[] {
  return [
    ...document.querySelectorAll<HTMLAnchorElement>(
      '.byline.ytmusic-player-bar a, ytmusic-player-bar .subtitle a',
    ),
  ]
}

/**
 * Returns every credited artist (e.g. "Artist A, Artist B y Artist C").
 * The first segment of the player bar byline holds all of them, while the
 * links only give access to the first one reliably.
 */
function getArtistsText(): string | undefined {
  const text = document
    .querySelector('.byline.ytmusic-player-bar, ytmusic-player-bar .subtitle')
    ?.textContent
    ?.replace(/\s+/g, ' ')
    .trim()
    .split('•')[0]
    ?.trim()

  return text && text.length > 0 ? text : undefined
}

function getPlaybackStateFromControls(): MediaData['playbackState'] {
  const playPauseButton = document.querySelector<HTMLElement>('#play-pause-button')
  const label = [
    playPauseButton?.getAttribute('title'),
    playPauseButton?.getAttribute('aria-label'),
    playPauseButton?.querySelector('button')?.getAttribute('title'),
    playPauseButton?.querySelector('button')?.getAttribute('aria-label'),
  ].find(Boolean)?.toLowerCase()

  if (label === 'pause')
    return 'playing'

  if (label === 'play')
    return 'paused'

  return 'none'
}

function getPlaybackStateFromVideo(
  videoElement: HTMLMediaElement | null,
  hasMediaDetails: boolean,
): MediaData['playbackState'] {
  if (!videoElement)
    return 'none'

  if (!videoElement.paused && !videoElement.ended)
    return 'playing'

  if (Number.isFinite(videoElement.duration) && videoElement.duration > 0 && hasMediaDetails)
    return 'paused'

  return 'none'
}

export class YouTubeMusicDataGetter implements MediaDataGetter {
  private mediaSession: MediaSession | undefined

  constructor() {
    this.mediaSession = navigator.mediaSession
  }

  getMediaData(): MediaData {
    const mediaSessionState = this.mediaSession?.playbackState
    const videoElement = this.getVideoElement()
    const title = getTextContent('.title.ytmusic-player-bar, ytmusic-player-bar .middle-controls .title')
    const artistElements = getPlayerLinks()
    const artistElement = artistElements[0]
    const albumElement = artistElements.length > 1 ? artistElements[1] : null
    const artwork = getValidImageSource('#song-image img, ytmusic-player-bar img#img')

    const complexInfo = document.querySelector('.complex-string.ytmusic-player-bar')
    const albumFromElement = albumElement?.textContent?.trim()
    const albumFromComplex = complexInfo?.querySelector('a:last-child')?.textContent?.trim()
    const album = (albumFromElement && albumFromElement.length > 0)
      ? albumFromElement
      : (albumFromComplex && albumFromComplex.length > 0)
          ? albumFromComplex
          : undefined

    const controlPlaybackState = getPlaybackStateFromControls()
    const playbackState = getPlaybackStateFromVideo(
      videoElement,
      Boolean(title || artistElement || this.mediaSession?.metadata),
    )
    const playerPlaybackState = controlPlaybackState === 'none'
      ? playbackState
      : controlPlaybackState

    if (this.mediaSession?.metadata && ['playing', 'paused'].includes(mediaSessionState ?? '')) {
      return {
        playbackState: playerPlaybackState === 'none'
          ? mediaSessionState as 'playing' | 'paused'
          : playerPlaybackState,
        title: this.mediaSession.metadata.title,
        artist: this.mediaSession.metadata.artist,
        album: this.mediaSession.metadata.album,
        artwork: this.getMediaSessionArtwork() ?? artwork ?? this.getArtworkFallback(),
        duration: videoElement?.duration,
      }
    }

    if (playerPlaybackState === 'none') {
      return { playbackState: playerPlaybackState }
    }

    return {
      playbackState: playerPlaybackState,
      title,
      artist: getArtistsText() ?? (artistElement?.textContent?.trim() || undefined),
      album,
      artwork: artwork ?? this.getArtworkFallback(),
      duration: videoElement?.duration,
    }
  }

  private getMediaSessionArtwork(): string | undefined {
    const images = this.mediaSession?.metadata?.artwork
    if (!images)
      return undefined

    for (const image of [...images].reverse()) {
      const src = cleanArtwork(image.src)
      if (src)
        return src
    }

    return undefined
  }

  private getArtworkFallback(): string | undefined {
    const watchId = this.getWatchId()

    return watchId ? `https://i.ytimg.com/vi/${watchId}/hqdefault.jpg` : undefined
  }

  getWatchId(): string | undefined {
    const { href } = document.location
    const urlMatch = href.match(/v=([^&#]{5,})/)?.[1]
    if (urlMatch)
      return urlMatch

    return document
      .querySelector<HTMLAnchorElement>('a.ytp-title-link.yt-uix-sessionlink')
      ?.href
      .match(/v=([^&#]{5,})/)?.[1]
  }

  getRepeatMode(): string | null {
    return document
      .querySelector('ytmusic-player-bar[slot="player-bar"]')
      ?.getAttribute('repeat-mode') ?? null
  }

  getVideoElement(): HTMLMediaElement | null {
    return document.querySelector<HTMLMediaElement>('.video-stream, video')
  }

  getAlbumArtistLink(): string | undefined {
    const mediaData = this.getMediaData()
    const links = getPlayerLinks()

    if (mediaData.album && links.length > 0) {
      return links.at(-1)?.href
    }

    return links[0]?.href
  }

  getArtistLink(): string | undefined {
    return getPlayerLinks()[0]?.href
  }

  getCurrentAndTotalTime(): [string, string] | null {
    const timeText = document
      .querySelector<HTMLSpanElement>('#left-controls > span')
      ?.textContent
      ?.trim()

    if (!timeText)
      return null

    const times = timeText.split(' / ')
    if (times.length === 2 && times[0] && times[1]) {
      return [times[0].trim(), times[1].trim()]
    }

    const progressBar = document.querySelector('.time-info')
    if (progressBar) {
      const currentTime = progressBar.querySelector('.time-info-current')?.textContent?.trim()
      const totalTime = progressBar.querySelector('.time-info-total')?.textContent?.trim()
      if (currentTime && totalTime) {
        return [currentTime, totalTime]
      }
    }

    return null
  }

  hasValidPlaybackState(): boolean {
    return this.getMediaData().playbackState !== 'none'
  }

  isPlaying(): boolean {
    return this.getMediaData().playbackState === 'playing'
  }

  isAdPlaying(): boolean {
    return Boolean(
      document.querySelector(
        '.html5-video-player.ad-showing, .html5-video-player.ad-interrupting, .ytp-ad-player-overlay, .ytp-ad-text',
      ),
    )
  }
}