import type { Author } from './common.js'

export interface CollectionData {
  id: number
  name: string
  user: Author
  type: 'titles' | 'character' | 'people'
  adult: boolean
}
