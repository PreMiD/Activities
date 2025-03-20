import { Assets } from 'premid'

const presence = new Presence({
  clientId: '934462939417673770',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/StockX/assets/logo.png',
    details: 'Browsing...',
    startTimestamp: browsingTimestamp,
  }
  const productName = document.querySelector<HTMLHeadingElement>(
    '#main-content > div > section:nth-child(3) > div > div.css-0 > h1',
  )
  const { pathname } = document.location
  const [price, image, buttons] = await Promise.all([
    presence.getSetting<boolean>('price'),
    presence.getSetting<boolean>('image'),
    presence.getSetting<boolean>('buttons'),
  ])
  if (pathname.startsWith('/search')) {
    presenceData.details = 'Searching For:'
    presenceData.state = document.querySelector<HTMLParagraphElement>(
      '#browse-wrapper nav > ol > li:nth-child(3) > p',
    )?.textContent
    presenceData.smallImageKey = Assets.Search
  }
  else if (pathname.startsWith('/buy') || pathname.startsWith('/sell')) {
    if (pathname === '/sell') {
      presenceData.details = 'Selling an Item'
    }
    else {
      if (pathname.startsWith('/buy'))
        presenceData.details = 'Buying a Product/Placing a Bid:'
      else presenceData.details = 'Selling an Item:'
      presenceData.state = document.querySelector<HTMLHeadingElement>(
        '#main-content > div > div > div > div > div > h1',
      )?.textContent
      presenceData.largeImageKey = document.querySelector<HTMLImageElement>(
        '#main-content > div > div > div > div > div > img',
      )?.src ?? 'logo'
    }
  }
  else if (pathname.startsWith('/news/')) {
    if (pathname === '/news/') {
      presenceData.details = 'Browsing News'
    }
    else {
      presenceData.details = 'Reading an Article:'
      presenceData.state = document.title.replace('- StockX News', '').trim()
      presenceData.smallImageKey = Assets.Reading
      presenceData.buttons = [{ label: 'Read Article', url: document.URL }]
    }
  }
  else if (pathname.startsWith('/about')) {
    presenceData.details = 'Reading about StockX'
    presenceData.smallImageKey = Assets.Reading
  }
  else if (productName) {
    if (price) {
      presenceData.details = `Viewing: ${productName.textContent}`
      presenceData.state = `${
        document.querySelector<HTMLLIElement>(
          '#main-content div:nth-child(1) > div > dl > dd',
        )?.textContent
      } / ${
        document.querySelector<HTMLLIElement>(
          '#main-content div:nth-child(3) > div > dl > dd',
        )?.textContent
      }`
    }
    else {
      presenceData.details = 'Viewing Product:'
      presenceData.state = productName.textContent
    }
    presenceData.largeImageKey = document.querySelector<HTMLImageElement>('div > div > div > img')?.src
      ?? 'logo'
    presenceData.smallImageKey = Assets.Search
    presenceData.buttons = [{ label: 'View Product', url: document.URL }]
  }
  else if (
    document.querySelector<HTMLHeadingElement>('#browse-wrapper > div > h1')
  ) {
    presenceData.details = 'Viewing Category:'
    presenceData.state = document.querySelector<HTMLHeadingElement>(
      '#browse-wrapper > div > h1',
    )?.textContent
    presenceData.smallImageKey = Assets.Reading
  }
  if (!image) {
    presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/S/StockX/assets/logo.png'
  }
  if (!buttons)
    delete presenceData.buttons
  presence.setActivity(presenceData)
})
