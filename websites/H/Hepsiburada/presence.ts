import { Assets } from 'premid'

const presence = new Presence({
  clientId: '629650221634158592',
})
const pages: {
  [name: string]: string
} = {
  '/siparislerim': 'Siparişlerim',
  '/hesabim': 'Hesabım',
  '/ayagina-gelsin/teslimat-adreslerim': 'Teslimat Adreslerim',
  '/ayagina-gelsin/fatura-adreslerim': 'Fatura Adreslerim',
  '/ayagina-gelsin/hediye-ceklerim': 'Hedi Çeklerim',
  '/yorumlarim': 'Yorumlarım',
  '/mesajlarim': 'Müşteri Hizmetleri Mesajlarım',
  '/ayagina-gelsin/sepetim': 'Sepet',
  '/gunun-firsati-teklifi': 'Günün Fırsatları',
  '/hepsiglobal': 'Yurt Dışı Alışveriş (Hepsiglobal)',
  '/kampanyalar': 'Kampanyalar',
  '/girisimci-kadinlar': 'Girişimci Kadınlar',
  '/yardim': 'Yardım & Destek',
  '/hesabim/bize-sorun': 'Bize Sorun',
}

presence.on('UpdateData', async () => {
  const page = document.location.pathname
  const productName = document.querySelector('#product-name')
  const attr = document.querySelector('#offering-price')?.attributes as unknown as {
    [name: string]: HTMLElement
  }
  const price = (document.querySelector('#offering-price') as HTMLElement)
    && attr.content
    && attr.content.textContent !== ''
    ? attr.content.textContent
    : null
  const seller = document.querySelector(
    '#productResult > div > div > div > div.col.lg-1.md-1.sm-1.filter-content > section > div > div.title-wrapper.with-bg.for-desktop.brand > h1',
  ) as HTMLElement
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/H/Hepsiburada/assets/logo.png',
    startTimestamp: Math.floor(Date.now() / 1000),
  }

  if (productName && productName.textContent !== '') {
    presenceData.details = 'Bir ürüne göz atıyor:'
    presenceData.state = `${productName.textContent?.trim()}${
      price ? ` - ${price} TL` : ''
    }`
  }
  else if (pages[page] || pages[page.slice(0, -1)]) {
    presenceData.details = 'Bir sayfaya göz atıyor:'
    presenceData.state = pages[page] || pages[page.slice(0, -1)]
  }
  else if (page.includes('/ara')) {
    presenceData.details = 'Bir şey arıyor:'
    presenceData.state = document.title && document.title.includes(' - Hepsiburada')
      ? document.title.replace(' - Hepsiburada', '')
      : ''
    presenceData.smallImageKey = Assets.Search
  }
  else if (seller && seller.textContent !== '') {
    presenceData.details = 'Bir mağazaya göz atıyor:'
    presenceData.state = seller.textContent?.trim()
  }
  else {
    presenceData.details = 'Bir sayfaya göz atıyor:'
    presenceData.state = 'Ana Sayfa'
  }

  if (presenceData.details && presenceData.state)
    presence.setActivity(presenceData)
})
