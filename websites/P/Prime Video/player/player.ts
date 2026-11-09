import type { PlaybackDisplay } from '../config/types.js'
import { Assets, getTimestamps } from 'premid'
import { CropAlignment } from '../config/constants.js'
import { findOverlaySubtitle } from '../page/dom.js'
import { applyCover } from '../page/thumbnail.js'
import { getTimelineInfo } from './timeline.js'

export interface PlayerContext {
  video: HTMLVideoElement
  display: PlaybackDisplay
  contentTitle: string
  // Server-clock time (ms) of the point being watched, live only
  viewerTime?: number
  bannerImg?: string
  usePresenceName: boolean
  showCover: boolean
  imageType: number
  useMediaImage: boolean
  strings: { paused: string, playing: string }
}

// Start of the current pause or ad break. Without timestamps, Discord still shows a timer that resets
// after ~1h10: a fixed start, with no end, keeps it as an elapsed time.
let frozenSince: number | null = null

function showElapsedTime(presenceData: PresenceData): void {
  frozenSince ??= Math.floor(Date.now() / 1000)
  presenceData.startTimestamp = frozenSince
  delete presenceData.endTimestamp
}

export function resetElapsedTime(): void {
  frozenSince = null
}

function applyTimestamps(presenceData: PresenceData, { video, display, viewerTime }: PlayerContext): void {
  // VOD: `currentTime` / `duration` include the Prime Video jingle and ads
  if (Number.isFinite(video.duration)) {
    const { position, duration, inAd } = getTimelineInfo(video)

    // The content position is frozen during an ad break: no position, recalculated after the ad
    if (inAd) {
      presenceData.state = 'Ad break'
      showElapsedTime(presenceData)
      return
    }

    [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(position, duration)
  }
  // Live event: `currentTime` counts from the beginning, so it also follows a rewind
  else if (display.liveEvent) {
    presenceData.startTimestamp = Math.floor(Date.now() / 1000 - video.currentTime)
    delete presenceData.endTimestamp
  }
  // Live TV channel: program times, adjusted for the stream lag behind real time
  else if (display.airing) {
    const lag = viewerTime !== undefined ? Date.now() - viewerTime : 0
    presenceData.startTimestamp = Math.floor((display.airing.startTime + lag) / 1000)
    presenceData.endTimestamp = Math.floor((display.airing.endTime + lag) / 1000)
  }

  resetElapsedTime()
}

export function applyPlayerPresence(presenceData: PresenceData, context: PlayerContext): void {
  const { video, display, contentTitle, bannerImg, usePresenceName, showCover, imageType, useMediaImage, strings } = context

  if (usePresenceName)
    presenceData.name = contentTitle
  presenceData.details = contentTitle

  // The overlay subtitle is only a fallback without metadata: it can still show the previous media
  // (e.g. a series episode before a movie)
  const episodeLabel = display.title ? display.subtitle : findOverlaySubtitle()
  if (episodeLabel && episodeLabel.trim() !== contentTitle.trim())
    presenceData.state = episodeLabel

  // Series: SxEy; live programs without an episode number: the channel
  const largeImageText = display.episodeText ?? display.station
  if (largeImageText)
    presenceData.largeImageText = largeImageText

  // Without a banner on the page (live TV), the program or channel image is used in any case
  const [preferredImage, fallbackImage] = useMediaImage ? [display.image, bannerImg] : [bannerImg, display.image]
  const coverUrl = preferredImage ?? fallbackImage
  const alignment = coverUrl === display.image ? CropAlignment.Center : CropAlignment.Right
  applyCover(presenceData, coverUrl, { showCover, imageType, alignment })

  if (video.paused) {
    presenceData.smallImageKey = Assets.Pause
    presenceData.smallImageText = strings.paused
    showElapsedTime(presenceData)
  }
  else {
    applyTimestamps(presenceData, context)
    presenceData.smallImageKey = Assets.Play
    presenceData.smallImageText = strings.playing
  }
}
