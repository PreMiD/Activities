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

export class YouTubeMusicDataGetter implements MediaDataGetter {
  private mediaSession: MediaSession | undefined

  constructor() {
    this.mediaSession = navigator.mediaSession
  }

  getMediaData(): MediaData {
    const videoElement = this.getVideoElement()
    const playbackState = videoElement && Number.isFinite(videoElement.duration)
      ? videoElement.paused ? 'paused' : 'playing'
      : this.mediaSession?.playbackState

    const titleElement = document.querySelector('.ytmusicTrackInfoTitle, .title.ytmusic-player-bar')
    const artist = this.getArtistText()
    const artwork = this.getArtwork()

    if (videoElement && Number.isFinite(videoElement.duration) && titleElement?.textContent?.trim()) {
      return {
        playbackState: videoElement.paused ? 'paused' : 'playing',
        title: titleElement.textContent.trim(),
        artist,
        album: this.mediaSession?.metadata?.album,
        artwork,
        duration: videoElement.duration,
      }
    }

    if (this.mediaSession?.metadata && ['playing', 'paused'].includes(playbackState ?? '')) {
      return {
        playbackState: playbackState as 'playing' | 'paused',
        title: this.mediaSession.metadata.title,
        artist,
        album: this.mediaSession.metadata.album,
        artwork,
      }
    }

    if (!videoElement || !Number.isFinite(videoElement.duration)) {
      return { playbackState: 'none' }
    }

    const artistElements = document.querySelectorAll('.byline.ytmusic-player-bar a')
    const albumElement = artistElements.length > 1 ? artistElements[1] : null

    const complexInfo = document.querySelector('.complex-string.ytmusic-player-bar')
    const albumFromElement = albumElement?.textContent?.trim()
    const albumFromComplex = complexInfo?.querySelector('a:last-child')?.textContent?.trim()
    const album = (albumFromElement && albumFromElement.length > 0)
      ? albumFromElement
      : (albumFromComplex && albumFromComplex.length > 0)
          ? albumFromComplex
          : undefined

    return {
      playbackState: videoElement.paused ? 'paused' : 'playing',
      title: titleElement?.textContent?.trim() || undefined,
      artist,
      album,
      artwork,
      duration: videoElement?.duration,
    }
  }

  /**
   * Returns every credited artist (e.g. "Artist A, Artist B y Artist C").
   * The first segment of the player bar byline holds all of them, while a
   * plain `a` selector only matches the first linked artist.
   */
  private getArtistText(): string | undefined {
    const bylineElement = document.querySelector('ytmusic-player-bar .byline, .byline.ytmusic-player-bar, .ytmusicTrackInfoByline')
    const fromByline = bylineElement?.textContent?.replace(/\s+/g, ' ').trim().split('•')[0]?.trim()
    if (fromByline)
      return fromByline

    const fromMediaSession = this.mediaSession?.metadata?.artist?.trim()
    if (fromMediaSession)
      return fromMediaSession

    return document.querySelector('.ytmusicTrackInfoByline a, .byline.ytmusic-player-bar a')?.textContent?.trim() || undefined
  }

  /**
   * Discord only accepts public http(s) images with a short URL, so
   * placeholders (data:/blob:) and very long URLs are discarded.
   */
  private cleanArtwork(url: string | undefined): string | undefined {
    if (!url || !/^https?:\/\//.test(url))
      return undefined

    let cleaned = url
    if (/^https?:\/\/[^/]*ytimg\.com\//.test(cleaned))
      cleaned = cleaned.split('?')[0] ?? cleaned
    else if (/googleusercontent\.com|ggpht\.com/.test(cleaned))
      cleaned = cleaned.replace(/=w\d+-h\d+[^/?]*$/, '=w544-h544-l90-rj')

    return cleaned.length > 250 ? undefined : cleaned
  }

  private getArtwork(): string | undefined {
    const candidates: (string | undefined)[] = []

    const mediaSessionArtwork = this.mediaSession?.metadata?.artwork
    if (mediaSessionArtwork?.length)
      candidates.push(...[...mediaSessionArtwork].reverse().map(image => image.src))

    for (const selector of ['.ytmusicTrackInfoThumbnail', 'ytmusic-player-bar img#img', '#song-image img']) {
      for (const image of document.querySelectorAll<HTMLImageElement>(selector))
        candidates.push(image.currentSrc || image.src)
    }

    for (const candidate of candidates) {
      const cleaned = this.cleanArtwork(candidate)
      if (cleaned)
        return cleaned
    }

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
    return document.querySelector<HTMLMediaElement>('.video-stream')
  }

  getAlbumArtistLink(): string | undefined {
    const mediaData = this.getMediaData()
    const links = [...document.querySelectorAll<HTMLAnchorElement>('.ytmusicTrackInfoByline a[href], .byline a[href]')]

    if (mediaData.album && links.length > 0) {
      return links.at(-1)?.href
    }

    return links[0]?.href
  }

  getArtistLink(): string | undefined {
    return document.querySelector<HTMLAnchorElement>('.ytmusicTrackInfoByline a[href], .byline a[href]')?.href
  }

  getCurrentAndTotalTime(): [string, string] | null {
    const timeText = document
      .querySelector<HTMLSpanElement>('#left-controls > span')
      ?.textContent
      ?.trim()

    if (!timeText)
      return this.getMiniPlayerTime()

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

  private getMiniPlayerTime(): [string, string] | null {
    const times = document.querySelector('.ytMusicMiniPlayerTimeInfo')?.textContent?.trim().split(' / ')
    return times?.length === 2 && times[0] && times[1] ? [times[0], times[1]] : null
  }

  hasValidPlaybackState(): boolean {
    if (this.mediaSession) {
      return ['playing', 'paused'].includes(this.mediaSession.playbackState)
    }

    const videoElement = this.getVideoElement()
    return videoElement !== null && !Number.isNaN(videoElement.duration)
  }

  isPlaying(): boolean {
    if (this.mediaSession) {
      return this.mediaSession.playbackState === 'playing'
    }

    const videoElement = this.getVideoElement()
    return videoElement !== null && !videoElement.paused && videoElement.currentTime > 0
  }
}
