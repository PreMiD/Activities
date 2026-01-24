import type { ButtonArray, DealabsSettings, Resolver, Translation } from '../util/interfaces.js'
import { getMainContent } from '../util/index.js'

const dealResolver: Resolver = {
  isActive: (pathname: string) => pathname.includes('/bons-plans/'),

  getState: (t: Translation, settings: DealabsSettings) => {
    if (settings.hideDealTitles)
      return t.hiddenDeal

    let title = document.querySelector('h1')?.textContent?.trim()
    if (!title) {
      const metaTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content')
      title = metaTitle ? ((metaTitle.split(' - Dealabs')[0] ?? metaTitle).trim()) : t.detail
    }
    return title
  },

  getDetails: (t: Translation, settings: DealabsSettings) => {
    const mainContent = getMainContent()

    let price: string | undefined
    if (!settings.hidePrices) {
      const priceEl = mainContent.querySelector('.thread-price')
      if (priceEl && priceEl.textContent) {
        price = priceEl.textContent.trim()
      }
      else {
        const freeLabel = mainContent.querySelector('.text--color-free')
        if (freeLabel || (mainContent.textContent && mainContent.textContent.includes(t.free) && !mainContent.textContent.includes('€'))) {
          price = t.free
        }
      }
    }

    let temp: string | undefined
    const tempEl = mainContent.querySelector('.vote-temp')
    if (tempEl && tempEl.textContent) {
      temp = tempEl.textContent.trim()
    }

    const parts: string[] = []
    if (temp) {
      let emoji = '❄️'
      const val = Number.parseInt(temp)
      if (!Number.isNaN(val)) {
        if (val > 100)
          emoji = '🔥'
        else if (val > 0)
          emoji = '🌡️'
      }
      parts.push(`${temp} ${emoji}`)
    }
    if (price)
      parts.push(price)

    return parts.length > 0 ? parts.join(' • ') : t.viewDeal
  },

  getLargeImage: () => {
    const image = document.querySelector('meta[property="og:image"]')?.getAttribute('content')
    if (image && (image.includes('logo-dark') || image.includes('logo-white') || image.includes('assets/img'))) {
      return undefined
    }
    return image || undefined
  },

  getButtons: (t: Translation) => [{ label: t.viewPage, url: document.location.href }] as ButtonArray,
}

export default dealResolver
