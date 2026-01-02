import type { ButtonArray, Resolver } from '../util/interfaces.js'
import { formatSlug } from '../util/index.js'

const merchantResolver: Resolver = {
  isActive: (pathname: string) => pathname.includes('/codes-promo/'),

  getState: () => {
    const parts = document.location.pathname.split('/codes-promo/')
    const merchantSlug = parts[1] ? parts[1].split('/')[0] : 'Inconnu'
    return formatSlug(merchantSlug)
  },

  getDetails: (t: any) => t.searchCode,

  getButtons: (t: any) => [{ label: t.viewCodes, url: document.location.href }] as ButtonArray,
}

export default merchantResolver
