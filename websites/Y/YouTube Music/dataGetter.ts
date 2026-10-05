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
}

function getTextContent(selector: string): string | undefined {
  const text = document.querySelector(selector)?.textContent?.trim()

  return text && text.length > 0 ? text : undefined
}

function getValidImageSource(selector: string): string | undefined {
  const src = document.querySelector<HTMLImageElement>(selector)?.src

  return src && !src.startsWith('data:') ? src : undefined
}

function getPlayerLinks(): HTMLAnchorElement[] {
  return [
    ...document.querySelectorAll<HTMLAnchorElement>(
      '.byline.ytmusic-player-bar a, ytmusic-player-bar .subtitle a',
    ),
  ]
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
        artwork: this.mediaSession.metadata.artwork?.at(-1)?.src,
        duration: videoElement?.duration,
      }
    }

    if (playerPlaybackState === 'none') {
      return { playbackState: playerPlaybackState }
    }

    return {
      playbackState: playerPlaybackState,
      title,
      artist: artistElement?.textContent?.trim() || undefined,
      album,
      artwork,
      duration: videoElement?.duration,
    }
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
}
