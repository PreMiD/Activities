const presence = new Presence({
  clientId: '1465383098437992448',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.imgur.com/pyXT0kP.png',
  House = 'https://i.imgur.com/d0u9KBC.png',
  Book = 'https://i.imgur.com/S0yvaDs.png',
  Search = 'https://i.imgur.com/XBf1cGW.png',
  Eye = 'https://i.imgur.com/YgvuHjf.png',
  Arrows = 'https://i.imgur.com/JAbwLgh.png',
  Network = 'https://i.imgur.com/he4qHAL.png',
  Cloud = 'https://i.imgur.com/T99PYwE.png',
  Login = 'https://i.imgur.com/FsZPn7h.png',
  PersonCheck = 'https://i.imgur.com/Q2gWRtY.png',
  Person = 'https://i.imgur.com/ZSiPGqT.png',
  Bookmark = 'https://i.imgur.com/DzXeiWS.png',
  Crown = 'https://i.imgur.com/46F79PQ.png',
  Pencil = 'https://i.imgur.com/WCNCAfF.png',
  Settings = 'https://i.imgur.com/JKIwVXB.png',
  Group = 'https://i.imgur.com/5yGqlXI.png',
  MagicPen = 'https://i.imgur.com/u91zmaE.png',
  Sparkle = 'https://i.imgur.com/DBNSiFh.png',
  Notification = 'https://i.imgur.com/PVJdOfm.png',
  Chat = 'https://i.imgur.com/GmdAyQk.png',
  Parcel = 'https://i.imgur.com/QcQ4uDk.png',
  Cart = 'https://i.imgur.com/Pdhm2Ja.png',
}

function cleanInviteCode(url: string): string {
  try {
    const urlObj = new URL(url)
    urlObj.searchParams.delete('inviteCode')
    return urlObj.toString()
  }
  catch {
    return url.replace(/[?&]inviteCode=[^&]*/g, '').replace(/[?&]$/, '')
  }
}

function getActiveTab(): string {
  const tabEl = document.querySelector<HTMLElement>('.ivu-tabs-tab-active')
  if (!tabEl) {
    return ''
  }
  const firstChildSpan = tabEl.querySelector<HTMLElement>('span:first-child')
  if (firstChildSpan?.textContent?.trim()) {
    return firstChildSpan.textContent.trim()
  }
  const anySpan = tabEl.querySelector<HTMLElement>('span')
  if (anySpan?.textContent?.trim()) {
    return anySpan.textContent.trim()
  }
  return tabEl.textContent?.trim() ?? ''
}

function getFavoriteTab(): string {
  return (
    document.querySelector<HTMLElement>('.channel-tabs .active .text')?.textContent?.trim() ?? ''
  )
}

function getCouponTab(): string {
  const el = document.querySelector<HTMLElement>('.coupon-select-btn')
  return el?.textContent?.trim().replace(/\s*\(\d+\)\s*$/, '') ?? ''
}

function truncate(str: string, maxLength: number = 80): string {
  if (!str) {
    return ''
  }
  if (str.length <= maxLength) {
    return str
  }
  return `${str.slice(0, maxLength - 3).trim()}...`
}

function getPlatformFromDOM(): string | null {
  const platformIcon = document.querySelector<HTMLElement>('.platform-type.icon img')
  if (platformIcon) {
    const alt = platformIcon.getAttribute('alt')
    if (alt && alt.trim()) {
      return alt.trim()
    }
    const title = platformIcon.getAttribute('title')
    if (title && title.trim()) {
      return title.trim()
    }
    const src = platformIcon.getAttribute('src') || ''
    if (src.includes('1688')) {
      return '1688'
    }
    if (src.includes('taobao')) {
      return 'Taobao'
    }
    if (src.includes('weidian')) {
      return 'Weidian'
    }
    if (src.includes('jd')) {
      return 'JD.com'
    }
  }
  const platformText = document.querySelector<HTMLElement>('.platform-type')?.textContent?.trim()
  if (platformText && ['1688', 'Taobao', 'Weidian', 'JD.com'].some(p => platformText.includes(p))) {
    return platformText
  }
  return null
}

function getProductInfoFromStructuredData(): { name: string | null, price: number | null, currency: string | null } {
  const script = document.querySelector<HTMLScriptElement>('script[type="application/ld+json"][data-structured-data="product"]')
  if (!script) {
    return { name: null, price: null, currency: null }
  }
  try {
    const data = JSON.parse(script.textContent || '')
    if (data['@type'] === 'Product') {
      return {
        name: data.name || null,
        price: data.offers?.price ?? null,
        currency: data.offers?.priceCurrency || null,
      }
    }
  }
  catch {
    console.warn('Falling Back To DOM Elements.')
  }
  return { name: null, price: null, currency: null }
}

function getShopNameFromDOM(): string | null {
  return document.querySelector<HTMLElement>('.shop-name .shop-text .shop-title')?.textContent?.trim() ?? null
}

function getProductNameFromDOM(): string | null {
  return document.querySelector<HTMLElement>('.good-info .title .text h1')?.textContent?.trim() ?? null
}

function getQCCount(): number {
  const items = document.querySelectorAll('.new-qc-content-item')
  return items.length
}

function getShopRatingAndSales(): { rating: string | null, sales: string | null } {
  const ratingEl = document.querySelector<HTMLElement>('.shop-rating .score')
  const rating = ratingEl?.textContent?.trim() ?? null
  const salesEl = document.querySelector<HTMLElement>('.shop-rating .positive')
  let sales = salesEl?.textContent?.trim() ?? null
  if (sales) {
    const match = sales.match(/([\d,]+)\s*Sales\s*Volume/i)
    if (match) {
      sales = match[1]!
    }
  }
  return { rating, sales }
}

async function getSmallImageKey(defaultKey: string, defaultTextKey: string, strings: Record<string, string>): Promise<{ key: string, text: string }> {
  const useAvatar = await presence.getSetting<boolean>('useAvatar').catch(() => false)
  if (useAvatar) {
    const avatarImg = document.querySelector<HTMLImageElement>('.user-head-img')
    const avatarUrl = avatarImg?.src
    if (avatarUrl && !avatarUrl.includes('default') && !avatarUrl.includes('placeholder')) {
      return { key: avatarUrl, text: strings['hipobuy.profilePicture'] || 'Profile picture' }
    }
  }
  return { key: defaultKey, text: strings[defaultTextKey] || defaultTextKey }
}

presence.on('UpdateData', async () => {
  const { pathname, search, href } = document.location
  const showTimestamps = await presence.getSetting<boolean>('timestamps').catch(() => true)
  const disableButtons = await presence.getSetting<boolean>('disableButtons').catch(() => false)

  const strings = await presence.getStrings({
    browsing: 'general.browsing',
    viewingHomepage: 'general.viewHome',
    browsingCategories: 'hipobuy.browsingCategories',
    browsingShop: 'hipobuy.browsingShop',
    browsingGoods: 'hipobuy.browsingGoods',
    viewingProduct: 'general.viewAProduct',
    viewingProductFrom: 'hipobuy.viewingProductFrom',
    viewingGoodsDetails: 'hipobuy.viewingGoodsDetails',
    viewingShopDetails: 'hipobuy.viewingShopDetails',
    estimatingPrice: 'hipobuy.estimatingPrice',
    readingBeginnerGuide: 'hipobuy.readingBeginnerGuide',
    viewingTransportInfo: 'hipobuy.viewingTransportInfo',
    viewingHelp: 'hipobuy.viewingHelp',
    readingHelpArticle: 'hipobuy.readingHelpArticle',
    viewingIssue: 'hipobuy.viewingIssue',
    viewingNotice: 'hipobuy.viewingNotice',
    readingPrivacyPolicy: 'hipobuy.readingPrivacyPolicy',
    readingTerms: 'hipobuy.readingTerms',
    viewingDownload: 'hipobuy.viewingDownload',
    signingIn: 'hipobuy.signingIn',
    creatingAccount: 'hipobuy.creatingAccount',
    resettingPassword: 'hipobuy.resettingPassword',
    viewingDashboard: 'hipobuy.viewingDashboard',
    viewingCart: 'hipobuy.viewingCart',
    viewingFavorites: 'hipobuy.viewingFavorites',
    favoritesTabAll: 'hipobuy.favoritesTabAll',
    favoritesTab1688: 'hipobuy.favoritesTab1688',
    favoritesTabTaobao: 'hipobuy.favoritesTabTaobao',
    favoritesTabWeidian: 'hipobuy.favoritesTabWeidian',
    viewingOrders: 'hipobuy.viewingOrders',
    ordersTabAll: 'hipobuy.ordersTabAll',
    ordersTabPaymentPending: 'hipobuy.ordersTabPaymentPending',
    ordersTabToBeConfirmed: 'hipobuy.ordersTabToBeConfirmed',
    viewingWarehouse: 'hipobuy.viewingWarehouse',
    viewingShipments: 'hipobuy.viewingShipments',
    shipmentsTabAll: 'hipobuy.shipmentsTabAll',
    shipmentsTabWaitingConfirmation: 'hipobuy.shipmentsTabWaitingConfirmation',
    shipmentsTabWaitPayment: 'hipobuy.shipmentsTabWaitPayment',
    shipmentsTabShipped: 'hipobuy.shipmentsTabShipped',
    shipmentsTabCompleted: 'hipobuy.shipmentsTabCompleted',
    shipmentsTabCancelled: 'hipobuy.shipmentsTabCancelled',
    viewingAssets: 'hipobuy.viewingAssets',
    assetsTabBalance: 'hipobuy.assetsTabBalance',
    assetsTabHipoCoin: 'hipobuy.assetsTabHipoCoin',
    assetsTabThirdPayment: 'hipobuy.assetsTabThirdPayment',
    writingReview: 'hipobuy.writingReview',
    viewingPoints: 'hipobuy.viewingPoints',
    viewingNews: 'hipobuy.viewingNews',
    newsTabConfirm: 'hipobuy.newsTabConfirm',
    newsTabInSiteMessage: 'hipobuy.newsTabInSiteMessage',
    newsTabPendingTasks: 'hipobuy.newsTabPendingTasks',
    newsTabPurchasingAgent: 'hipobuy.newsTabPurchasingAgent',
    viewingRehearsal: 'hipobuy.viewingRehearsal',
    viewingWinningRecord: 'hipobuy.viewingWinningRecord',
    viewingCouponCenter: 'hipobuy.viewingCouponCenter',
    couponTabProduct: 'hipobuy.couponTabProduct',
    couponTabShipping: 'hipobuy.couponTabShipping',
    couponTabExpired: 'hipobuy.couponTabExpired',
    viewingSettings: 'hipobuy.viewingSettings',
    settingsShippingAddress: 'hipobuy.settingsShippingAddress',
    settingsAccountSecurity: 'hipobuy.settingsAccountSecurity',
    settingsAccountsReceivable: 'hipobuy.settingsAccountsReceivable',
    settingsCreditCardBilling: 'hipobuy.settingsCreditCardBilling',
    checkingOut: 'hipobuy.checkingOut',
    bankRemittance: 'hipobuy.bankRemittance',
    viewingAffiliate: 'hipobuy.viewingAffiliate',
    placingDiyOrder: 'hipobuy.placingDiyOrder',
    viewingPromotion: 'hipobuy.viewingPromotion',
    viewingFreeShipping: 'hipobuy.viewingFreeShipping',
    viewingRewards: 'hipobuy.viewingRewards',
    viewingPopUpShop: 'hipobuy.viewingPopUpShop',
    searchingFor: 'general.search',
    profilePicture: 'hipobuy.profilePicture',
    cart: 'general.shopCart',
    favorites: 'hipobuy.favorites',
    orders: 'hipobuy.orders',
    warehouse: 'hipobuy.warehouse',
    shipments: 'hipobuy.shipments',
    assets: 'hipobuy.assets',
    review: 'hipobuy.review',
    points: 'hipobuy.points',
    notifications: 'hipobuy.notifications',
    rehearsal: 'hipobuy.rehearsal',
    winningRecord: 'hipobuy.winningRecord',
    coupons: 'hipobuy.coupons',
    settings: 'hipobuy.settings',
    affiliate: 'hipobuy.affiliate',
    dashboard: 'hipobuy.dashboard',
    homepage: 'hipobuy.homepage',
    viewProduct: 'hipobuy.viewProduct',
    visitShop: 'hipobuy.visitShop',
    search: 'hipobuy.search',
    goods: 'hipobuy.goods',
    estimation: 'hipobuy.estimation',
    beginnerGuide: 'hipobuy.beginnerGuide',
    transport: 'hipobuy.transport',
    helpArticle: 'hipobuy.helpArticle',
    helpCenter: 'hipobuy.helpCenter',
    issue: 'hipobuy.issue',
    privacyPolicy: 'general.privacy',
    termsOfService: 'general.terms',
    notice: 'hipobuy.notice',
    download: 'hipobuy.download',
    signIn: 'hipobuy.signIn',
    register: 'hipobuy.register',
    passwordReset: 'hipobuy.passwordReset',
    checkout: 'hipobuy.checkout',
    bankTransfer: 'hipobuy.bankTransfer',
    customOrder: 'hipobuy.customOrder',
    freeShipping: 'hipobuy.freeShipping',
    rewards: 'hipobuy.rewards',
    popUpShop: 'hipobuy.popUpShop',
    sale1111: 'hipobuy.sale1111',
    product: 'hipobuy.product',
    shopPrefix: 'hipobuy.shopPrefix',
    productPrefix: 'hipobuy.productPrefix',
    noticeContactUs: 'hipobuy.noticeContactUs',
    noticeAboutUs: 'hipobuy.noticeAboutUs',
    noticeServiceFees: 'hipobuy.noticeServiceFees',
    noticeReturnsRefunds: 'hipobuy.noticeReturnsRefunds',
    noticeOrderStatus: 'hipobuy.noticeOrderStatus',
    noticeInternationalCreditCard: 'hipobuy.noticeInternationalCreditCard',
    noticeReceiptInfo: 'hipobuy.noticeReceiptInfo',
    noticeParcelAgreement: 'hipobuy.noticeParcelAgreement',
    noticeCharges: 'hipobuy.noticeCharges',
    noticeCustomsTaxation: 'hipobuy.noticeCustomsTaxation',
    noticeProductIssue: 'hipobuy.noticeProductIssue',
    noticeInsuranceCompensation: 'hipobuy.noticeInsuranceCompensation',
    starRating: 'hipobuy.starRating',
    salesVolume: 'hipobuy.salesVolume',
    qcPhotos: 'hipobuy.qcPhotos',
  })

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: showTimestamps ? browsingTimestamp : undefined,
  }

  if (pathname.startsWith('/user/')) {
    if (pathname.includes('/shopping')) {
      const { key, text } = await getSmallImageKey(ActivityAssets.Cart, 'cart', strings)
      presenceData.smallImageKey = key
      presenceData.smallImageText = text
      presenceData.details = strings.viewingCart
    }
    else if (pathname.includes('/favorite') || pathname.includes('/favourite')) {
      const { key, text } = await getSmallImageKey(ActivityAssets.Bookmark, 'favorites', strings)
      presenceData.smallImageKey = key
      presenceData.smallImageText = text
      presenceData.details = strings.viewingFavorites
      const tab = getFavoriteTab()
      const favTabMap: Record<string, string> = {
        All: strings.favoritesTabAll,
        1688: strings.favoritesTab1688,
        TaoBao: strings.favoritesTabTaobao,
        WeiDian: strings.favoritesTabWeidian,
      }
      presenceData.state = (tab && favTabMap[tab]) ? favTabMap[tab] : strings.favoritesTabAll
    }
    else if (pathname.includes('/order')) {
      const { key, text } = await getSmallImageKey(ActivityAssets.Parcel, 'orders', strings)
      presenceData.smallImageKey = key
      presenceData.smallImageText = text
      presenceData.details = strings.viewingOrders
      const tab = getActiveTab()
      const orderTabMap: Record<string, string> = {
        'All': strings.ordersTabAll,
        'Payment Pending': strings.ordersTabPaymentPending,
        'Orders to be confirmed': strings.ordersTabToBeConfirmed,
      }
      presenceData.state = (tab && orderTabMap[tab]) ? orderTabMap[tab] : strings.ordersTabAll
    }
    else if (pathname.includes('/warehouse')) {
      const { key, text } = await getSmallImageKey(ActivityAssets.Cloud, 'warehouse', strings)
      presenceData.smallImageKey = key
      presenceData.smallImageText = text
      presenceData.details = strings.viewingWarehouse
    }
    else if (pathname.includes('/shipment')) {
      const { key, text } = await getSmallImageKey(ActivityAssets.Parcel, 'shipments', strings)
      presenceData.smallImageKey = key
      presenceData.smallImageText = text
      presenceData.details = strings.viewingShipments
      const tab = getActiveTab()
      const shipTabMap: Record<string, string> = {
        'All Parcels': strings.shipmentsTabAll,
        'Waiting for Confirmation': strings.shipmentsTabWaitingConfirmation,
        'Wait for Payment': strings.shipmentsTabWaitPayment,
        'Shipped': strings.shipmentsTabShipped,
        'Completed': strings.shipmentsTabCompleted,
        'Cancel the Waybill': strings.shipmentsTabCancelled,
      }
      presenceData.state = (tab && shipTabMap[tab]) ? shipTabMap[tab] : strings.shipmentsTabAll
    }
    else if (pathname.includes('/assets')) {
      const { key, text } = await getSmallImageKey(ActivityAssets.Crown, 'assets', strings)
      presenceData.smallImageKey = key
      presenceData.smallImageText = text
      presenceData.details = strings.viewingAssets
      const tab = getActiveTab()
      const assetTabMap: Record<string, string> = {
        'Balance': strings.assetsTabBalance,
        'Hipo Coin': strings.assetsTabHipoCoin,
        'Third Payment': strings.assetsTabThirdPayment,
      }
      presenceData.state = (tab && assetTabMap[tab]) ? assetTabMap[tab] : strings.assetsTabBalance
    }
    else if (pathname.includes('/review')) {
      const { key, text } = await getSmallImageKey(ActivityAssets.Pencil, 'review', strings)
      presenceData.smallImageKey = key
      presenceData.smallImageText = text
      presenceData.details = strings.writingReview
    }
    else if (pathname.includes('/points')) {
      const { key, text } = await getSmallImageKey(ActivityAssets.Crown, 'points', strings)
      presenceData.smallImageKey = key
      presenceData.smallImageText = text
      presenceData.details = strings.viewingPoints
    }
    else if (pathname.includes('/news')) {
      const { key, text } = await getSmallImageKey(ActivityAssets.Notification, 'notifications', strings)
      presenceData.smallImageKey = key
      presenceData.smallImageText = text
      presenceData.details = strings.viewingNews
      const tab = getActiveTab()
      const newsTabMap: Record<string, string> = {
        'Confirm': strings.newsTabConfirm,
        'In-site Message': strings.newsTabInSiteMessage,
        'Pending Tasks': strings.newsTabPendingTasks,
        'Purchasing Agent': strings.newsTabPurchasingAgent,
      }
      if (tab && newsTabMap[tab]) {
        presenceData.state = newsTabMap[tab]
      }
    }
    else if (pathname.includes('/rehearsal')) {
      const { key, text } = await getSmallImageKey(ActivityAssets.Eye, 'rehearsal', strings)
      presenceData.smallImageKey = key
      presenceData.smallImageText = text
      presenceData.details = strings.viewingRehearsal
    }
    else if (pathname.includes('/winningRecord')) {
      const { key, text } = await getSmallImageKey(ActivityAssets.Crown, 'winningRecord', strings)
      presenceData.smallImageKey = key
      presenceData.smallImageText = text
      presenceData.details = strings.viewingWinningRecord
    }
    else if (pathname.includes('/coupon-center')) {
      const { key, text } = await getSmallImageKey(ActivityAssets.Sparkle, 'coupons', strings)
      presenceData.smallImageKey = key
      presenceData.smallImageText = text
      presenceData.details = strings.viewingCouponCenter
      const tab = getCouponTab()
      const couponTabMap: Record<string, string> = {
        'Product Coupon': strings.couponTabProduct,
        'Shipping Coupon': strings.couponTabShipping,
        'Expired Coupon': strings.couponTabExpired,
      }
      if (tab && couponTabMap[tab]) {
        presenceData.state = couponTabMap[tab]
      }
    }
    else if (pathname.includes('/setting')) {
      const { key, text } = await getSmallImageKey(ActivityAssets.Settings, 'settings', strings)
      presenceData.smallImageKey = key
      presenceData.smallImageText = text
      presenceData.details = strings.viewingSettings
      const tab = getActiveTab()
      const settingTabMap: Record<string, string> = {
        'Shipping Address': strings.settingsShippingAddress,
        'Account Security': strings.settingsAccountSecurity,
        'Accounts Receivable': strings.settingsAccountsReceivable,
        'Credit Card Billing Address': strings.settingsCreditCardBilling,
      }
      if (tab && settingTabMap[tab]) {
        presenceData.state = settingTabMap[tab]
      }
    }
    else if (pathname.includes('/com-share')) {
      const { key, text } = await getSmallImageKey(ActivityAssets.Group, 'affiliate', strings)
      presenceData.smallImageKey = key
      presenceData.smallImageText = text
      presenceData.details = strings.viewingAffiliate
    }
    else {
      const { key, text } = await getSmallImageKey(ActivityAssets.Person, 'dashboard', strings)
      presenceData.smallImageKey = key
      presenceData.smallImageText = text
      presenceData.details = strings.viewingDashboard
    }
  }
  else {
    if (pathname === '/' || pathname === '') {
      const { key, text } = await getSmallImageKey(ActivityAssets.House, 'homepage', strings)
      presenceData.smallImageKey = key
      presenceData.smallImageText = text
      presenceData.details = 'Hipobuy'
      presenceData.state = strings.viewingHomepage
    }
    else if (pathname.startsWith('/product/')) {
      const structured = getProductInfoFromStructuredData()
      let productName = structured.name
      if (!productName) {
        productName = getProductNameFromDOM()
      }
      if (!productName) {
        presence.clearActivity()
        return
      }

      const shopName = getShopNameFromDOM()
      const { rating, sales } = getShopRatingAndSales()
      const qcCount = getQCCount()

      const { key, text } = await getSmallImageKey(ActivityAssets.Eye, 'product', strings)
      presenceData.smallImageKey = key
      presenceData.smallImageText = text

      let priceStr = ''
      if (structured.price && structured.currency) {
        priceStr = `${structured.currency} ${structured.price.toFixed(2)}`
      }

      const productPart = truncate(productName, 70)
      if (priceStr) {
        presenceData.details = `${priceStr}⠀•⠀${productPart}`
      }
      else {
        presenceData.details = productPart
      }

      const stateParts: string[] = []
      if (shopName) {
        stateParts.push(truncate(shopName, 40))
      }
      if (rating) {
        stateParts.push(`${rating} ${strings.starRating}`)
      }
      if (sales) {
        stateParts.push(`${sales} ${strings.salesVolume}`)
      }
      if (qcCount > 0) {
        stateParts.push(`${qcCount} ${strings.qcPhotos}`)
      }
      if (stateParts.length) {
        presenceData.state = stateParts.join('⠀•⠀')
      }

      if (!disableButtons) {
        presenceData.buttons = [{ label: strings.viewProduct, url: cleanInviteCode(href) }]
      }
    }
    else if (pathname.startsWith('/goods/details')) {
      const structured = getProductInfoFromStructuredData()
      let productName = structured.name
      if (!productName) {
        productName = getProductNameFromDOM()
      }
      if (!productName) {
        presence.clearActivity()
        return
      }

      const shopName = getShopNameFromDOM()
      const { rating, sales } = getShopRatingAndSales()
      const qcCount = getQCCount()
      const platformDisplay = getPlatformFromDOM()

      const { key, text } = await getSmallImageKey(ActivityAssets.Eye, 'product', strings)
      presenceData.smallImageKey = key
      presenceData.smallImageText = text

      let priceStr = ''
      if (structured.price && structured.currency) {
        priceStr = `${structured.currency} ${structured.price.toFixed(2)}`
      }

      const productPart = truncate(productName, 70)
      const prefix = platformDisplay ? `${strings.productPrefix} ${strings.viewingProductFrom} ${platformDisplay}: ` : `${strings.productPrefix} `
      if (priceStr) {
        presenceData.details = `${priceStr}⠀•⠀${prefix}${productPart}`
      }
      else {
        presenceData.details = `${prefix}${productPart}`
      }

      const stateParts: string[] = []
      if (shopName) {
        stateParts.push(truncate(shopName, 40))
      }
      if (rating) {
        stateParts.push(`${rating} ${strings.starRating}`)
      }
      if (sales) {
        stateParts.push(`${sales} ${strings.salesVolume}`)
      }
      if (qcCount > 0) {
        stateParts.push(`${qcCount} ${strings.qcPhotos}`)
      }
      if (stateParts.length) {
        presenceData.state = stateParts.join('⠀•⠀')
      }
      if (!disableButtons) {
        presenceData.buttons = [{ label: strings.viewProduct, url: cleanInviteCode(href) }]
      }
    }
    else if (pathname.startsWith('/shop/details')) {
      const shopName = document.querySelector<HTMLElement>('.shop-name .shop-text .shop-title')?.textContent?.trim()
      if (!shopName) {
        presence.clearActivity()
        return
      }
      const { key, text } = await getSmallImageKey(ActivityAssets.Eye, 'product', strings)
      presenceData.smallImageKey = key
      presenceData.smallImageText = text
      presenceData.details = strings.viewingShopDetails
      presenceData.state = shopName
      if (!disableButtons) {
        presenceData.buttons = [{ label: strings.visitShop, url: href }]
      }
    }
    else if (pathname.startsWith('/categories')) {
      const { key, text } = await getSmallImageKey(ActivityAssets.Search, 'search', strings)
      presenceData.smallImageKey = key
      presenceData.smallImageText = text
      presenceData.details = strings.browsingCategories
    }
    else if (pathname.startsWith('/shop')) {
      const { key, text } = await getSmallImageKey(ActivityAssets.Search, 'search', strings)
      presenceData.smallImageKey = key
      presenceData.smallImageText = text
      presenceData.details = strings.browsingShop
    }
    else if (pathname.startsWith('/goods')) {
      const params = new URLSearchParams(search)
      const searchQuery = params.get('text')
      if (searchQuery && searchQuery.trim() !== '') {
        const { key, text } = await getSmallImageKey(ActivityAssets.Search, 'search', strings)
        presenceData.smallImageKey = key
        presenceData.smallImageText = text
        presenceData.details = `${strings.searchingFor} "${searchQuery.trim()}"`
        const activeTab = document.querySelector<HTMLElement>('.tabs .tab-active')?.textContent?.trim()
        let activeState: string | undefined
        const sortContainer = document.querySelector<HTMLElement>('.t-sort.sort.active-left')
        if (sortContainer) {
          const sortText = sortContainer.querySelector<HTMLElement>('.text')?.textContent?.trim()
          const upActive = sortContainer.querySelector('.ivu-icon-md-arrow-dropup.active') !== null
          const downActive = sortContainer.querySelector('.ivu-icon-md-arrow-dropdown.active') !== null
          let direction = ''
          if (upActive) {
            direction = '↑'
          }
          else if (downActive) {
            direction = '↓'
          }
          activeState = `${sortText || 'Sort'} ${direction}`.trim()
        }
        else {
          const activeFilter = document.querySelector<HTMLElement>('.filter-content .label')?.textContent?.trim()
          activeState = activeFilter
        }
        const stateParts: string[] = []
        if (activeTab) {
          stateParts.push(activeTab)
        }
        if (activeState) {
          stateParts.push(activeState)
        }
        presenceData.state = stateParts.length ? stateParts.join(' · ') : undefined
        if (!disableButtons) {
          presenceData.buttons = [{ label: strings.search, url: href }]
        }
      }
      else {
        const { key, text } = await getSmallImageKey(ActivityAssets.Search, 'goods', strings)
        presenceData.smallImageKey = key
        presenceData.smallImageText = text
        presenceData.details = strings.browsingGoods
      }
    }
    else if (pathname.startsWith('/estimation')) {
      const { key, text } = await getSmallImageKey(ActivityAssets.Arrows, 'estimation', strings)
      presenceData.smallImageKey = key
      presenceData.smallImageText = text
      presenceData.details = strings.estimatingPrice
    }
    else if (pathname.includes('/com-share')) {
      const { key, text } = await getSmallImageKey(ActivityAssets.Group, 'affiliate', strings)
      presenceData.smallImageKey = key
      presenceData.smallImageText = text
      presenceData.details = strings.viewingAffiliate
    }
    else if (pathname.startsWith('/beginner-guide')) {
      const { key, text } = await getSmallImageKey(ActivityAssets.Book, 'beginnerGuide', strings)
      presenceData.smallImageKey = key
      presenceData.smallImageText = text
      presenceData.details = strings.readingBeginnerGuide
    }
    else if (pathname.startsWith('/transport')) {
      const { key, text } = await getSmallImageKey(ActivityAssets.Network, 'transport', strings)
      presenceData.smallImageKey = key
      presenceData.smallImageText = text
      presenceData.details = strings.viewingTransportInfo
    }
    else if (pathname.startsWith('/help/details')) {
      const articleTitle = document.title?.trim()
      if (!articleTitle || articleTitle.toLowerCase() === 'hipobuy') {
        presence.clearActivity()
        return
      }
      const { key, text } = await getSmallImageKey(ActivityAssets.Book, 'helpArticle', strings)
      presenceData.smallImageKey = key
      presenceData.smallImageText = text
      presenceData.details = strings.readingHelpArticle
      presenceData.state = articleTitle
    }
    else if (pathname.startsWith('/help')) {
      const { key, text } = await getSmallImageKey(ActivityAssets.Chat, 'helpCenter', strings)
      presenceData.smallImageKey = key
      presenceData.smallImageText = text
      presenceData.details = strings.viewingHelp
    }
    else if (pathname.startsWith('/issueView')) {
      const { key, text } = await getSmallImageKey(ActivityAssets.Chat, 'issue', strings)
      presenceData.smallImageKey = key
      presenceData.smallImageText = text
      presenceData.details = strings.viewingIssue
    }
    else if (pathname.includes('/notice/1743203728339603458')) {
      const { key, text } = await getSmallImageKey(ActivityAssets.Book, 'privacyPolicy', strings)
      presenceData.smallImageKey = key
      presenceData.smallImageText = text
      presenceData.details = strings.readingPrivacyPolicy
    }
    else if (pathname.includes('/notice/1743203214533169153')) {
      const { key, text } = await getSmallImageKey(ActivityAssets.Book, 'termsOfService', strings)
      presenceData.smallImageKey = key
      presenceData.smallImageText = text
      presenceData.details = strings.readingTerms
    }
    else if (pathname.includes('/notice/1901839623362531329')) {
      const { key, text } = await getSmallImageKey(ActivityAssets.Chat, 'noticeContactUs', strings)
      presenceData.smallImageKey = key
      presenceData.smallImageText = text
      presenceData.details = strings.noticeContactUs
    }
    else if (pathname.includes('/notice/1901847126636843010')) {
      const { key, text } = await getSmallImageKey(ActivityAssets.Chat, 'noticeAboutUs', strings)
      presenceData.smallImageKey = key
      presenceData.smallImageText = text
      presenceData.details = strings.noticeAboutUs
    }
    else if (pathname.includes('/notice/1740653781924810754')) {
      const { key, text } = await getSmallImageKey(ActivityAssets.Book, 'noticeServiceFees', strings)
      presenceData.smallImageKey = key
      presenceData.smallImageText = text
      presenceData.details = strings.noticeServiceFees
    }
    else if (pathname.includes('/notice/1740656181012172801')) {
      const { key, text } = await getSmallImageKey(ActivityAssets.Book, 'noticeReturnsRefunds', strings)
      presenceData.smallImageKey = key
      presenceData.smallImageText = text
      presenceData.details = strings.noticeReturnsRefunds
    }
    else if (pathname.includes('/notice/1901884786310991873')) {
      const { key, text } = await getSmallImageKey(ActivityAssets.Book, 'noticeOrderStatus', strings)
      presenceData.smallImageKey = key
      presenceData.smallImageText = text
      presenceData.details = strings.noticeOrderStatus
    }
    else if (pathname.includes('/notice/1740661217771491330')) {
      const { key, text } = await getSmallImageKey(ActivityAssets.Crown, 'noticeInternationalCreditCard', strings)
      presenceData.smallImageKey = key
      presenceData.smallImageText = text
      presenceData.details = strings.noticeInternationalCreditCard
    }
    else if (pathname.includes('/notice/1740663892185550850')) {
      const { key, text } = await getSmallImageKey(ActivityAssets.Network, 'noticeReceiptInfo', strings)
      presenceData.smallImageKey = key
      presenceData.smallImageText = text
      presenceData.details = strings.noticeReceiptInfo
    }
    else if (pathname.includes('/notice/1772881180494462977')) {
      const { key, text } = await getSmallImageKey(ActivityAssets.Network, 'noticeParcelAgreement', strings)
      presenceData.smallImageKey = key
      presenceData.smallImageText = text
      presenceData.details = strings.noticeParcelAgreement
    }
    else if (pathname.includes('/notice/1740661564720123906')) {
      const { key, text } = await getSmallImageKey(ActivityAssets.Network, 'noticeCharges', strings)
      presenceData.smallImageKey = key
      presenceData.smallImageText = text
      presenceData.details = strings.noticeCharges
    }
    else if (pathname.includes('/notice/1740663384020455425')) {
      const { key, text } = await getSmallImageKey(ActivityAssets.Network, 'noticeCustomsTaxation', strings)
      presenceData.smallImageKey = key
      presenceData.smallImageText = text
      presenceData.details = strings.noticeCustomsTaxation
    }
    else if (pathname.includes('/notice/1772884100300472322')) {
      const { key, text } = await getSmallImageKey(ActivityAssets.Chat, 'noticeProductIssue', strings)
      presenceData.smallImageKey = key
      presenceData.smallImageText = text
      presenceData.details = strings.noticeProductIssue
    }
    else if (pathname.includes('/notice/1906603612122468353')) {
      const { key, text } = await getSmallImageKey(ActivityAssets.Crown, 'noticeInsuranceCompensation', strings)
      presenceData.smallImageKey = key
      presenceData.smallImageText = text
      presenceData.details = strings.noticeInsuranceCompensation
    }
    else if (pathname.startsWith('/notice')) {
      const { key, text } = await getSmallImageKey(ActivityAssets.Notification, 'notice', strings)
      presenceData.smallImageKey = key
      presenceData.smallImageText = text
      presenceData.details = strings.viewingNotice
    }
    else if (pathname.startsWith('/download')) {
      const { key, text } = await getSmallImageKey(ActivityAssets.Cloud, 'download', strings)
      presenceData.smallImageKey = key
      presenceData.smallImageText = text
      presenceData.details = strings.viewingDownload
    }
    else if (pathname.startsWith('/login')) {
      const { key, text } = await getSmallImageKey(ActivityAssets.Login, 'signIn', strings)
      presenceData.smallImageKey = key
      presenceData.smallImageText = text
      presenceData.details = strings.signingIn
    }
    else if (pathname.startsWith('/register')) {
      const { key, text } = await getSmallImageKey(ActivityAssets.PersonCheck, 'register', strings)
      presenceData.smallImageKey = key
      presenceData.smallImageText = text
      presenceData.details = strings.creatingAccount
    }
    else if (pathname.startsWith('/forgot')) {
      const { key, text } = await getSmallImageKey(ActivityAssets.Person, 'passwordReset', strings)
      presenceData.smallImageKey = key
      presenceData.smallImageText = text
      presenceData.details = strings.resettingPassword
    }
    else if (pathname.startsWith('/pay')) {
      const { key, text } = await getSmallImageKey(ActivityAssets.Crown, 'checkout', strings)
      presenceData.smallImageKey = key
      presenceData.smallImageText = text
      presenceData.details = strings.checkingOut
    }
    else if (pathname.startsWith('/bankRemittance')) {
      const { key, text } = await getSmallImageKey(ActivityAssets.Network, 'bankTransfer', strings)
      presenceData.smallImageKey = key
      presenceData.smallImageText = text
      presenceData.details = strings.bankRemittance
    }
    else if (pathname.startsWith('/diy-order')) {
      const { key, text } = await getSmallImageKey(ActivityAssets.MagicPen, 'customOrder', strings)
      presenceData.smallImageKey = key
      presenceData.smallImageText = text
      presenceData.details = strings.placingDiyOrder
    }
    else if (pathname.startsWith('/free-shipping')) {
      const { key, text } = await getSmallImageKey(ActivityAssets.Sparkle, 'freeShipping', strings)
      presenceData.smallImageKey = key
      presenceData.smallImageText = text
      presenceData.details = strings.viewingFreeShipping
    }
    else if (pathname.startsWith('/get-rewards')) {
      const { key, text } = await getSmallImageKey(ActivityAssets.Crown, 'rewards', strings)
      presenceData.smallImageKey = key
      presenceData.smallImageText = text
      presenceData.details = strings.viewingRewards
    }
    else if (pathname.startsWith('/pop-up-shop')) {
      const { key, text } = await getSmallImageKey(ActivityAssets.Search, 'popUpShop', strings)
      presenceData.smallImageKey = key
      presenceData.smallImageText = text
      presenceData.details = strings.viewingPopUpShop
    }
    else if (pathname.startsWith('/1111-of-2024') || pathname.startsWith('/1111')) {
      const { key, text } = await getSmallImageKey(ActivityAssets.Sparkle, 'sale1111', strings)
      presenceData.smallImageKey = key
      presenceData.smallImageText = text
      presenceData.details = strings.viewingPromotion
      presenceData.state = strings.sale1111
    }
  }

  if (presenceData.details) {
    presence.setActivity(presenceData)
  }
  else {
    presence.clearActivity()
  }
})
