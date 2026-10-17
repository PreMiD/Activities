import { timestampFromFormat } from 'premid'

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
  getPlaybackTimes: () => [number, number] | null
  hasValidPlaybackState: () => boolean
  isPlaying: () => boolean
  isAdPlaying: () => boolean
}

function getTextContent(selector: string): string | undefined {
  const text = document.querySelector(selector)?.textContent?.trim()

  return text && text.length > 0 ? text : undefined
}

function getValidImageSource(...selectors: string[]): string | undefined {
  for (const selector of selectors) {
    for (const image of document.querySelectorAll<HTMLImageElement>(selector)) {
      if (image.src && /^https?:/.test(image.src))
        return image.src
    }
  }
}

function getPlayerLinks(): HTMLAnchorElement[] {
  return [
    ...document.querySelectorAll<HTMLAnchorElement>(
      '.byline.ytmusic-player-bar a, ytmusic-player-bar .subtitle a',
    ),
  ]
}

function firstNonEmpty(...values: (string | null | undefined)[]): string | undefined {
  for (const value of values) {
    const trimmed = value?.trim()
    if (trimmed)
      return trimmed
  }
  return undefined
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
    const artwork = getValidImageSource('ytmusic-player-bar img.image', '#song-image img', 'ytmusic-player-bar img#img')

    const complexInfo = document.querySelector('.complex-string.ytmusic-player-bar')
    const albumFromElement = albumElement?.textContent?.trim()
    const albumFromComplex = complexInfo?.querySelector('a:last-child')?.textContent?.trim()
    const album = (albumFromElement && albumFromElement.length > 0)
      ? albumFromElement
      : (albumFromComplex && albumFromComplex.length > 0)
          ? albumFromComplex
          : undefined

    const metadata = this.mediaSession?.metadata
    const mergedTitle = firstNonEmpty(metadata?.title, title)
    const mergedArtist = firstNonEmpty(metadata?.artist, artistElement?.textContent)
    const hasMediaDetails = Boolean(mergedTitle || mergedArtist)

    let playbackState = getPlaybackStateFromVideo(videoElement, hasMediaDetails)
    if (playbackState === 'none' && metadata && (mediaSessionState === 'playing' || mediaSessionState === 'paused'))
      playbackState = mediaSessionState
    if (playbackState === 'none' && hasMediaDetails)
      playbackState = getPlaybackStateFromControls()

    if (playbackState === 'none') {
      return { playbackState }
    }

    return {
      playbackState,
      title: mergedTitle,
      artist: mergedArtist,
      album: firstNonEmpty(metadata?.album, album),
      artwork: firstNonEmpty(metadata?.artwork?.at(-1)?.src, artwork),
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
    return document.querySelector<HTMLMediaElement>('.html5-main-video')
      ?? document.querySelector<HTMLMediaElement>('.video-stream')
      ?? [...document.querySelectorAll<HTMLMediaElement>('video, audio')]
        .find(media => media.currentSrc && Number.isFinite(media.duration) && media.duration > 0)
        ?? null
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

    const times = timeText?.split(' / ') ?? []
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

  getPlaybackTimes(): [number, number] | null {
    const media = this.getVideoElement()
    if (media && Number.isFinite(media.duration) && media.duration > 0)
      return [media.currentTime, media.duration]

    const times = this.getCurrentAndTotalTime()
    if (!times)
      return null

    const current = timestampFromFormat(times[0])
    const total = timestampFromFormat(times[1])
    return total > 0 ? [current, total] : null
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
