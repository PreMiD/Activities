import type { AgeRestriction, CommonData, Cover, Status } from './common.js'

export interface MangaData extends Omit<CommonData, 'stats'> {
  ageRestriction: AgeRestriction
  /**
   * Example: 18 января 1991 г.
   */
  releaseDateString: string
  status: Status
  type: Type
  toast?: {
    message: string
    type: string
  }
}

type Type =
  | { id: 1, label: 'Манга' }
  | { id: 4, label: 'OEL-манга' }
  | { id: 5, label: 'Манхва' }
  | { id: 6, label: 'Маньхуа' }
  | { id: 8, label: 'Руманга' }
  | { id: 9, label: 'Комикс' }
