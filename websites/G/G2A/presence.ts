import { Assets } from 'premid'

const presence = new Presence({
  clientId: '633805202868273153',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/G/G2A/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  const title = document.querySelector('head > title')
  switch (document.location.hostname) {
    case 'www.g2a.com': {
      if (document.location.pathname.includes('/wishlist')) {
        presenceData.details = 'Viewing their wishlist'
      }
      else if (document.location.pathname.includes('/cart')) {
        presenceData.details = 'Viewing their cart'
      }
      else if (document.location.pathname.includes('/search')) {
        presenceData.details = 'Searching for:'
        presenceData.state = title?.textContent?.replace('" - G2A.COM', '').replace('Search results - "', '')
        presenceData.smallImageKey = Assets.Search
      }
      else if (document.location.pathname.includes('/category')) {
        presenceData.details = 'Viewing category:'
        presenceData.state = title?.textContent?.replace(' - G2A.COM', '')
      }
      else if (
        document.querySelector(
          '#app > div > div.content > div > article > header > div > div > h1 > span',
        ) !== null
      ) {
        presenceData.details = 'Viewing item:'
        const title = document.querySelector(
          '#app > div > div.content > div > article > header > div > div > h1 > span',
        )
        presenceData.state = title?.textContent
      }
      else if (document.location.pathname.includes('/user')) {
        presenceData.details = 'Viewing user:'
        const user = document.querySelector(
          '#app > div > div.content > div > div > div > section > div.user-info > button > strong',
        )
        presenceData.state = (user as HTMLElement).textContent
      }
      else if (document.location.pathname.includes('/goldmine')) {
        presenceData.details = 'Using the goldmine'
      }
      else if (document.location.pathname.includes('/news/')) {
        const title = document.querySelector(
          'body > div.single-article.single-article--feature.default-template > div.review-top > div.review-top__wrapper > div > header > h1',
        )
        if (!title) {
          presenceData.details = 'Browsing news section'
        }
        else {
          presenceData.details = 'News - Reading:'
          presenceData.state = (title as HTMLElement).textContent
          presenceData.smallImageKey = Assets.Reading
        }
      }

      break
    }
    case 'id.g2a.com': {
      presenceData.details = 'Viewing their account details'
      break
    }
    case 'dashboard.g2a.com': {
      presenceData.details = 'Viewing their dashboard'
      break
    }
    case 'pay.g2a.com': {
      presenceData.details = 'Using G2A Pay'
      break
    }
    case 'plus.g2a.com': {
      presenceData.details = 'G2A Plus - Viewing:'
      presenceData.state = title?.textContent?.replace(' - G2A Plus', '')

      break
    }
    case 'loot.g2a.com': {
      if (document.location.pathname === '/') {
        presenceData.details = 'Browsing G2A Loot'
      }
      else {
        presenceData.details = 'G2A Loot - Viewing:'
        presenceData.state = title?.textContent?.replace(' - G2A Loot', '')
      }

      break
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
