export type VariantText = string | readonly string[]
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

