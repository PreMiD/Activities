import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1439860383262314516',
})

enum ActivityAssets {
  Logo = 'https://i.imgur.com/NuZ7h0n.png',
  LogoSmall = 'https://i.imgur.com/nCKBD0k.png',
}

const browsingTimestamp = Math.floor(Date.now() / 1000)

// Clean product title
function cleanProductName(name: string): string {
  return name
    .replace(/^Jual\s*/i, '')
    .replace(/^Beli\s*/i, '')
    .trim()
}

presence.on('UpdateData', async () => {
  const title = document.title
  const url = document.location.href
  const path = document.location.pathname

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  // Get og:title & og:image
  const ogTitle
    = document
      .querySelector('meta[property="og:title"]')
      ?.getAttribute('content')
      || null

  const ogImage
    = document
      .querySelector('meta[property="og:image"]')
      ?.getAttribute('content')
      || null

  // Flash Sale
  if (
    path.includes('/flash-sale')
    || url.includes('flash_sale')
    || title.toLowerCase().includes('flash sale')
  ) {
    presenceData.details = 'Viewing Flash Sale'
    presenceData.state = 'Hunting for discounts'
  }

  // Product
  else if (
    path.includes('/i.')
    || path.includes('/product/')
    || (ogImage && ogImage.includes('/file/'))
  ) {
    const rawName
      = ogTitle?.split('|')[0]?.trim()
        || title.split('|')[0]?.trim()
        || 'Product'

    const productName = cleanProductName(rawName)

    presenceData.details = 'Viewing Product'

    presenceData.state
      = productName.length > 128
        ? `${productName.substring(0, 125)}...`
        : productName

    if (ogImage)
      presenceData.largeImageKey = ogImage

    presenceData.smallImageKey = ActivityAssets.LogoSmall
    presenceData.buttons = [
      {
        label: 'View Product Page',
        url,
      },
    ]
  }

  // Brand
  else if (
    path.includes('/brand/')
    || path.includes('/brand-page/')
    || title.toLowerCase().includes('official shop')
  ) {
    const brandName
      = ogTitle?.split('|')[0]?.trim()
        || title.split('|')[0]?.trim()
        || 'Brand'

    presenceData.details = 'Viewing Brand'
    presenceData.state = brandName

    if (ogImage)
      presenceData.largeImageKey = ogImage

    presenceData.smallImageKey = ActivityAssets.LogoSmall
    presenceData.buttons = [
      {
        label: 'View Brand Page',
        url,
      },
    ]
  }

  // Search
  else if (path.includes('/search')) {
    const searchParams = new URLSearchParams(location.search)
    const searchQuery = searchParams.get('keyword')

    if (searchQuery) {
      presenceData.details = 'Searching Products'
      presenceData.state = searchQuery
      presenceData.smallImageKey = Assets.Search
    }
  }

  // Cart
  else if (path.includes('/cart')) {
    presenceData.details = 'Viewing cart'
    presenceData.state = 'Reviewing items'
  }

  // Checkout
  else if (path.includes('/checkout')) {
    presenceData.details = 'Viewing checkout'
    presenceData.state = 'Preparing to purchase'
  }

  // Daily Discover
  else if (path.startsWith('/daily_discover')) {
    presenceData.details = 'Viewing Daily Discover'
  }

  // Categories
  else if (path.startsWith('/all_categories')) {
    presenceData.details = 'Viewing Categories'
  }

  // Top Products
  else if (path.startsWith('/top_products')) {
    presenceData.details = 'Viewing Top Products'
  }

  // Profile
  else if (path.startsWith('/user/account/profile')) {
    presenceData.details = 'Viewing Profile'
  }

  // Purchase History
  else if (path.startsWith('/user/purchase')) {
    presenceData.details = 'Viewing Purchase History'
  }

  // Login
  else if (path.startsWith('/buyer/login')) {
    presenceData.details = 'Viewing Login Page'
  }

  // Homepage
  else if (path === '/' || path.length < 2) {
    presenceData.details = 'Viewing homepage'
    presenceData.state = 'Online Shopping'
  }

  // Fallback
  else {
    presenceData.details = 'Browsing...'
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else
    presence.clearActivity()
})
