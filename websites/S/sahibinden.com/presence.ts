import { Assets } from 'premid'

const presence = new Presence({
  clientId: '643777046731816962',
})
const pages: { [key: string]: string } = {
  '/giris': 'Giriş',
  '/kayit': 'Kayıt',
  '/ilanlarim': 'İlanlarım',
  '/ilanlarim/pasif': 'Yayında Olmayan İlanlarım',
  '/ekspertiz-satin-al': 'Ekspertiz Firması Bul',
  '/ekspertiz-islemlerim': 'Ekspertiz İşlemlerim',
  '/ekspertiz-raporlarim': 'Ekspertiz Raporlarım',
  '/get': 'Güvenli e-Ticaret',
  '/mevcut-siparislerim': 'Siparişlerim',
  '/iade-islemlerim': 'İade İşlemlerim',
  '/tamamlananlar': 'Tamamlanan Siparişlerim',
  '/mesafeli-satis-sozlesmelerim/alis': 'Mesafeli Satış Sözleşmelerim',
  '/satistaki-urunlerim': 'Satıştaki Ürünlerim',
  '/kargolayacaklarim': 'Kargolayacaklarım',
  '/alicidan-onay-beklediklerim': 'Alıcıdan Onay Beklediklerim',
  '/basarili-satislarim': 'Başarılı Satışlarım',
  '/iade-edilenler': 'İade Edilenler',
  '/satista-olmayan-urunlerim': 'Satışta Olmayan Ürünlerim',
  '/banka-bilgilerim': 'Banka Bilgilerim',
  '/kolay-alisveris-profillerim': 'Kayıtlı Kredi Kartlarım',
  '/hesap-hareketlerim': 'Hesap Hareketlerim',
  '/kullanici-engelle': 'Engellenen Kullanıcılar',
  '/listeleme-urunlerim': 'Listeleme Ürünlerim',
  '/izinlerim/bildirimler': 'Bildirim İzinlerim',
  '/izinlerim/iletisim': 'İletişim İzinlerim',
  '/izinlerim/okundu-bilgisi': 'Mesaj Okundu Bilgisi',
  '/merkez-adres': 'Merkez Adresim',
  '/mesafeli-satis-sozlesmelerim/satis': 'Mesafeli Satış Sözleşmelerim (Satış)',
  '/adreslerim': 'Adreslerim',
  '/yorum-yonetimi': 'Yorum Yönetimi',
  '/kurumsal/hakkimizda': 'Hakkımızda',
  '/kurumsal/sayilarla-sahibinden': 'Hakkımızda',
  '/kurumsal/aksoy-grup': 'Hakkımızda',
  '/kurumsal/reklam-filmleri': 'Reklam Filmleri',
  '/kurumsal/iletisim': 'İletişim',
  '/doping-tanitim': 'sahibinden.com Doping',
  '/toplu-urun-girisi': 'Toplu Ürün Girişi',
  '/reklam': 'Reklam',
  '/sahibinden-dogal-reklam': 'sahibinden Doğal Reklam',
  '/mobil': 'Mobil Uygulama',
  '/magazam': 'Mağazam',
  '/magaza-kategori-secimi': 'Mağaza Kategori Seçimi',
  '/neden-magaza': 'Neden Mağaza?',
  '/magaza-fiyatlari': 'Mağaza Fiyatları',
  '/emlakofisim': 'Emlak Ofisim',
  '/galerim': 'Galerim',
  '/guvenli-alisverisin-ipuclari': 'Güvenli Alışverişin İpuçları',
  '/sozlesmeler': 'Sözleşmeler',
  '/sozlesmeler/bireysel-uyelik-sozlesmesi-0': 'Bireysel Üyelik Sözleşmesi',
  '/sozlesmeler/kullanim-kosullari-35': 'Kullanım Koşulları',
  '/site-haritasi': 'Site Haritası',
  '/sozlesmeler/kisisel-verilerin-korunmasi-58': 'Kişisel Verilerin Korunması',
  '/mesajlarim': 'Mesajlarım',
  '/get/mesajlarim': 'GET Mesajlarım',
  '/bilgilendirmeler': 'Bilgilendirmeler',
  '/urun-ve-hizmetlerimiz': 'Ürün ve Hizmetlerimiz',
  '/hasar-sorgu': 'Hasar Sorgu',
  '/arac-detay-sorgu': 'Araç Detay Sorgu',
  '/gecmis-sorgularim': 'Geçmiş Sorgularım',
  '/urun-ve-hizmetlerimiz/arac-sigorta-teklifleri': 'Araç Sigortası Teklifleri',
  '/urun-ve-hizmetlerimiz/ekspertiz-hizmeti': 'Ekspertiz Hizmeti',
  '/urun-ve-hizmetlerimiz/emlak-endeksi': 'Emlak Endeksi',
  '/favori-ilanlar': 'Favori İlanlarım',
  '/favori-aramalarim': 'Favori Aramalarım',
  '/favori-saticilarim': 'Favori Satıcılarım',
  '/en': 'English Homepage',
}

presence.on('UpdateData', async () => {
  const page = document.location.pathname
  const searchingFor = document.querySelector(
    '#searchResultsSearchForm > div > div.searchResultsRight > div.relativeContainer > div.infoSearchResults > div > div.result-text > h1 > span',
  )
  || document.querySelector(
    '#wideContainer > div > div.results-header > h1 > strong > b',
  )
  const category = document.querySelector(
    '#container > div.top-menu-container.clearfix.custom-category-container > div.top-menu-left > div > div.uiInlineBoxTitle > h1',
  )
  || document.querySelector(
    '#searchContainer > div.searchResultsPage.uiContent > div.specialCatHeaders > div > h1',
  )
  || document.querySelector(
    '#container > div > div.categoryPageLeft > div:nth-child(1) > div.uiInlineBoxTitle > h1',
  )

  if (
    page.includes('/kategori/')
    || (category && category.textContent !== '')
  ) {
    presence.setActivity({
      largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/sahibinden.com/assets/logo.png',
      details: 'Bir kategoriye göz atıyor:',
      state: category?.textContent?.trim() || 'Belirsiz',
      startTimestamp: Math.floor(Date.now() / 1000),
    })
  }
  else if (
    page.includes('/kelime-ile-arama')
    || (searchingFor && searchingFor.textContent !== '')
  ) {
    presence.setActivity({
      largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/sahibinden.com/assets/logo.png',
      details: 'Bir şey arıyor:',
      state: searchingFor && searchingFor.textContent
        ? searchingFor.textContent
        : 'Belirsiz',
      smallImageKey: Assets.Search,
      startTimestamp: Math.floor(Date.now() / 1000),
    })
  }
  else if (page.includes('/ilan/')) {
    const stuff = document.querySelector(
      '#classifiedDetail > div.classifiedDetail > div.classifiedDetailTitle > h1',
    )
    const price = document.querySelector(
      '#classifiedDetail > div.classifiedDetail > div.classifiedDetailContent > div.classifiedInfo > h3',
    )

    presence.setActivity({
      largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/sahibinden.com/assets/logo.png',
      details: 'Bir ilana göz atıyor:',
      state: stuff && stuff.textContent
        ? `${stuff.textContent.trim()} ${
          price && price.textContent
            ? `(${price.textContent.trim().split(' ')[0]} TL)`
            : ''
        }`
        : 'Belirsiz',
      startTimestamp: Math.floor(Date.now() / 1000),
    })
  }
  else if (pages[page] || pages[page.slice(0, -1)]) {
    presence.setActivity({
      largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/sahibinden.com/assets/logo.png',
      details: 'Bir sayfaya göz atıyor:',
      state: pages[page] || pages[page.slice(0, -1)],
      startTimestamp: Math.floor(Date.now() / 1000),
    })
  }
  else if (
    document.location.hostname === 'banaozel.sahibinden.com'
    && document.location.pathname === '/'
  ) {
    presence.setActivity({
      largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/sahibinden.com/assets/logo.png',
      details: 'Bir sayfaya göz atıyor:',
      state: 'Bana Özel',
      startTimestamp: Math.floor(Date.now() / 1000),
    })
  }
  else {
    presence.setActivity({
      largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/sahibinden.com/assets/logo.png',
      details: 'Bir sayfaya göz atıyor:',
      state: 'Ana Sayfa',
      startTimestamp: Math.floor(Date.now() / 1000),
    })
  }
})
