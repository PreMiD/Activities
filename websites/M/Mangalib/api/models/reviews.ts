import type { AgeRestriction, Author, ContentType, Cover } from './common.js'

export interface ReviewData {
  id: number
  title: string
  user: Author
  related: Relation
}

interface Relation {
  rus_name: string
  eng_name: string
  cover: Cover
  ageRestriction: AgeRestriction<ContentType>
}
