import type { Resolver } from '../util/interfaces.js'
import { ActivityAssets } from '../util/index.js'

const learnResolver: Resolver = {
  isActive: pathname => pathname.includes('/learn') || pathname.includes('/lessons') || pathname.includes('/courses'),

  getDetails: t => t.media_learning,

  getState: (t, doc) => {
    const path = doc.location.pathname

    if (path === '/learn' || path === '/lessons' || path === '/courses') {
      return t.menu
    }
    if (path.includes('/learn-the-openings'))
      return t.learn_openings
    if (path.includes('/all-lessons'))
      return t.learn_all_lessons

    const seed = doc.getElementById('lesson-data-seed')
    if (seed && seed.dataset.initialLesson) {
      try {
        const data = JSON.parse(seed.dataset.initialLesson)
        if (data.course && data.course.title) {
          return data.course.title
        }
        if (data.title)
          return data.title
      }
      catch {}
    }

    const ogTitle = doc.querySelector('meta[property="og:title"]')
    if (ogTitle) {
      const content = ogTitle.getAttribute('content')
      if (content && !content.includes('Chess.com'))
        return content
    }

    return t.browsing
  },

  getLargeImageKey: () => ActivityAssets.Logo,
  getSmallImageKey: () => ActivityAssets.Lessons,
  getSmallImageText: t => t.media_lessons,
}

export default learnResolver
