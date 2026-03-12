import { Assets } from 'premid'

const presence = new Presence({
  clientId: '620721262112538625', // CLIENT ID FOR YOUR PRESENCE
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/E/Etsy/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  switch (document.location.hostname) {
    case 'investors.etsy.com': {
      presenceData.details = 'Viewing page:'
      presenceData.state = 'Etsy Investors'

      delete presenceData.smallImageKey

      break
    }
    case 'help.etsy.com': {
      presenceData.details = 'Viewing page:'
      presenceData.state = 'Etsy Help Center'

      delete presenceData.smallImageKey

      break
    }
    case 'www.etsy.com': {
      if (document.location.pathname.includes('/listing/')) {
        const item = document.querySelector(
          '#listing-page-cart > div > div.listing-page-title-component > h1',
        )
        presenceData.details = 'Viewing product:'
        if (item?.textContent && item.textContent.length > 128)
          presenceData.state = `${item.textContent.substring(0, 125)}...`
        else presenceData.state = item?.textContent

        delete presenceData.smallImageKey
      }
      else if (document.location.pathname.includes('/c/')) {
        const item = document.querySelector(
          '#content > div > div > div > div > div > h1',
        )
        presenceData.details = 'Viewing category:'
        presenceData.state = item?.textContent

        delete presenceData.smallImageKey
      }
      else if (document.location.pathname.includes('/shop/')) {
        const item = document.querySelector(
          '#content > div.shop-home > div:nth-child(1) > div > div > div > div > div > div > h1',
        )

        presenceData.details = 'Viewing shop:'
        presenceData.state = item?.textContent

        delete presenceData.smallImageKey
      }
      else if (document.location.pathname.includes('/people/')) {
        const item = document.querySelector(
          '#content > div > div:nth-child(1) > div > div > div > div > h1',
        )

        presenceData.details = 'Viewing profile:'
        presenceData.state = item?.textContent

        delete presenceData.smallImageKey
      }
      else if (document.location.pathname.includes('/redeem')) {
        presenceData.details = 'Viewing page:'
        presenceData.state = 'Redeem codes'

        delete presenceData.smallImageKey
      }
      else if (document.location.pathname.includes('/cart')) {
        presenceData.details = 'Viewing cart'
        delete presenceData.state

        delete presenceData.smallImageKey
      }
      else if (document.location.pathname.includes('/purchases')) {
        presenceData.details = 'Viewing purchases'
        delete presenceData.state

        delete presenceData.smallImageKey
      }
      else if (document.location.pathname.includes('/account')) {
        presenceData.details = 'Viewing their account'
        delete presenceData.state

        delete presenceData.smallImageKey
      }
      else if (document.location.pathname.includes('/about')) {
        presenceData.details = 'Viewing page:'
        presenceData.state = 'About Etsy'

        delete presenceData.smallImageKey
      }
      else if (document.location.pathname.includes('/team')) {
        presenceData.details = 'Viewing page:'
        presenceData.state = 'Etsy Team'

        delete presenceData.smallImageKey
      }
      else if (document.location.pathname.includes('/careers')) {
        presenceData.details = 'Viewing page:'
        presenceData.state = 'Etsy Careers'

        delete presenceData.smallImageKey
      }
      else if (document.location.pathname.includes('/press')) {
        presenceData.details = 'Viewing page:'
        presenceData.state = 'Etsy Press'

        delete presenceData.smallImageKey
      }
      else if (document.location.pathname.includes('/impact')) {
        presenceData.details = 'Viewing page:'
        presenceData.state = 'Etsy Impact'

        delete presenceData.smallImageKey
      }
      else if (document.location.pathname.includes('/search')) {
        const item = document.querySelector<HTMLInputElement>('#global-enhancements-search-query')

        presenceData.details = 'Searching for:'
        presenceData.state = item?.value

        presenceData.smallImageKey = Assets.Search
      }
      else if (document.location.pathname.includes('/sell')) {
        presenceData.details = 'Viewing page:'
        presenceData.state = 'Etsy Sell'

        delete presenceData.smallImageKey
      }
      else if (document.location.pathname.includes('/conversations')) {
        if (
          document.querySelector(
            '#root > div > div > div > div > div > div > div > div > h3 > span:nth-child(2)',
          ) !== null
        ) {
          const item = document.querySelector(
            '#root > div > div > div > div > div > div > div > div > div > div > div > div > a',
          )

          presenceData.details = 'Reading DMs with:'
          presenceData.state = item?.textContent

          presenceData.smallImageKey = Assets.Reading
        }
        else if (document.location.pathname.includes('/sent')) {
          presenceData.details = 'Etsy Direct Messages'
          presenceData.state = 'Viewing sent messages'

          delete presenceData.smallImageKey
        }
        else if (document.location.pathname.includes('/unread')) {
          presenceData.details = 'Etsy Direct Messages'
          presenceData.state = 'Viewing unreaded messages'

          delete presenceData.smallImageKey
        }
        else if (document.location.pathname.includes('/spam')) {
          presenceData.details = 'Etsy Direct Messages'
          presenceData.state = 'Viewing spam messages'

          delete presenceData.smallImageKey
        }
        else if (document.location.pathname.includes('/trash')) {
          presenceData.details = 'Etsy Direct Messages'
          presenceData.state = 'Viewing trash can'

          delete presenceData.smallImageKey
        }
        else if (document.location.pathname.includes('/all')) {
          presenceData.details = 'Etsy Direct Messages'
          presenceData.state = 'Viewing all messages'

          delete presenceData.smallImageKey
        }
        else {
          presenceData.details = 'Etsy Direct Messages'
          presenceData.state = 'Viewing the inbox'

          delete presenceData.smallImageKey
        }
      }

      break
    }
  }
  presence.setActivity(presenceData)
})
