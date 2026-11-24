import type { PlaybackDisplay, PlaybackMetadata } from '../config/types.js'
import { findCurrentAiring } from '../api/liveSchedule.js'

// Season + episode: displayed by Discord via `largeImageText` (SxEy), so no need to repeat them in the subtitle
function formatEpisodeLabel(
  { seasonNumber, episodeNumber, title }: { seasonNumber?: number, episodeNumber?: number, title: string },
): string {
  if (seasonNumber == null && episodeNumber != null)
    return `E${episodeNumber} - ${title}`
  return title
}

// With ActivityType.Watching, Discord converts "Season 2, Episode 5" into "S2E5"
function formatSeasonEpisodeText(seasonNumber?: number, episodeNumber?: number): string | undefined {
  if (seasonNumber == null || episodeNumber == null)
    return undefined

  return `Season ${seasonNumber}, Episode ${episodeNumber}`
}

// Title, subtitle, and artwork to display for the current playback
export function getPlaybackDisplay(metadata: PlaybackMetadata | null, viewerTime?: number): PlaybackDisplay {
  if (!metadata?.title)
    return {}

  // Live TV channel: the title comes from the current program, the channel serves as a fallback
  if (metadata.type === 'STATION') {
    const station = metadata.title
    const airing = findCurrentAiring(metadata.schedule, viewerTime)
    const stationLogo = metadata.schedule?.stationLogo

    if (!airing)
      return { title: station, station, image: stationLogo }

    const image = airing.image ?? stationLogo

    if (airing.seriesTitle) {
      return {
        title: airing.seriesTitle,
        subtitle: formatEpisodeLabel(airing),
        episodeText: formatSeasonEpisodeText(airing.seasonNumber, airing.episodeNumber),
        airing,
        station,
        image,
      }
    }

    return { title: airing.title, subtitle: station, airing, station, image }
  }

  // Live event (sports...): title = event, subtitle = stream (the remaining part of the item title)
  if (metadata.type === 'LIVE_EVENT_ITEM') {
    const { eventTitle } = metadata
    const feed = eventTitle
      ? metadata.title.replace(eventTitle, '').replace(/^[\s\-–—:]+|[\s\-–—:]+$/g, '')
      : ''

    return {
      title: eventTitle || metadata.title,
      subtitle: feed || undefined,
      liveEvent: true,
      image: metadata.image,
    }
  }

  // Series episode
  if (metadata.type === 'EPISODE' || metadata.seriesTitle) {
    return {
      title: metadata.seriesTitle || metadata.title,
      subtitle: formatEpisodeLabel({
        seasonNumber: metadata.seasonNumber,
        episodeNumber: metadata.episodeNumber,
        title: metadata.title,
      }),
      episodeText: formatSeasonEpisodeText(metadata.seasonNumber, metadata.episodeNumber),
      image: metadata.image,
    }
  }

  // Movie
  return { title: metadata.title }
}
