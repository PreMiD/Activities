const presence = new Presence({
  clientId: '503557087041683458',
})

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/C/CodAre/assets/logo.png',
    name: 'CodAre',
  }
  const searchURL = new URL(document.location.href)
  const searchResult = searchURL.searchParams.get('q')
  const searchCategory = searchURL.searchParams.get('k')
  if (window.location.pathname.toLowerCase() === '/') {
    presenceData.details = 'Bir sayfa görüntülüyor:'
    presenceData.state = 'Anasayfa'
  }
  else if (window.location.pathname.toLowerCase() === '/yetkililer') {
    presenceData.details = 'Bir sayfa görüntülüyor:'
    presenceData.state = 'Yetkililer'
  }
  else if (window.location.pathname.toLowerCase() === '/sss') {
    presenceData.details = 'Bir sayfa görüntülüyor:'
    presenceData.state = 'Sıkça Sorulan Sorular (S.S.S)'
  }
  else if (window.location.pathname.toLowerCase() === '/v11tov12') {
    presenceData.details = 'Bir sayfa görüntülüyor:'
    presenceData.state = 'v11 To v12'
  }
  else if (window.location.pathname.toLowerCase().includes('/profil')) {
    presenceData.details = 'Bir kullanıcı profili görüntülüyor:'
    presenceData.state = `${
      document.querySelector(
        '#page-top > div.container-fluid > div > div.col-lg-4 > div > div > div > a',
      )?.textContent
    } `
    + `(${
      document.querySelector(
        '#page-top > div.container-fluid > div > div.col > div > div.card-body > h4:nth-child(4) > span',
      )?.textContent
    })`
  }
  else if (document.location.pathname.toLowerCase().includes('/arama')) {
    presenceData.details = 'Bir kod arıyor:'
    if (!searchCategory) {
      presenceData.state = searchResult!.charAt(0).toUpperCase()
        + searchResult!.slice(1).toLocaleString()
    }
    else {
      presenceData.state = `${searchCategory
        .replace('html', 'HTML')
        .replace('jsplus', 'Javascript+')
        .replace('diger', 'Diğer')
        .replace('altyapi', 'Altyapı')
        .replace('booster', 'Booster')
        .replace('py', 'PYTHON')
        .replace('js', 'Javascript')} adlı kategoride`
        + ` ${searchResult!.charAt(0).toUpperCase()}${searchResult!
          .slice(1)
          .toLocaleString()} adlı kodu arıyor`
    }
  }
  else if (window.location.pathname.toLowerCase().includes('/uptime')) {
    presenceData.details = 'Bir sayfa görüntülüyor:'
    presenceData.state = 'Uptime'
  }
  else if (window.location.pathname.toLowerCase().includes('/kod')) {
    presenceData.details = 'Bir kod görüntülüyor:'
    presenceData.state = document.querySelector(
      '#page-top > div.container-fluid > div > div > div.card.shadow.mb-4 > div.card-header > center > h4',
    )?.textContent
  }
  else if (window.location.pathname.toLowerCase() === '/admin/paylas') {
    presenceData.details = 'Bir admin sayfası görüntülüyor:'
    presenceData.state = 'Paylaş'
  }
  else if (window.location.pathname.toLowerCase() === '/admin/kodlar') {
    presenceData.details = 'Bir admin sayfası görüntülüyor:'
    presenceData.state = 'Kodlar'
  }
  else if (window.location.pathname.toLowerCase() === '/admin/yorumlar') {
    presenceData.details = 'Bir admin sayfası görüntülüyor:'
    presenceData.state = 'Yorumlar'
  }
  else if (window.location.pathname.toLowerCase() === '/kategori/js') {
    presenceData.details = 'Bir kategori görüntülüyor:'
    presenceData.state = 'Javascript'
  }
  else if (window.location.pathname.toLowerCase() === '/kategori/py') {
    presenceData.details = 'Bir kategori görüntülüyor:'
    presenceData.state = 'Python'
  }
  else if (window.location.pathname.toLowerCase() === '/kategori/html') {
    presenceData.details = 'Bir kategori görüntülüyor:'
    presenceData.state = 'HTML'
  }
  else if (window.location.pathname.toLowerCase() === '/kategori/diger') {
    presenceData.details = 'Bir kategori görüntülüyor:'
    presenceData.state = 'Diğer'
  }
  else if (window.location.pathname.toLowerCase() === '/kategori/js+') {
    presenceData.details = 'Bir kategori görüntülüyor:'
    presenceData.state = 'Javascript+'
  }
  else if (window.location.pathname.toLowerCase() === '/kategori/booster') {
    presenceData.details = 'Bir kategori görüntülüyor:'
    presenceData.state = 'Booster'
  }
  else if (window.location.pathname.toLowerCase() === '/kategori/altyapi') {
    presenceData.details = 'Bir kategori görüntülüyor:'
    presenceData.state = 'Altyapı'
  }
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
