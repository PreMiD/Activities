import { Assets } from 'premid'

const presence = new Presence({
  clientId: '618569989842010122',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

let item, typing: HTMLElement

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/A/AliExpress/assets/logo.png',
  }

  presenceData.startTimestamp = browsingTimestamp

  switch (document.location.hostname) {
    case 'ru.aliexpress.com':
    case 'pt.aliexpress.com':
    case 'es.aliexpress.com':
    case 'fr.aliexpress.com':
    case 'de.aliexpress.com':
    case 'it.aliexpress.com':
    case 'nl.aliexpress.com':
    case 'tr.aliexpress.com':
    case 'ja.aliexpress.com':
    case 'ko.aliexpress.com':
    case 'th.aliexpress.com':
    case 'vi.aliexpress.com':
    case 'ar.aliexpress.com':
    case 'he.aliexpress.com':
    case 'pl.aliexpress.com':
    case 'www.aliexpress.com': {
      if (document.location.pathname.includes('/item/')) {
        item = document.querySelector<HTMLElement>(
          '#root > div > div.product-main > div > div.product-info > div.product-title',
        )

        presenceData.details = 'Viewing product:'
        if (item?.textContent && item.textContent.length > 128)
          presenceData.state = `${item.textContent.substring(0, 125)}...`
        else presenceData.state = item?.textContent

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/store/')) {
        item = document.querySelector(
          '#hd > div > div > div:nth-child(1) > div:nth-child(2) > div:nth-child(2) > div > div > div:nth-child(1) > span',
        ) as HTMLElement
        presenceData.details = 'Viewing store:'
        presenceData.state = item.textContent

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/category/')) {
        item = document.querySelector(
          '#root > div > div > div.main-content > div.right-menu > div > div.top-container > div.nav-breadcrumb > div > div > span > span > span',
        ) as HTMLElement

        presenceData.details = 'Viewing category:'
        presenceData.state = item.textContent

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (
        document.location.pathname.includes('/wholesale')
        && document.location.search.includes('SearchText')
      ) {
        item = document.querySelector('#search-key') as HTMLInputElement

        presenceData.details = 'Searching for:'
        presenceData.state = item.value

        presenceData.smallImageKey = Assets.Search

        presence.setActivity(presenceData)
      }
      else {
        presence.setActivity()
      }

      break
    }
    case 'message.aliexpress.com':
    case 'msg.aliexpress.com': {
      if (
        document.querySelector(
          '#root > div > div > div > span > div.message-view > div.message-view-title > div.message-view-title__content',
        )
      ) {
        item = document.querySelector(
          '#root > div > div > div > span > div.message-view > div.message-view-title > div.message-view-title__content',
        ) as HTMLElement
        typing = document.querySelector(
          '#buyer_msg_send_btn',
        ) as HTMLButtonElement
        if (typing) {
          if (typing.className.includes('icon-plane disable')) {
            presenceData.details = 'Reading dms with:'
            presenceData.state = item.textContent
          }
          else {
            presenceData.details = 'Typing in dms to:'
            presenceData.state = item.textContent
          }
        }
        else {
          presenceData.details = 'Message Center'
          delete presenceData.state
        }

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else {
        presenceData.details = 'Message Center'
        delete presenceData.state

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }

      break
    }
    case 'sale.aliexpress.com': {
      presenceData.details = 'Browsing through the sale'
      delete presenceData.state

      delete presenceData.smallImageKey

      presence.setActivity(presenceData)

      break
    }
    case 'shoppingcart.aliexpress.com': {
      presenceData.details = 'Viewing their shoppingcart'
      delete presenceData.state

      delete presenceData.smallImageKey

      presence.setActivity(presenceData)

      break
    }
    case 'my.aliexpress.com': {
      if (document.location.pathname.includes('/wishlist')) {
        presenceData.details = 'Viewing their wishlist'
        delete presenceData.state

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/mytrace')) {
        presenceData.details = 'Viewing their recently'
        presenceData.state = 'viewed products'

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else {
        presence.setActivity()
      }

      break
    }
    case 'home.aliexpress.com':
    case 'star.aliexpress.com': {
      presenceData.details = 'Viewing their AliExpress'
      presenceData.state = 'page / account /profile'

      delete presenceData.smallImageKey

      presence.setActivity(presenceData)

      break
    }
    case 'feedback.aliexpress.com': {
      presenceData.details = 'AliExpress Feedback'
      delete presenceData.state

      delete presenceData.smallImageKey

      presence.setActivity(presenceData)

      break
    }
    case 'trade.aliexpress.com': {
      if (
        document.location.pathname.includes('order_list.htm')
        || document.location.pathname.includes('orderList.htm')
      ) {
        presenceData.details = 'Viewing their orders'
        delete presenceData.state

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/issue/')) {
        presenceData.details = 'Viewing their'
        presenceData.state = 'Refunds & Disputes'

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/ordertrash/')) {
        presenceData.details = 'Viewing their'
        presenceData.state = 'deleted orders'

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else {
        presenceData.details = 'AliExpress Trade Center'
        delete presenceData.state

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }

      break
    }
    case 'coupon.aliexpress.com': {
      presenceData.details = 'Viewing their coupons'
      delete presenceData.state

      delete presenceData.smallImageKey

      presence.setActivity(presenceData)

      break
    }
    case 'ilogisticsaddress.aliexpress.com': {
      presenceData.details = 'Viewing their adress'
      delete presenceData.state

      delete presenceData.smallImageKey

      presence.setActivity(presenceData)

      break
    }
    case 'helppage.aliexpress.com': {
      presenceData.details = 'AliExpress Help Center'
      delete presenceData.state

      delete presenceData.smallImageKey

      presence.setActivity(presenceData)

      break
    }
    case 'sell.aliexpress.com':
    case 'seller.aliexpress.com': {
      presenceData.details = 'AliExpress Sell Center'
      delete presenceData.state

      delete presenceData.smallImageKey

      presence.setActivity(presenceData)

      break
    }
    default:
      presence.setActivity()
  }
})
