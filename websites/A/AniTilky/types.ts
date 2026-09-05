export interface AnimeTitle {
  english?: string
  native?: string
  romaji?: string
}

export interface AnimeEpisode {
  episodeNumber: number
  title?: string
}

export interface AnimeSeason {
  seasonNumber: number
  title?: string
  episodes?: AnimeEpisode[]
}

export interface Anime {
  _id: string
  id?: string
  slug?: string
  bannerImage?: string
  coverImage?: string
  description?: string
  genres?: string[]
  rating?: number
  status?: string
  type?: string
  title?: AnimeTitle
  seasons?: AnimeSeason[]
}

export interface UserProfile {
  _id?: string
  username?: string
  profileImage?: string
  bio?: string
}

export interface PluginSettings {
  lang: string
  privacy: boolean
  showCover: boolean
  showTimestamp: boolean
  showBrowsingStatus: boolean
  showButtons: boolean
  showProfiles: boolean
  showSmallImages: boolean
}
