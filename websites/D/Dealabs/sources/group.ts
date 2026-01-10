import type { Resolver, Translation } from '../util/interfaces.js'
import { formatSlug } from '../util/index.js'

const groupResolver: Resolver = {
  isActive: (pathname: string) => pathname.includes('/groupe'),

  getState: (t: Translation) => {
    const docTitle = document.title
    const titleMatch = docTitle.match(/Bon plan (.+?) [⇒|:\-]/)
    if (titleMatch && titleMatch[1])
      return titleMatch[1].trim()

    const h1 = document.querySelector('h1')?.textContent?.trim()
    if (h1)
      return h1

    const parts = document.location.pathname.split('/groupe/')
    const slug = (parts[1] ?? '').split('/')[0] || t.unknownCategory
    return formatSlug(slug)
  },

  getDetails: (t: Translation) => t.exploreCat,
}

export default groupResolver
