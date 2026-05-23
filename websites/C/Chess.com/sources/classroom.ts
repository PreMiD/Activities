import type { Resolver } from '../util/interfaces.js'
import { ActivityAssets } from '../util/index.js'

const classroomResolver: Resolver = {
  isActive: pathname => pathname.includes('/classroom'),
  getDetails: t => t.classroom_title,
  getState: t => t.classroom_session,
  getLargeImageKey: () => ActivityAssets.Logo,
  getSmallImageKey: () => ActivityAssets.Lessons,
  getSmallImageText: t => t.classroom_title,
}

export default classroomResolver
