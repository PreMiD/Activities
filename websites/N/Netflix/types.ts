export interface Root {
  version: string
  trackIds: TrackIds
  video: ShowVideo | MovieVideo
}

export interface TrackIds {
  nextEpisode: number
  episodeSelector: number
}

export interface ShowVideo {
  title: string
  synopsis: string
  rating: string
  artwork: Artwork[]
  boxart: Boxart[]
  storyart: Storyart[]
  type: 'show'
  unifiedEntityId: string
  id: number
  userRating: UserRating
  skipMarkers: SkipMarkers
  currentEpisode: number
  hiddenEpisodeNumbers: boolean
  requiresAdultVerification: boolean
  requiresPin: boolean
  requiresPreReleasePin: boolean
  seasons: Season[]
  merchedVideoId: unknown
  cinematch: Cinematch
}

export interface MovieVideo {
  title: string
  synopsis: string
  rating: string
  artwork: Artwork[]
  boxart: Boxart[]
  storyart: Storyart[]
  type: 'movie'
  unifiedEntityId: string
  id: number
  userRating: UserRating
  skipMarkers: SkipMarkers
  start: number
  end: number
  year: number
  requiresAdultVerification: boolean
  requiresPin: boolean
  requiresPreReleasePin: boolean
  creditsOffset: number
  runtime: number
  displayRuntime: number
  autoplayable: boolean
  liveEvent: LiveEvent
  taglineMessages: TaglineMessages
  bookmark: Bookmark
  hd: boolean
  stills: Still[]
  hiddenEpisodeNumbers: boolean
  merchedVideoId: unknown
  cinematch: Cinematch
}

export interface Artwork {
  w: number
  h: number
  url: string
}

export interface Boxart {
  w: number
  h: number
  url: string
}

export interface Storyart {
  w: number
  h: number
  url: string
}

export interface UserRating {
  matchScore: number
  tooNewForMatchScore: boolean
  type: string
  userRating: number
}

export interface SkipMarkers {
  credit: Credit
  recap: Recap
  content: unknown[]
}

export interface Credit {
  start: unknown
  end: unknown
}

export interface Recap {
  start: unknown
  end: unknown
}

export interface Season {
  year: number
  shortName: string
  longName: string
  hiddenEpisodeNumbers: boolean
  title: string
  id: number
  seq: number
  episodes: Episode[]
}

export interface Episode {
  start: number
  end: number
  synopsis: string
  episodeId: number
  liveEvent: LiveEvent
  taglineMessages: TaglineMessages
  requiresAdultVerification: boolean
  requiresPin: boolean
  requiresPreReleasePin: boolean
  creditsOffset: number
  runtime: number
  displayRuntime: number
  watchedToEndOffset: number
  autoplayable: boolean
  title: string
  id: number
  bookmark: Bookmark
  skipMarkers: SkipMarkers2
  hd: boolean
  thumbs: Thumb[]
  stills: Still[]
  seq: number
  hiddenEpisodeNumbers: boolean
}

export interface LiveEvent {
  hasLiveEvent: boolean
}

export interface TaglineMessages {
  tagline: string
  classification: string
}

export interface Bookmark {
  watchedDate: number
  offset: number
}

export interface SkipMarkers2 {
  credit: Credit2
  recap: Recap2
  content: unknown[]
}

export interface Credit2 {
  start: number
  end: number
}

export interface Recap2 {
  start: number
  end: number
}

export interface Thumb {
  w: number
  h: number
  url: string
}

export interface Still {
  w: number
  h: number
  url: string
}

export interface Cinematch {
  type: string
  value: string
}
