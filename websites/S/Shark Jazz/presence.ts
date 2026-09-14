const presence = new Presence({
  clientId: '1219273134541115463',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.imgur.com/ZIxVopt.png',
}

presence.on('UpdateData', async () => {
  const { pathname, href } = document.location

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    buttons: [
      {
        label: 'زيارة Shark Jazz',
        url: 'https://sharkjazz.com',
      },
    ],
  }

  if (pathname === '/' || pathname === '/index.html') {
    presenceData.details = 'يتصفح Shark Jazz'
    presenceData.state = 'الرئيسية'
  }

  else if (
    pathname === '/products' ||
    pathname === '/products/' ||
    pathname.includes('/products/products.html')
  ) {
    presenceData.details = 'يتصفح المنتجات'
    presenceData.state = 'جميع المنتجات'
  }

  else if (
    pathname.includes('/product/') ||
    pathname.includes('/products/product')
  ) {
    const productName =
      document.querySelector('h1')?.textContent?.trim() ||
      document.querySelector('.product-title')?.textContent?.trim() ||
      document.querySelector('.product-name')?.textContent?.trim()

    presenceData.details = 'يشاهد منتج'
    presenceData.state = productName || 'منتج من Shark Jazz'

    presenceData.buttons = [
      {
        label: 'عرض المنتج',
        url: href,
      },
      {
        label: 'زيارة المتجر',
        url: 'https://sharkjazz.com',
      },
    ]
  }

  else if (
    pathname === '/reviews' ||
    pathname === '/reviews/' ||
    pathname.includes('/review/reviews.html')
  ) {
    presenceData.details = 'يتصفح تقييمات العملاء'
    presenceData.state = 'التقييمات'
  }

  else if (
    pathname === '/contact' ||
    pathname === '/contact/' ||
    pathname.includes('/contact/contact.html')
  ) {
    presenceData.details = 'يتصفح صفحة التواصل'
    presenceData.state = 'تواصل معنا'
  }

  else if (
    pathname === '/about' ||
    pathname === '/about/' ||
    pathname.includes('/about/about.html')
  ) {
    presenceData.details = 'يتعرف على Shark Jazz'
    presenceData.state = 'من نحن'
  }

  else if (
    pathname.includes('/cart') ||
    pathname.includes('/shopping-cart')
  ) {
    presenceData.details = 'يتفقد سلة التسوق'
    presenceData.state = 'السلة'
  }

  else if (
    pathname === '/profile' ||
    pathname.startsWith('/profile/')
  ) {
    presenceData.details = 'يتصفح حسابه'
    presenceData.state = 'الملف الشخصي'
  }

  else if (
    pathname.includes('/my-orders') ||
    pathname.includes('/my_orders/')
  ) {
    presenceData.details = 'يتابع طلباته'
    presenceData.state = 'طلباتي'
  }

  else if (
    pathname === '/account' ||
    pathname.startsWith('/account/')
  ) {
    presenceData.details = 'صفحة الحساب'
    presenceData.state = 'Shark Jazz'
  }

  else {
    presenceData.details = 'يتصفح Shark Jazz'
    presenceData.state = 'sharkjazz.com'
  }

  presence.setActivity(presenceData)
})