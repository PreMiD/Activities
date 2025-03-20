import { Assets } from 'premid'

const presence = new Presence({ clientId: '898448802829189172' })
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/M/Minehut/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const f = document.location.pathname.split('/')
  if (document.location.hostname === 'minehut.com') {
    presenceData.details = 'Dashboard'
    presenceData.state = 'On the dashboard'
    if (document.location.pathname.includes('/dashboard')) {
      const serverName = document.querySelector(
        '#app > div > div.dash-div.fill-height > main > div > div.dash-div.fill-height > div > section > div:nth-child(2) > div.container.container--fluid > div > div > div.row.flex-nowrap > div > div > div > div > div.sc-side.d-flex.flex-column.justify-space-between.align-center.flex-direction-center.col-sm.col-xl-3.col-12 > div > div:nth-child(1) > div',
      )
      if (serverName)
        presenceData.state = `Editing ${serverName.textContent}`
    }
    if (document.location.pathname.includes('/servers'))
      presenceData.state = 'Viewing the servers'
  }
  else if (document.location.hostname === 'shop.minehut.com') {
    const rd = document.querySelector(
      'body > div.page > div.container > div > h1',
    )
    const ok = rd?.textContent ? !rd.textContent.includes('404') : true
    presenceData.details = 'Market'
    presenceData.state = 'Viewing the Market'
    if (document.location.pathname.includes('/collections/') && ok) {
      const c = f[f.indexOf('collections') + 1]
      if (c) {
        presenceData.state = `Viewing collection ${c}`
        presenceData.buttons = [
          {
            label: `View ${c}`,
            url: location.origin + location.pathname,
          },
        ]
      }
    }
    if (document.location.pathname.includes('/products/') && ok) {
      const p = f[f.indexOf('products') + 1]
      if (p) {
        presenceData.state = `Viewing product ${p}`
        presenceData.buttons = [
          {
            label: `View ${p}`,
            url: location.origin + location.pathname,
          },
        ]
      }
    }
    if (document.location.pathname.includes('/cart')) {
      const priceA = document.querySelector(
        '#shopify-section-cart--template > section > div > form > div.cart__footer > div.cart__footer-right > p > span',
      )
      presenceData.state = `Viewing cart${
        priceA ? ` (${priceA.textContent} credits)` : ''
      }`
    }
    if (document.location.pathname.includes('/pages/wishlist'))
      presenceData.state = 'Viewing wishlist'

    if (document.location.pathname.includes('/search')) {
      const s = new URLSearchParams(document.location.search.substring(1)).get(
        'q',
      )
      if (s) {
        presenceData.state = `Searching for ${s}...`
        presenceData.smallImageKey = Assets.Search
        presenceData.smallImageText = 'Searching...'
      }
    }
  }
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
