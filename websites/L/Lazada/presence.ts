import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1201520071055515698',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/L/Lazada/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const { pathname } = document.location

  if (document.querySelector('.pdp-mod-product-badge-title')) {
    presenceData.details = 'Viewing Product:'
    presenceData.smallImageKey = Assets.Viewing
    presenceData.state = document.querySelector(
      '.pdp-mod-product-badge-title',
    )?.textContent
    presenceData.largeImageKey = document.querySelector('meta[name="og:image"]')?.getAttribute('content')
      || ''
  }
  else if (pathname.includes('/tag')) {
    presenceData.details = 'Viewing Tags:'
    presenceData.smallImageKey = Assets.Search
    presenceData.state = document.querySelector('.JrAyI')?.textContent
  }
  else if (pathname.includes('/catalog')) {
    presenceData.details = 'Viewing Catalog:'
    presenceData.smallImageKey = Assets.Search
    presenceData.state = document.querySelector('.JrAyI')?.textContent
  }
  else if (pathname.includes('/customer/order')) {
    presenceData.details = 'My Orders'
  }
  else if (pathname.includes('/user/login')) {
    presenceData.details = 'User:'
    presenceData.state = 'Login'
  }
  else if (pathname.includes('/user/profile')) {
    presenceData.details = 'My Profile:'
    presenceData.state = document.querySelector(
      '.my-profile-item-info',
    )?.textContent
  }
  else if (pathname.includes('/address')) {
    presenceData.details = 'Address Book'
  }
  else if (pathname.includes('/cart')) {
    presenceData.details = 'Cart:'
    presenceData.state = document.querySelector(
      '.checkout-summary-label',
    )?.textContent
  }
  else if (pathname.includes('/customer/cancellations/index')) {
    presenceData.details = 'My Cancellations'
  }
  else if (pathname.includes('customer/cancellations/view')) {
    presenceData.details = 'Cancellation Details:'
    presenceData.state = document.querySelector('.info-unit')?.textContent
  }
  else if (pathname.includes('/wallet')) {
    presenceData.details = 'Lazada Wallet'
  }
  else if (pathname.includes('/customer/myReview')) {
    presenceData.details = 'My Reviews'
  }
  else if (pathname.includes('/wishlist')) {
    presenceData.details = document.querySelector('.first ')?.textContent
  }
  else if (pathname.includes('/customer/returns')) {
    presenceData.details = 'My Returns'
  }
  else {
    presenceData.details = 'Home'
  }

  if (await presence.getSetting<boolean>('incognito')) {
    presenceData.details = 'Incognito'
    presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/L/Lazada/assets/logo.png'
    presenceData.smallImageKey = Assets.Question
    delete presenceData.state
    delete presenceData.startTimestamp
  }
  if (!presenceData.details)
    presence.setActivity()
  else presence.setActivity(presenceData)
})
