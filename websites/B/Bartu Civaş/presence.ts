const presence = new Presence({ clientId: '1486635213684736061' })

presence.on('UpdateData', async () => {
  const path: string = document.location.pathname
  // Sayfanın dilini veya URL'yi kontrol ederek Türkçe olup olmadığını anlıyoruz
  const isTurkish = document.documentElement.lang.toLowerCase().includes('tr') || path.includes('/anasayfa') || path.includes('/tr')

  const presenceData: PresenceData = {
    largeImageKey: 'https://bartucivas.com.tr/img/bartu-civas.png',
    startTimestamp: Date.now(),
    buttons: [
      {
        label: isTurkish ? 'Websiteyi Ziyaret Et' : 'Visit Website',
        url: document.location.href,
      },
    ],
  }
  const baslik = document.querySelector('.info h4 a')
  const sayfaBasligi = document.title || 'Ana Sayfa'

  if (path === '/') {
    presenceData.details = isTurkish ? 'Ana Sayfa' : 'Home Page'
  }
  else if (path.startsWith('/anasayfa')) {
    presenceData.details = isTurkish ? 'Ana Sayfa' : 'Home Page'
  }
  else if (path.startsWith('/homepage')) {
    presenceData.details = isTurkish ? 'Ana Sayfa' : 'Home Page'
  }
  else if (path.startsWith('/home')) {
    presenceData.details = isTurkish ? 'Ana Sayfa' : 'Home Page'
  }
  else if (path.startsWith('/konu')) {
    presenceData.details = isTurkish ? 'Bir yazı okuyor:' : 'He/She is reading an article:'
    presenceData.state = baslik?.textContent
  }
  else if (
    document.location.pathname.split('/')[1] !== ''
    && baslik
    && !path.startsWith('/anasayfa')
    && !path.startsWith('/homepage')
    && !path.startsWith('/home')
  ) {
    presenceData.details = isTurkish ? 'Sitede geziniyor:' : 'Browsing the site:'
    presenceData.state = sayfaBasligi
  }

  presence.setActivity(presenceData)
})
