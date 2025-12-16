import type { UserAvatar } from './user.js'

export interface CommonData {
  id: number
  name: string
  rus_name: string
  eng_name: string
  alt_name: string
  slug: string
  slug_url: string
  cover: Cover
  stats: Stats[]
}

export interface Author {
  id: string
  username: string
  avatar: UserAvatar
}

export interface Cover {
  filename: string
  /**
   * Should not be used, use `adjusted` instead due to restrictions
   */
  default: string
  thumbnail: string
  /**
   * Custom property with adjusted cover
   */
  adjusted: Blob
}

export type AgeRestriction
  = | { id: 0, label: 'Нет' }
    | { id: 1, label: '6+' }
    | { id: 2, label: '12+' }
    | { id: 3, label: '16+' }
    | { id: 4, label: '18+' }
    | { id: 5, label: '18+ (RX)' }

export type Status
  = | { id: 1, label: 'Онгоинг' }
    | { id: 2, label: 'Завершён' }
    | { id: 3, label: 'Анонс' }
    | { id: 4, label: 'Приостановлен' }
    | { id: 5, label: 'Выпуск прекращён' }

interface Stats {
  value: number
  formated: string
  short: string
  tag: 'titles' | 'subscribers'
  label: string
}
