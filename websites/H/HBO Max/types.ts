export interface MaxAPIResponse {
  data: MainData
  included: IncludedItem[]
  path?: string
}

export interface MainData {
  id: string
  attributes: MainAttributes
  relationships?: ItemRelationships
}

export interface MainAttributes {
  name?: string
  videoType?: 'MOVIE' | 'EPISODE' | 'SPECIAL' | 'EXTRA'
  episodeNumber?: number
  seasonNumber?: number
  alternateId?: string
}

export interface IncludedItem {
  id: string
  type: string
  attributes: IncludedAttributes
  relationships?: ItemRelationships
}

export interface IncludedAttributes {
  alternateId?: string
  name?: string
  episodeNumber?: number
  seasonNumber?: number
  videoType?: 'MOVIE' | 'EPISODE' | 'SPECIAL' | 'EXTRA'
  src?: string
  kind?: string
}

export interface ItemRelationships {
  images?: {
    data: RelationshipRef[]
  }
  show?: {
    data: RelationshipRef
  }
  season?: {
    data: RelationshipRef
  }
  episodes?: {
    data: RelationshipRef[]
  }
}

export interface RelationshipRef {
  id: string
  type: string
}

export interface TitleInfo {
  name?: string
  details?: string
  state?: string
  largeImageKey?: string
}