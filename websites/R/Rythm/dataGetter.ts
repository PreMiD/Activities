export interface MediaData {
  playbackState: 'playing' | 'paused' | 'none'
  title?: string
  artist?: string
  artwork?: string
  trackUrl?: string
  artistUrl?: string
  trackColor?: string
  repeatMode?: 'on' | 'off' | 'none'
}

export interface MediaDataGetter {
  getMediaData: () => MediaData
  isPlaying: () => boolean
  getCurrentAndTotalTime: () => [string, string] | null
}

export class RythmDataGetter implements MediaDataGetter {
  private getPlaybackStateFromUI(): 'playing' | 'paused' | 'none' {
    const button = document.querySelector<HTMLButtonElement>(
      'button[class*="playPauseBtn"]',
    )

    if (!button)
      return 'none'

    const icon = button.querySelector<HTMLImageElement>('img')

    if (!icon)
      return 'none'

    const src = icon.src

    if (src.includes('Play.svg'))
      return 'paused'

    if (src.includes('Pause.svg'))
      return 'playing'

    return 'none'
  }

  getTrackColor(): string | null {
    const track = document.querySelector<HTMLElement>(
      'div[class*="nowPlayingControllers"] div[class*="sliderCompletedTrack"]',
    )

    if (!track)
      return null

    const styles = window.getComputedStyle(track)
    const vibrant = styles.getPropertyValue('--vibrant-album-color').trim()

    if (vibrant)
      return vibrant

    return styles.backgroundColor
  }

  getRepeatStateFromUi(): 'on' | 'off' | 'none' {
    const repeatButton = document.querySelector<HTMLButtonElement>(
      'div[class*="nowPlayingControllers"] button[class*="loopBtn"]',
    )

    if (!repeatButton) {
      return 'none'
    }

    const isActive
      = repeatButton.getAttribute('aria-pressed') === 'true'
        || repeatButton.className.includes('active')

    return isActive ? 'on' : 'off'
  }

  getCurrentAndTotalTime(): [string, string] | null {
    const progressBox = document.querySelector<HTMLDivElement>(
      'div[class*="nowPlayingControllers"] div[class*="ProgressBarBox"]',
    )

    if (!progressBox)
      return null

    const timeElements = progressBox.querySelectorAll<HTMLParagraphElement>('p')

    if (timeElements.length < 2)
      return null

    const currentTime = timeElements[0]?.textContent?.trim()
    const totalTime = timeElements[1]?.textContent?.trim()

    if (!currentTime || !totalTime) {
      return null
    }

    return [currentTime, totalTime]
  }

  getMediaData(): MediaData {
    const playbackState = this.getPlaybackStateFromUI()
    const repeatMode = this.getRepeatStateFromUi()
    const trackColor = this.getTrackColor() || undefined

    if (playbackState === 'none') {
      return { playbackState: 'none' }
    }
    const titleElement = document.querySelector<HTMLElement>(
      'div[class*="nowPlayingTrackDetails"] h4[class*="trackTitle"]',
    )

    const artistElement = document.querySelectorAll<HTMLElement>(
      'div[class*="nowPlayingTrackDetails"] p[class*="artistName"]',
    )
    const artworklElement = document.querySelector<HTMLImageElement>(
      'div[class*="nowPlayingTrackDetails"] img[class*="trackThumbnail"]',
    )
    const trackUrlElement = document.querySelector<HTMLAnchorElement>(
      'div[class*="nowPlayingTrackDetails"] div[class*="trackDetails"] > a',
    )

    const artistUrlElement = document.querySelector<HTMLAnchorElement>(
      'div[class*="nowPlayingTrackDetails"] div[class*="explicitAndArtistName"] > a',
    )

    const artistUrl = artistUrlElement?.href || undefined
    const trackUrl = trackUrlElement?.href || undefined
    const artwork = artworklElement?.src || undefined
    const title = titleElement?.textContent?.trim() || undefined

    const artist
      = artistElement.length === 0
        ? undefined
        : Array.from(artistElement)
            .map(el => el.textContent?.trim())
            .filter((name): name is string => !!name && name !== ',') // remove null/undefined and loose commas
            .map(name => name.replace(/,$/, '').trim()) // remove trailing comma like "Ravyn Lenae,"
            .join(', ')

    return {
      playbackState,
      title,
      artist,
      artwork,
      trackUrl,
      artistUrl,
      repeatMode,
      trackColor,

    }
  }

  isPlaying(): boolean {
    return this.getPlaybackStateFromUI() === 'playing'
  }
}
