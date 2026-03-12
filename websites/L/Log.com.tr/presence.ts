const presence = new Presence({
  clientId: '657615662537244673',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
const presenceData: PresenceData = {
  largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/L/Log.com.tr/assets/logo.png',
  startTimestamp: browsingTimestamp,
}

function makeCategoryRPC(title: string): void {
  presenceData.details = 'Bir kategoriye göz atıyor:'
  presenceData.state = title
}

presence.on('UpdateData', () => {
  const page = document.location.pathname

  if (page.length === 1) {
    presenceData.details = 'Ana Sayfa'
    presenceData.state = 'Haberlere göz atıyor...'
  }

  if (document.querySelectorAll('.entry-title').length > 0) {
    // Reading an article
    const [title] = document.querySelectorAll('.entry-title')
    presenceData.details = 'Bir haber okuyor...'
    presenceData.state = title
      ? title.textContent?.replace('[İzle]', '')
      : 'Bilinmeyen'
  }

  if (page.startsWith('/author')) {
    presenceData.details = 'Bir yazara göz atıyor...'
    presenceData.state = document.querySelector(
      'body > div.container > div.grid12.first.breadcrumbs.borderTop.borderBottom.marginBottom.padding > h1',
    )?.textContent
  }

  if (page.includes('/page')) {
    presenceData.details = 'Ana Sayfa'
    presenceData.state = `Sayfa: ${Number.parseInt(
      document.location.pathname.split('/')[2]!,
    )}`
  }
  if (page.includes('/asfalt'))
    makeCategoryRPC('Asfalt')
  if (page.includes('/teknoloji-haberleri'))
    makeCategoryRPC('Teknoloji')
  if (page.includes('/radar'))
    makeCategoryRPC('Radar')
  if (page.includes('/play'))
    makeCategoryRPC('Play')
  if (page.includes('/dosya-konusu'))
    makeCategoryRPC('Dosya')
  if (page.includes('/uygulama-rehberi'))
    makeCategoryRPC('Uygulama Rehberi')
  if (page.includes('/nasil-yapilir'))
    makeCategoryRPC('Nasıl yapılır?')
  if (page.includes('/test'))
    makeCategoryRPC('Test')
  if (page.includes('/etiket')) {
    const tag = document.querySelector(
      'body > div.container > div.grid12.first.breadcrumbs.borderTop.borderBottom.marginBottom.padding > h1',
    )
    presenceData.details = 'Bir etiket görüntülüyor:'
    presenceData.state = tag ? tag.textContent : 'Bilinmeyen'
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
