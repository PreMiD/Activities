import type { AgeRestriction, CommonData, ContentType, Cover } from './common.js'

export interface CardData extends Omit<CommonData, 'rus_name' | 'eng_name' | 'alt_name'> {
  media: Media[]
  rank: Rank
}

interface Media {
  id: number
  name: string
  rus_name: string
  eng_name: string
  slug: string
  slug_url: string
  cover: Cover
  ageRestriction: AgeRestriction<ContentType>
}

type Rank
  = | { id: 'L', name: 'L' }
    | { id: 'S', name: 'S' }
    | { id: 'A', name: 'A' }
    | { id: 'B', name: 'B' }
    | { id: 'C', name: 'C' }
    | { id: 'D', name: 'D' }
    | { id: 'E', name: 'E' }
