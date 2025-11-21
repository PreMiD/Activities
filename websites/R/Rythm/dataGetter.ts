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
  getAudioElement: () => HTMLMediaElement | null
  isPlaying: () => boolean
  getCurrentAndTotalTime: () => [string, string] | null
}

export class RythmDataGetter implements MediaDataGetter {
  private mediaSession: MediaSession | undefined

  constructor() {
    this.mediaSession = (navigator as any).mediaSession
  }

  private getPlaybackStateFromUI(): 'playing' | 'paused' | 'none' {
    const button = document.querySelector<HTMLButtonElement>(
      'button._controlBtn_1to64_65._playPauseBtn_1to64_136',
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
    const progressBox = document.querySelector<HTMLDivElement>('div._ProgressBarBox_1oh0s_42')

    if (!progressBox)
      return null

    const timeElements = progressBox.querySelectorAll<HTMLParagraphElement>('p')

    if (timeElements.length < 2)
      return null

    const currentTime = timeElements[0]?.textContent?.trim()
    const totalTime = timeElements[1]?.textContent?.trim()

    if (!currentTime || !totalTime)
      return null

    return [currentTime, totalTime]
  }

  getMediaData(): MediaData {
    const playbackState = this.getPlaybackStateFromUI()

    if (playbackState === 'none') {
      return { playbackState: 'none' }
    }

    const titleElement = document.querySelector<HTMLElement>('h4._trackTitle_147lj_52')
    const artistElement = document.querySelector<HTMLElement>('p._artistName_147lj_75')
    const thumbnailElement = document.querySelector<HTMLImageElement>('img._trackThumbnail_147lj_1')

    return {
      playbackState,
      title: titleElement?.textContent?.trim() || undefined,
      artist: artistElement?.textContent?.trim() || undefined,
      artwork: thumbnailElement?.src || undefined,
    }
  }

  getAudioElement(): HTMLMediaElement | null {
    return document.querySelector<HTMLMediaElement>('audio')
  }

  isPlaying(): boolean {
    return this.getPlaybackStateFromUI() === 'playing'
  }
}
