const presence = new Presence({
  clientId: '996516483150663721',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  let presenceData: PresenceData = {
    smallImageKey: 'https://cdn.rcd.gg/PreMiD/websites/C/Currys/assets/0.png',
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/C/Currys/assets/logo.png',
    startTimestamp: browsingTimestamp,
    details: 'Browsing',
    state: 'Currys Website',
  }
  const { pathname } = document.location

  switch (true) {
    case !!document.querySelector('.amp-herobanner-headline'):
      presenceData.state = document.querySelector(
        '.amp-herobanner-headline',
      )?.textContent
      break
    case !!document.querySelector('.plp-heading'):
      presenceData.state = document.querySelector('.plp-heading')?.textContent
      break
    case !!document.querySelector('#clp-row-1 > div > div > h1'):
      presenceData.state = document.querySelector(
        '#clp-row-1 > div > div > h1',
      )?.textContent
      break
    case !!document.querySelector('#clp-row-1 > div > h1'):
      presenceData.state = document.querySelector(
        '#clp-row-1 > div > h1',
      )?.textContent
      break
    case pathname.includes('/products/')
      && !!document.querySelector('.product-name'):
      presenceData.state = document.querySelector('.product-name')?.textContent
      break
    default:
      break
  }

  const pages: Record<string, PresenceData> = {
    '/account': { details: 'Viewing', state: 'My Account' },
    '/wishlist-show': { details: 'Viewing', state: 'Wishlist' },
    '/order': { details: 'Viewing', state: 'Orders' },
    '/manage-your-details': { details: 'Managing', state: 'Account Details' },
    '/cart': { details: 'Viewing', state: 'Basket' },
    '/store-finder': { details: 'Finding', state: 'Stores' },
    '/services/': { details: 'Viewing', state: 'Services' },
  }

  for (const [path, data] of Object.entries(pages)) {
    if (pathname.includes(path))
      presenceData = { ...presenceData, ...data } as PresenceData
  }

  // When searching for product
  const search = document.querySelector<HTMLInputElement>('[id="Search"]')
  if (search?.value) {
    presenceData.details = 'Searching for:'
    presenceData.state = search.value
    presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/C/Currys/assets/0.png'
    return presence.setActivity(presenceData)
  }

  if (pathname === '/search') {
    presenceData.details = 'Viewing search results for:'
    presenceData.state = document
      .querySelector('[class="breadcrumb"]')
      ?.lastElementChild
      ?.textContent
      ?.trim()
    presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/C/Currys/assets/0.png'
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
