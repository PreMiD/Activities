export type TmdbMediaType = 'movie' | 'tv'

export interface TmdbMediaSummary {
  title: string
  image?: string
}

export interface WatchContext {
  title: string
  mediaType: string
  season: string
  episode: string
  episodeTitle: string
  sourceLabel: string
  sourceDetail: string
}

export interface PartyContext {
  title: string
  mediaType: string
  season: string
  episode: string
  poster: string
  participants: number
}

export interface LiveTvContext {
  channel: string
  poster: string
}

export interface IframePlayback {
  currentTime: number
  duration: number
  paused: boolean
}
