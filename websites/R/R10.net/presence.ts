const presence = new Presence({ clientId: '650497315391537153' })
const pages: { [key: string]: string } = {
  '/kontrolpaneli': 'Üye Kontrol Paneli',
  '/groups': 'Sosyal Gruplar',
  '/members/albums.html': 'Albümler',
  '/profil/arkadaslistesi/': 'Arkadaş Listesi',
  '/profil/imzadegistir/': 'İmza Değiştirme',
  '/profil/duzenle': 'Profiliniz Düzenliyor',
  '/profil/seceneklerim/': 'Seçenekleri Düzenliyor',
  '/online.php': 'Kimler Online',
  '/r10likelist.php': 'R10 Like Listesi',
  '/uzmanara.php': 'Uzman Ara',
  '/site-analiz/': 'Site Analiz',
  '/seo-analiz/': 'SEO Analiz',
  '/sira-bulucu/': 'Sıra Bulucu',
  '/whois/': 'WHOIS Sorgulama',
  '/itrader_main.php': 'Ticaret Bölümü',
  '/search.php': 'Arama',
  '/pm/': 'Özel Mesajlar',
}

presence.on('UpdateData', async () => {
  const page = document.location.pathname
  const kategori = document.querySelector(
    'body > main > div > div.threadList > div > ul > li:nth-child(1)',
  )
  const post = document.querySelector(
    'body > main > div > div.pagination > div.left.double > a.rbtn.rgreen > span:nth-child(2)',
  )
  const cevap = document.querySelector(
    'body > main > div > form > div:nth-child(12) > div.head',
  )
  const analiz = document.querySelector(
    'body > div.page-header.r10title > div > div > h4 > span',
  )
  const report = document.querySelector(
    'body > main > div > form > div > div.head',
  )
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/R/R10.net/assets/logo.png',
    startTimestamp: Math.floor(Date.now() / 1000),
  }

  if (kategori && kategori.textContent !== '') {
    presenceData.details = 'Bir kategoriyi inceliyor:'
    presenceData.state = document.querySelector(
      'body > main > div > div.breadCrumb > div.top > div.left > div:nth-child(2) > span:nth-child(1) > h2',
    )?.textContent
  }
  else if (post && post.textContent !== '') {
    presenceData.details = 'Bir konuyu inceliyor:'
    presenceData.state = document.querySelector(
      'body > main > div > div.breadCrumb > div.top > div.left > div:nth-child(2) > span > h2',
    )?.textContent
  }
  else if (
    document
      .querySelector('head > title')
      ?.textContent
      ?.includes('Profil bilgileri:')
  ) {
    presenceData.details = 'Bir kullanıcıyı inceliyor:'
    presenceData.state = document.querySelector(
      'body > main > div.container > div.left > div:nth-child(1) > div > div.top > div.info > div.name > a',
    )?.textContent
  }
  else if (cevap && cevap.textContent !== '') {
    presenceData.details = 'Bir konuya cevap yazıyor:'
    presenceData.state = document.querySelector(
      'body > main > div > div.breadCrumb > div.bottom > ul > li:nth-child(4) > a > span',
    )?.textContent
  }
  else if (
    analiz
    && analiz.textContent === 'R10.net - Webmaster & SEO Araçları'
  ) {
    presenceData.details = 'Forumda geziniyor:'
    presenceData.state = 'Webmaster & SEO Araçları'
  }
  else if (report && report.textContent === 'Mesajı Moderatöre Bildir') {
    presenceData.details = 'Bir konuyu moderatöre bildiriyor:'
    presenceData.state = document.querySelector(
      'body > main > div > div.breadCrumb > div.bottom > ul > li:nth-child(4) > a > span',
    )?.textContent
  }
  else if (pages[page] || pages[page.slice(0, -1)]) {
    presenceData.details = 'Forumda geziniyor:'
    presenceData.state = pages[page] || pages[page.slice(0, -1)]
  }
  else {
    presenceData.details = 'Forumda geziniyor:'
    presenceData.state = 'Ana Sayfa'
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
