const presence = new Presence({
  clientId: '1219273134541115463',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)
let observedProductModal: HTMLElement | null = null
let productModalObserver: MutationObserver | undefined
let refreshTimer: ReturnType<typeof setTimeout> | undefined

enum ActivityAssets {
  Logo = 'https://i.imgur.com/ZIxVopt.png',
}

function getCurrentProductName(): string | undefined {
  try {
    const openModal = document.querySelector<HTMLElement>(
      '#productModal.active[aria-hidden="false"]',
    )

    if (!openModal || openModal.style.display === 'none')
      return undefined

    return openModal.querySelector<HTMLElement>('#modalName')?.textContent?.trim()
      || undefined
  }
  catch {
    return undefined
  }
}

function observeProductModal(): void {
  const modal = document.querySelector<HTMLElement>('#productModal')
  if (modal === observedProductModal)
    return

  productModalObserver?.disconnect()
  observedProductModal = modal
  if (!modal)
    return

  productModalObserver = new MutationObserver(() => {
    if (refreshTimer)
      clearTimeout(refreshTimer)

    refreshTimer = setTimeout(() => {
      refreshTimer = undefined
      void updatePresence()
    }, 50)
  })
  productModalObserver.observe(modal, {
    attributes: true,
    attributeFilter: ['aria-hidden', 'class', 'hidden', 'style'],
    childList: true,
    characterData: true,
    subtree: true,
  })
}

function updatePresence(): void {
  observeProductModal()
  const url = new URL(document.location.href)
  const pathname = url.pathname.replace(/^\/shark(?=\/|$)/, '') || '/'

  // Never broadcast administration or checkout activity to Discord.
  if (
    pathname === '/admin'
    || pathname.startsWith('/admin/')
    || document.querySelector('#checkoutModal.active[aria-hidden="false"]')
  ) {
    presence.clearActivity()
    return
  }

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  const productName = getCurrentProductName()
  const productId = url.searchParams.get('id')
  const modalCode = document.querySelector<HTMLElement>(
    '#productModal.active[aria-hidden="false"] #modalCode',
  )?.textContent?.trim()

  if (productName) {
    presenceData.details = 'يشاهد منتج'
    presenceData.state = productName

    // The URL is shareable only when it identifies the product in this modal.
    if (
      productId
      && /^[a-f\d]{24}$/i.test(productId)
      && modalCode === `#${productId.slice(-6)}`
      && (pathname === '/' || pathname === '/products' || pathname === '/products/')
    ) {
      presenceData.buttons = [{
        label: 'عرض المنتج',
        url: `https://sharkjazz.com/?id=${productId}`,
      }]
    }
  }

  // بعد ذلك صفحة جميع المنتجات
  else if (
    pathname === '/products'
    || pathname === '/products/'
    || pathname.endsWith('/products/products.html')
  ) {
    presenceData.details = 'يتصفح المنتجات'
    presenceData.state = 'جميع المنتجات'
  }

  else if (pathname === '/' || pathname === '/index.html') {
    presenceData.details = 'يتصفح Shark Jazz'
    presenceData.state = 'الرئيسية'
  }

  else if (
    pathname === '/reviews'
    || pathname === '/reviews/'
    || pathname.includes('/review/reviews.html')
  ) {
    presenceData.details = 'يتصفح تقييمات العملاء'
    presenceData.state = 'التقييمات'
  }

  else if (
    pathname === '/contact'
    || pathname === '/contact/'
    || pathname.includes('/contact/contact.html')
  ) {
    presenceData.details = 'يتصفح صفحة التواصل'
    presenceData.state = 'تواصل معنا'
  }

  else if (
    pathname === '/about'
    || pathname === '/about/'
    || pathname.includes('/about/about.html')
  ) {
    presenceData.details = 'يتعرف على Shark Jazz'
    presenceData.state = 'من نحن'
  }

  else if (
    pathname.includes('/cart')
    || pathname.includes('/shopping-cart')
  ) {
    presenceData.details = 'يتفقد سلة التسوق'
    presenceData.state = 'السلة'
  }

  else if (
    pathname === '/profile'
    || pathname.startsWith('/profile/')
  ) {
    presenceData.details = 'يتصفح حسابه'
    presenceData.state = 'الملف الشخصي'
  }

  else if (
    pathname.includes('/my-orders')
    || pathname.includes('/my_orders/')
  ) {
    presenceData.details = 'يتابع طلباته'
    presenceData.state = 'طلباتي'
  }

  else if (
    pathname === '/account'
    || pathname.startsWith('/account/')
  ) {
    presenceData.details = 'صفحة الحساب'
    presenceData.state = 'Shark Jazz'
  }

  else {
    presenceData.details = 'يتصفح Shark Jazz'
    presenceData.state = 'sharkjazz.com'
  }

  presence.setActivity(presenceData)
}

presence.on('UpdateData', () => {
  updatePresence()
})
