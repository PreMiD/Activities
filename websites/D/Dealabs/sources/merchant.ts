import type { ButtonArray, Resolver, Translation } from '../util/interfaces.js'
import { formatSlug } from '../util/index.js'

const merchantResolver: Resolver = {
  isActive: (pathname: string) => pathname.includes('/codes-promo/'),

  getState: (t: Translation) => {
    const parts = document.location.pathname.split('/codes-promo/')
    const merchantSlug = parts[1] ? parts[1].split('/')[0] : t.unknown
    return formatSlug(merchantSlug)
  },

  getDetails: (t: Translation) => t.searchCode,

  getButtons: (t: Translation) => [{ label: t.viewCodes, url: document.location.href }] as ButtonArray,
}

export default merchantResolver
