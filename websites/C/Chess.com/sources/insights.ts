import type { Resolver } from '../util/interfaces.js'
import { ActivityAssets } from '../util/index.js'

const insightsResolver: Resolver = {
  isActive: pathname => pathname.includes('/insights'),

  getDetails: (t, doc) => {
    const title = doc.querySelector('.cc-page-header-title')?.textContent?.trim()
    return title || t.insights_title
  },

  getState: (t, doc) => {
    const parts = doc.location.pathname.split('/')
    const insightsIndex = parts.indexOf('insights')
    const username = (insightsIndex !== -1 && parts[insightsIndex + 1]) ? parts[insightsIndex + 1] : null

    if (username) {
      const formattedUser = username.charAt(0).toUpperCase() + username.slice(1)
      return `${t.insights_stats}: ${formattedUser}`
    }
    return t.overview
  },

  getLargeImageKey: () => ActivityAssets.Logo,
  getSmallImageKey: () => ActivityAssets.Statistics,
  getSmallImageText: t => t.insights_title,
}

export default insightsResolver
