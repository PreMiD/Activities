export interface MediaData {
  playbackState: 'playing' | 'paused' | 'none'
  title?: string
  artist?: string
  artwork?: string
  trackUrl?: string
  artistUrl?: string
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
    )?.href ?? null

    const artistUrlElement = document.querySelector<HTMLAnchorElement>(
      'div[class*="nowPlayingTrackDetails"] div[class*="explicitAndArtistName"] > a',
    )?.href ?? null

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
      title: titleElement?.textContent?.trim() || undefined,
      artist,
      artwork: artworklElement?.src || undefined,
      trackUrl: trackUrlElement || undefined,
      artistUrl: artistUrlElement || undefined,
    }
  }

  isPlaying(): boolean {
    return this.getPlaybackStateFromUI() === 'playing'
  }
}
