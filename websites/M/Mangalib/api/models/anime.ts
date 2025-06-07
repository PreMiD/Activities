import type { AgeRestriction, CommonData, Cover, Status } from './common.js'

export interface AnimeData extends Omit<CommonData, 'stats'> {
  ageRestriction: AgeRestriction
  cover: Cover
  /**
   * Example: 18 января 1991 г.
   */
  releaseDateString: string
  shiki_rate: number
  shikimori_href: string
  status: Status
  type: Type
  toast?: {
    message: string
    type: string
  }
}

type Type =
  | { id: 16, label: 'TV Сериал' }
  | { id: 17, label: 'Фильм' }
  | { id: 18, label: 'Короткометражка' }
  | { id: 19, label: 'Спешл' }
  | { id: 20, label: 'OVA' }
  | { id: 21, label: 'ONA' }
  | { id: 22, label: 'Клип' }
