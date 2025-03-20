const presence = new Presence({
  clientId: '971483473024004157',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/Z/ZenMarket/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    details: 'Browsing ZenMarket',
  }
  const { pathname, search, href } = document.location
  const path = pathname.replace(
    `/${document.querySelector('html')?.getAttribute('lang')}`,
    '',
  )
  const item = {
    title: document.querySelector('#itemTitle')?.textContent ?? '',
    seller: document.querySelector('#seller')?.textContent
      ?? document.querySelector('#aSeller')?.textContent
      ?? '',
    productPage: document.querySelector<HTMLAnchorElement>('#productPage')?.href ?? '',
    url: document.querySelector<HTMLAnchorElement>('#itemUrl')?.href ?? '',
    price: document.querySelector('#lblPrice')?.textContent
      ?? document.querySelector('#lblPriceY')?.textContent
      ?? 'unknown price',
    condition: document.querySelector('#lblConditionName')?.textContent
      ?? document.querySelector('#lblItemCondition')?.textContent
      ?? document.querySelector('#lblItemStatus')?.textContent
      ?? '',
  }

  // Profile

  switch (path) {
    case '/profile/':
    case '/profile/default.aspx': {
      const warehouseTable = document.querySelector<HTMLTableElement>(
        '#productsBought > div:nth-child(1) > table',
      )
      const cartTable = document.querySelector<HTMLTableElement>('.shop-stripped')
      const warehouseItems = warehouseTable ? warehouseTable.rows.length : 0
      const cartItems = cartTable ? cartTable.rows.length - 1 : 0

      presenceData.details = 'Viewing Account'
      presenceData.state = `${
        warehouseItems > 1 || warehouseItems === 0
          ? `${warehouseItems} items`
          : `${warehouseItems} item`
      } in warehouse || ${
        cartItems > 1 || cartItems === 0
          ? `${cartItems} items`
          : `${cartItems} item`
      } in cart`
      break
    }
    case '/profile/messages.aspx':
    case '/profile/support.aspx': {
      presenceData.details = 'Viewing Messages'
      break
    }
    case '/profile/actions.aspx': {
      presenceData.details = 'Looking at Events'
      break
    }
    case '/profile/watchlist.aspx': {
      switch (true) {
        case search.includes('tab=auctions') && !search.includes('history'):
        case !search: {
          const products = document.querySelector(
            '#auctions > div:nth-child(2) > .col-md-12',
          )
          const watchCount = products ? products.children.length - 1 : 0

          presenceData.details = 'Looking at watched auction items'
          presenceData.state = `${
            watchCount > 1 || watchCount === 0
              ? `${watchCount} items`
              : `${watchCount} item`
          } on the watchlist`
          break
        }
        case search.includes('tab=auctions') && search.includes('history'): {
          presenceData.details = 'Viewing history of watched auction items'
          break
        }
        case search.includes('tab=products'): {
          const products = document.querySelector(
            '#products > div:nth-child(2) > .col-md-12',
          )
          const watchCount = products ? products.children.length : 0

          presenceData.details = 'Looking at watched items'
          presenceData.state = `${
            watchCount > 1 || watchCount === 0
              ? `${watchCount} items`
              : `${watchCount} item`
          } on the watchlist`
          break
        }
        case search.includes('tab=sellers'): {
          presenceData.details = 'Viewing watched sellers'
          break
        }
        case search.includes('tab=recent'): {
          presenceData.details = 'Looking at recently viewed items'
          break
        }
      }
      break
    }
    case '/profile/parcel.aspx': {
      presenceData.details = 'Viewing parcels'
      break
    }
    case '/profile/payments.aspx': {
      presenceData.details = 'Viewing transactions'
      break
    }
    case '/profile/levels.aspx': {
      presenceData.details = 'Checking current level'
      presenceData.state = `Current Level: ${
        document.querySelector('#lblCurrentTier')?.textContent
      }`
      break
    }
    default: {
      if (item?.title) {
        presenceData.details = `Looking at ${item?.title}`
        let text = `${item?.price ? `Price: ${item?.price} ||` : ''}  ${
          item?.condition ? `Condition: ${item?.condition} ||` : ''
        } ${item?.seller ? `Seller: ${item?.seller} ||` : ''}`
        if (text.endsWith(' || '))
          text = text.slice(0, text.length - 4)

        presenceData.state = text
        if (!item?.productPage && !item?.url) {
          presenceData.buttons = [
            {
              label: 'View On ZenMarket',
              url: href,
            },
          ]
          return presence.setActivity(presenceData)
        }
        else {
          presenceData.buttons = [
            {
              label: 'View On ZenMarket',
              url: href,
            },
            {
              label: `View On ${document
                .querySelector('.active-tab')
                ?.textContent
                ?.toLowerCase()}`,
              url: item?.productPage,
            },
          ]
        }
      }
      else if (path === '/auction.aspx' && search.includes('itemCode')) {
        presenceData.details = `Looking at ${item?.title}`
        presenceData.state = `Price: ${item?.price} || Bids: ${
          document.querySelector('#bidNum')?.textContent
        } || Condition: ${item?.condition} || Seller: ${item?.seller}`

        presenceData.buttons = [
          {
            label: 'View On ZenMarket',
            url: href,
          },
          {
            label: 'View On Yahoo Auctions',
            url: item?.productPage,
          },
        ]
        if (!item?.productPage)
          delete presenceData.buttons[1]
      }
      else {
        presenceData.details = 'Browsing...'
      }

      break
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
