const presence = new Presence({
  clientId: '1258619078201839646',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/L/LTTStore/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
  }
  if (document.location.pathname === '/') {
    presenceData.details = 'Browsing'
    presenceData.state = 'Home'
  }
  else if (document.location.pathname.includes('/products/')) {
    presenceData.largeImageKey = document.querySelector<HTMLMetaElement>('[property="og:image"]')
      ?.content ?? ActivityAssets.Logo

    presenceData.smallImageKey = ActivityAssets.Logo
    presenceData.smallImageText = 'LTTStore'
    presenceData.details = 'Viewing Product'

    presenceData.state = document.querySelector<Element>(
      'div.product__title h1',
    )?.textContent
  }
  else if (document.location.pathname.includes('/collections/')) {
    if (document.location.pathname.includes('/collections/accessories')) {
      presenceData.details = 'Browsing'
      presenceData.state = 'Gear & Accessories'
    }
    else if (document.location.pathname.includes('/collections/clothing')) {
      presenceData.details = 'Browsing'
      presenceData.state = 'Clothing'
    }
    else if (document.location.pathname.includes('/collections/all')) {
      presenceData.details = 'Browsing'
      presenceData.state = 'All Products'
    }
    else {
      presenceData.details = 'Browsing'
      presenceData.state = 'Collections'
    }
  }
  else if (document.location.pathname.includes('/blogs/')) {
    presenceData.details = 'Reading'
    presenceData.state = document.querySelector(
      'h1.article-template__title',
    )?.textContent
  }
  else if (document.location.pathname.includes('/cart')) {
    presenceData.details = 'Viewing Cart'
    delete presenceData.state
  }
  else {
    presenceData.details = 'Browsing'
    delete presenceData.state
  }
  presence.setActivity(presenceData)
})
