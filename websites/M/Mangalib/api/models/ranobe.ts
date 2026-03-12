import type { AgeRestriction, CommonData, Status } from './common.js'

export interface RanobeData extends Omit<CommonData, 'stats'> {
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

type Type
  = | { id: 10, label: 'Япония' }
    | { id: 11, label: 'Корея' }
    | { id: 12, label: 'Китай' }
    | { id: 13, label: 'Английский' }
    | { id: 14, label: 'Авторский' }
    | { id: 15, label: 'Фанфик' }
