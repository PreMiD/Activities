import { Assets } from 'premid'

const presence = new Presence({
  clientId: '631566704648126503',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const sections = [
    'u',
    'gag',
    'hot',
    'trending',
    'fresh',
    'tag',
    'search',
    'settings',
    'interest',
    'top',
  ]
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/0-9/9GAG/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  switch (document.location.hostname) {
    case '9gag.com': {
      if (document.location.pathname === '/') {
        presenceData.details = 'Viewing home page'
      }
      else if (!sections.includes(document.location.pathname.split('/')[1]!)) {
        presenceData.details = `Viewing section: ${
          document.querySelector('h2')?.textContent
        }`
      }
      else if (document.location.pathname.includes('/settings')) {
        presenceData.details = `Settings: ${
          document.querySelector('h2')?.textContent
        }`
      }
      else if (document.location.pathname.includes('/interest')) {
        presenceData.details = 'Viewing interest:'
        presenceData.state = document
          .querySelector('title')
          ?.textContent
          ?.split('9GAG ')[1]
      }
      else if (document.location.pathname.includes('/top')) {
        presenceData.details = 'Viewing top gags'
      }
      else if (document.location.pathname.includes('/u/')) {
        presenceData.details = 'Viewing Profile:'
        presenceData.state = `${
          document.querySelector('title')?.textContent?.split(' - 9GAG')[0]
        } - ${document.querySelector('a[class=\'selected\']')?.textContent}`
        presenceData.largeImageKey = document.querySelector('img')?.src
      }
      else if (
        document.querySelector(
          '#container > div.page > div.main-wrap > div.profile > section > header > h2',
        )
      ) {
        const user = document.querySelector(
          '#container > div.page > div.main-wrap > div.profile > section > header > h2',
        )

        presenceData.details = 'Viewing catagory:'
        presenceData.state = user?.textContent
      }
      else if (document.location.pathname.includes('/gag/')) {
        const title = document.querySelector(
          '#individual-post > article > header > h1',
        )

        presenceData.details = 'Viewing gag:'
        presenceData.largeImageKey = document.querySelector<HTMLLinkElement>(
          'link[rel=\'image_src\']',
        )?.href
        if ((title?.textContent?.length ?? 0) > 128)
          presenceData.state = `${title?.textContent?.substring(0, 125)}...`
        else presenceData.state = title?.textContent
      }
      else if (document.location.pathname.includes('/hot')) {
        presenceData.details = 'Viewing what\'s hot'
      }
      else if (document.location.pathname.includes('/trending')) {
        presenceData.details = 'Viewing what\'s trending'
      }
      else if (document.location.pathname.includes('/fresh')) {
        presenceData.details = 'Viewing what\'s fresh'
      }
      else if (document.location.pathname.includes('/tag')) {
        const title = document.querySelector(
          '#container > div.page > div.main-wrap > div.profile > section > header > h1',
        )

        presenceData.details = 'Viewing tag:'
        presenceData.state = title?.textContent
      }
      else if (document.location.pathname.includes('/search')) {
        const search = document.querySelector<HTMLInputElement>('#search-hero')

        presenceData.details = 'Searching for:'
        presenceData.state = search?.value
        presenceData.smallImageKey = Assets.Search
      }

      break
    }
    case 'about.9gag.com': {
      presenceData.details = 'Reading all about 9GAG'
      presenceData.smallImageKey = Assets.Reading

      break
    }
    case 'shop.9gag.com': {
      if (document.location.pathname === '/') {
        presenceData.details = 'Viewing store page'
      }
      else if (document.location.pathname.includes('/products/')) {
        const title = document.querySelector(
          '#ProductSection-product-template > div > div:nth-child(2) > div.product-single__meta > h1',
        )

        presenceData.details = 'Shop - Viewing product:'
        presenceData.state = title?.textContent
      }
      else if (document.location.pathname.includes('/collections/')) {
        const title = document.querySelector(
          '#shopify-section-collection-template > div > header > div > div > h1 > span',
        )
        const replace = document.querySelector(
          '#shopify-section-collection-template > div > header > div > div > h1 > span > span',
        )

        presenceData.details = 'Shop - Viewing collection:'
        presenceData.state = title?.textContent?.replace(replace?.textContent ?? '', '')
      }
      else if (document.location.pathname.includes('/cart')) {
        presenceData.details = 'Shop - Viewing their cart'
      }
      else if (document.location.pathname.includes('/search')) {
        const search = document.querySelector<HTMLInputElement>('#SearchInput')

        presenceData.details = 'Shop - Searching for:'
        presenceData.state = search?.value
        presenceData.smallImageKey = Assets.Search
      }

      break
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
