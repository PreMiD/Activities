const presence = new Presence({ clientId: '658192386899312651' })
const browsingTimestamp = Math.floor(Date.now() / 1000)
const presenceData: PresenceData = {
  largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/T/Teknobuk/assets/logo.png',
  startTimestamp: browsingTimestamp,
}

function makeRPC(title: string, category: string): void {
  switch (category) {
    case 'kategori': {
      presenceData.details = 'Bir kategoriye göz atıyor:'
      presenceData.state = title

      break
    }
    case 'etiket': {
      presenceData.details = 'Bir etikete göz atıyor:'
      presenceData.state = title

      break
    }
    case 'author': {
      presenceData.details = 'Bir yazara göz atıyor:'
      presenceData.state = title

      break
    }
  }
}

presence.on('UpdateData', () => {
  const page = document.location.pathname

  // Homepage
  if (page.length <= 1 || page.startsWith('/page')) {
    presenceData.details = 'Ana Sayfa'
    presenceData.state = 'Haberlere göz atıyor...'
  }

  // Reading an article
  if (
    document.querySelector('#content > div:nth-child(2) > article > div > h1')
      ?.textContent
  ) {
    presenceData.details = 'Bir haber okuyor...'
    presenceData.state = document.querySelector(
      '#content > div:nth-child(2) > article > div > h1',
    )?.textContent
  }

  if (page.startsWith('/kategori') && page !== '/kategori') {
    const category = document.querySelector(
      '#content > div.page-title.hu-pad.group > h1 > span',
    )?.textContent ?? 'Bilinmeyen'
    makeRPC(category, 'kategori')
  }

  if (page.startsWith('/etiket') && page !== '/etiket') {
    const category = document.querySelector('#blog-entries > header > h1')
      ? document
          .querySelector('#blog-entries > header > h1')
          ?.textContent
          ?.substring(8)
      : 'Bilinmeyen'
    makeRPC(`${category?.charAt(0).toUpperCase()}${category?.substring(1)}`, 'etiket')
  }

  if (page.startsWith('/yazar')) {
    makeRPC(
      document.querySelector(
        '#content > div.page-title.hu-pad.group > h1 > span',
      )?.textContent ?? 'Bilinmeyen',
      'author',
    )
  }

  if (new URLSearchParams(window.location.search).get('s')) {
    presenceData.details = 'Arama sonuçları:'
    presenceData.state = new URLSearchParams(window.location.search).get('s')
  }

  if (page.startsWith('/ara'))
    presenceData.details = 'Arama bölümünde...'

  if (
    ['/kunye', '/iletisim', '/gizlilik-politikasi'].some(pac =>
      page.startsWith(pac),
    )
  ) {
    if (
      !document.querySelector('#content > div.page-title.hu-pad.group > h1')
        ?.textContent
    ) {
      return
    }
    presenceData.details = 'Bir sayfaya göz atıyor...'
    presenceData.state = document.querySelector(
      '#content > div.page-title.hu-pad.group > h1',
    )?.textContent
  }

  if (!presenceData.details) {
    presence.setActivity({
      largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/T/Teknobuk/assets/logo.png',
      details: 'Bilinmeyen bir sayfada...',
    })
  }
  else {
    presence.setActivity(presenceData)
  }
})
