import type { CommonData } from './common.js'

export type TeamData = Omit<CommonData, 'stats' | 'rus_name'>
