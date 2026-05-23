import { ActivityType } from 'premid'

const presence = new Presence({
  clientId: '1395995754849370132',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/T/Taobao/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    details: 'Browsing other pages...',
    type: ActivityType.Watching,
  }
  switch (document.location.hostname) {
    case 'www.taobao.com': {
      presenceData.details = 'Taobao'
      presenceData.state = 'Watching home page'
      presenceData.startTimestamp = browsingTimestamp
      break
    }
    case 's.taobao.com': {
      const searchParams = new URLSearchParams(document.location.search)
      const rawQuery = searchParams.get('q') ?? ''
      const decodedQuery = decodeURIComponent(rawQuery)

      presenceData.details = decodedQuery
        ? `Searching for "${decodedQuery}"`
        : 'Searching on Taobao'

      presenceData.startTimestamp = browsingTimestamp
      break
    }
    case 'item.taobao.com':
    case 'detail.tmall.com': {
      const productTitle
        = document.querySelector('#J_Title > h3')?.textContent?.trim()
          || document.querySelector('.tb-main-title')?.textContent?.trim()
          || document.title.replace(/[\n\r]+/g, '').trim()

      const shopName
        = document.querySelector('.tb-shop-name > dl > dd > strong')?.textContent?.trim()
          || document.querySelector('.tb-shop-name > dl > dd')?.textContent?.trim()
          || document.querySelector('span[class*="--shopName--"]')?.textContent?.trim()
          || document.querySelector('span[title][class*="--shopName--"]')?.getAttribute('title')?.trim()

      presenceData.details = productTitle
        ? `Viewing product: “${productTitle}”`
        : 'Viewing a product'

      presenceData.state = shopName
        ? `From shop: "${shopName}"`
        : undefined

      const originalURL = new URL(document.location.href)
      const id = originalURL.searchParams.get('id')
      const platform = originalURL.hostname

      presenceData.buttons = [
        {
          label: 'View Product',
          url: `https://${platform}/item.htm?id=${id}`,
        },
      ]
      presenceData.startTimestamp = browsingTimestamp
      break
    }
  }
  presence.setActivity(presenceData)
})
