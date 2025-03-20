import { Assets } from 'premid'

const presence = new Presence({
  clientId: '618138980273094695',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/A/Amazon/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  const search = document.querySelector(
    '#search > span > h1 > div > div.sg-col-14-of-20.sg-col-26-of-32.sg-col-18-of-24.sg-col.sg-col-22-of-28.s-breadcrumb.sg-col-10-of-16.sg-col-30-of-36.sg-col-6-of-12 > div > div > span.a-color-state.a-text-bold',
  )

  if (document.querySelector('#productTitle')) {
    const item = document.querySelector('#productTitle')

    presenceData.details = 'Viewing product:' // general.viewProduct
    if (item?.textContent && item.textContent.length > 128)
      presenceData.state = `${item.textContent.substring(0, 125)}...`
    else presenceData.state = item?.textContent
  }
  else if (document.location.pathname.includes('/s') && search) {
    presenceData.details = 'Searching for:' // general.searchFor
    presenceData.state = search.textContent

    presenceData.smallImageKey = Assets.Search
  }
  else if (document.querySelector('#gc-asin-title')) {
    const item = document.querySelector('#gc-asin-title')

    presenceData.details = 'Viewing product:' // general.viewProduct
    if (item?.textContent && item.textContent.length > 128)
      presenceData.state = `${item.textContent.substring(0, 125)}...`
    else presenceData.state = item?.textContent
  }
  else if (document.location.pathname.includes('/profile')) {
    const item = document.querySelector(
      '#customer-profile-name-header > div.a-row.a-spacing-none.name-container > span',
    )
    presenceData.details = 'Viewing profile:' // general.viewProfile
    presenceData.state = item?.textContent
  }
  else if (document.location.pathname.includes('/store')) {
    presenceData.details = 'Viewing store:'; // amazon.store
    [, presenceData.state] = document.title.split(':')
  }
  else if (document.location.pathname.includes('/history')) {
    presenceData.details = 'Viewing their history'
  }
  // amazon.history
  else if (document.location.pathname.includes('/gift-cards')) {
    presenceData.details = 'Viewing Giftcards'
  }
  // amazon.viewTheir
  // amazon.giftcards
  else if (document.location.pathname.includes('/yourstore')) {
    presenceData.details = 'Viewing recommended'
  }
  // amazon.recommended
  else if (document.location.pathname.includes('/wishlist')) {
    presenceData.details = 'Viewing their wishlist'
  }
  // amazon.viewTheir
  // amazon.wishlist
  else if (document.location.pathname.includes('/cart')) {
    presenceData.details = 'Viewing their cart'
  }
  // amazon.viewTheir
  // amazon.cart
  else if (document.location.pathname.includes('/order-history')) {
    presenceData.details = 'Viewing their' // amazon.viewTheir
    presenceData.state = 'order history' // amazon.orderHistory
  }
  else if (document.location.pathname.includes('/order-details')) {
    presenceData.details = 'Viewing their' // amazon.viewTheir
    presenceData.state = 'order details' // amazon.orderDetails
  }
  else if (document.location.pathname.includes('/amazonprime')) {
    presenceData.details = 'Viewing Amazon Prime'
  }
  // amazon.prime
  else if (document.location.pathname.includes('/site-directory')) {
    presenceData.details = 'Viewing all categories'
  }
  // amazon.catergoriesAll
  else if (document.location.pathname.includes('/yourpets')) {
    presenceData.details = 'Viewing pets'
  }
  // amazon.pets
  else if (document.location.pathname.includes('/addresses')) {
    presenceData.details = 'Viewing addresses'
  }
  // amazon.address
  else if (document.location.pathname.includes('/managepaymentmethods')) {
    presenceData.details = 'Viewing payment methods'
  }
  // amazon.payment
  else if (document.location.pathname.includes('/balance')) {
    presenceData.details = 'Viewing their balance'
  }
  // amazon.balance
  else if (document.location.pathname.includes('/adprefs')) {
    presenceData.details = 'Viewing their adprefs'
  }
  // amazon.adprefs
  else if (
    document.location.pathname.includes('/yourmembershipsandsubscriptions')
  ) {
    presenceData.details = 'Viewing subscriptions'
  }
  // amazon.subscriptions
  else if (
    document.location.search.includes('nav_youraccount_ya')
    || document.location.pathname.includes('/your-account')
  ) {
    presenceData.details = 'Viewing their account'
  }
  // general.viewAccount
  else if (document.location.pathname.includes('/help/')) {
    presenceData.details = 'Viewing Help Center'
  }
  // general.viewing + Help Center
  else if (document.querySelector('#searchDropdownBox')) {
    const dropdown = document
      .querySelector('#searchDropdownBox')!.getAttribute('data-nav-selected')!
    const dropdownplus1 = +dropdown + 1
    const dropdownfinal = `#searchDropdownBox > option:nth-child(${dropdownplus1})`
    const dropdowninnertext = document.querySelector<HTMLElement>(dropdownfinal)?.textContent
    const split = document.location.pathname.split('/', 3)
    if (dropdown !== '0' || split[1] !== '') {
      presenceData.details = 'Browsing category:' // general.viewCategory
      presenceData.state = dropdowninnertext
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
