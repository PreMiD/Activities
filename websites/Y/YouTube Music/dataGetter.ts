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

  return text && text.length > 0
    ? text
    : undefined
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
      '.byline.ytmusic-player-bar a, ytmusic-player-bar .subtitle a, .ytmusicTrackInfoByline a[href]',
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

// 2026 mini player has only one byline element ("Artist • Album • Year"), no artist/album anchors
function parseCompactByline(): { artist?: string, album?: string } {
  const raw = document.querySelector('.ytmusicTrackInfoByline')?.textContent?.trim()
  if (!raw)
    return {}

  const parts = raw.split('•').map(part => part.trim()).filter(Boolean)
  if (parts.length === 0)
    return {}

  const last = parts.at(-1)
  if (parts.length > 1 && last && /^\d{4}$/.test(last))
    parts.pop()

  return { artist: parts[0], album: parts[1] }
}

function getSelectedQueueItem(): HTMLElement | null {
  return document.querySelector<HTMLElement>('ytmusic-player-queue-item[selected]')
}

function getDocumentTitle(): string | undefined {
  return document.title?.replace(/\s*\|\s*YouTube Music\s*$/, '').trim() || undefined
}

function getPlaybackStateFromControls(): MediaData['playbackState'] {
  const playPauseButton = document.querySelector<HTMLElement>('#play-pause-button')
  const miniPlayerButton = document.querySelector<HTMLElement>(
    '.ytmusicPlayerControlsPlayPauseButton button',
  )
  const label = [
    playPauseButton?.getAttribute('title'),
    playPauseButton?.getAttribute('aria-label'),
    playPauseButton?.querySelector('button')?.getAttribute('title'),
    playPauseButton?.querySelector('button')?.getAttribute('aria-label'),
    miniPlayerButton?.getAttribute('aria-label'),
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
    const byline = parseCompactByline()
    const title = getTextContent(
      '.title.ytmusic-player-bar, ytmusic-player-bar .middle-controls .title, .ytmusicTrackInfoTitle',
    )
    const artistElements = getPlayerLinks()
    const artistElement = artistElements[0]
    const albumElement = artistElements.length > 1
      ? artistElements[1]
      : null
    const artwork = getValidImageSource(
      'ytmusic-player-bar img.image',
      '#song-image img',
      'ytmusic-player-bar img#img',
      '.ytmusicTrackInfoThumbnail',
    )

    const complexInfo = document.querySelector('.complex-string.ytmusic-player-bar')
    const albumFromElement = albumElement?.textContent?.trim()
    const albumFromComplex = complexInfo?.querySelector('a:last-child')?.textContent?.trim()
    const album = (albumFromElement && albumFromElement.length > 0)
      ? albumFromElement
      : (albumFromComplex && albumFromComplex.length > 0)
          ? albumFromComplex
          : undefined

    const queueItem = getSelectedQueueItem()
    const queueTitle = queueItem?.querySelector('.song-title')?.textContent?.trim()
    const queueByline = queueItem?.querySelector('.byline')?.textContent?.trim()

    const metadata = this.mediaSession?.metadata
    const mergedTitle = firstNonEmpty(metadata?.title, title, queueTitle, getDocumentTitle())
    const mergedArtist = firstNonEmpty(
      metadata?.artist,
      artistElement?.textContent,
      byline.artist,
      queueByline,
    )
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
      album: firstNonEmpty(metadata?.album, album, byline.album),
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
    const fromBar = document
      .querySelector('ytmusic-player-bar[slot="player-bar"]')
      ?.getAttribute('repeat-mode')
    if (fromBar)
      return fromBar

    const label = document
      .querySelector<HTMLElement>('.ytmusicPlayerControlsRepeatButton button')
      ?.getAttribute('aria-label')
      ?.toLowerCase()

    if (!label)
      return null
    if (label.includes('off'))
      return 'NONE'
    if (label.includes('one'))
      return 'ONE'
    if (label.includes('all'))
      return 'ALL'

    return null
  }

  getVideoElement(): HTMLMediaElement | null {
    return document.querySelector<HTMLMediaElement>('.html5-main-video')
      ?? document.querySelector<HTMLMediaElement>('.video-stream')
      ?? [
        ...document.querySelectorAll<HTMLMediaElement>('video, audio'),
      ]
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
      .querySelector<HTMLSpanElement>('#left-controls > span, .ytMusicMiniPlayerTimeInfo')
      ?.textContent
      ?.trim()

    const times = timeText?.split(' / ') ?? []
    if (times.length === 2 && times[0] && times[1]) {
      return [
        times[0].trim(),
        times[1].trim(),
      ]
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
    const progressBar = document.querySelector<HTMLElement>('#progress-bar')
    const current = Number(progressBar?.getAttribute('aria-valuenow'))
    const total = Number(progressBar?.getAttribute('aria-valuemax'))

    if (Number.isFinite(current) && Number.isFinite(total) && total > 0 && current >= 0 && current <= total)
      return [current, total]

    const miniPlayerSlider = document.querySelector<HTMLInputElement>(
      'input.ytMusicMiniPlayerProgressBar',
    )
    if (miniPlayerSlider) {
      const miniCurrent = Number(miniPlayerSlider.value)
      const miniTotal = Number(miniPlayerSlider.max)
      if (
        Number.isFinite(miniCurrent)
        && Number.isFinite(miniTotal)
        && miniTotal > 0
        && miniCurrent >= 0
        && miniCurrent <= miniTotal
      ) {
        return [miniCurrent, miniTotal]
      }
    }

    // DASH duration disagrees with the UI and keeps growing, displayed times should be a lot more reliable
    const textTimes = this.getCurrentAndTotalTime()
    if (textTimes) {
      const parsed: [number, number] = [
        timestampFromFormat(textTimes[0]),
        timestampFromFormat(textTimes[1]),
      ]
      if (parsed[1] > 0)
        return parsed
    }

    const videoElement = this.getVideoElement()
    if (
      videoElement
      && Number.isFinite(videoElement.currentTime)
      && Number.isFinite(videoElement.duration)
      && videoElement.duration > 0
    ) {
      return [videoElement.currentTime, videoElement.duration]
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
