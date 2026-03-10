const presence = new Presence({ clientId: '765221629168582706' })

presence.on('UpdateData', async () => {
  const path: string = document.location.pathname
  // Sayfanın dilini veya URL'yi kontrol ederek İngilizce olup olmadığını anlıyoruz
  const isEnglish = document.documentElement.lang.toLowerCase().includes('en') || path.includes('/home') || path.includes('/en')

  const presenceData: PresenceData = {
    largeImageKey: 'https://bartucivas.com.tr/img/bartu-civas.png',
    startTimestamp: Date.now(),
    buttons: [
      {
        label: isEnglish ? 'Visit Website' : 'Websiteyi Ziyaret Et',
        url: document.location.href,
      },
    ],
  }
  const baslik = document.querySelector('.info h4 a')
  const sayfaBasligi = document.title || 'Ana Sayfa'

  if (path === '/') {
    presenceData.details = 'Ana Sayfa'
  }
  else if (path.startsWith('/anasayfa')) {
    presenceData.details = 'Ana Sayfa'
  }
  else if (path.startsWith('/homepage')) {
    presenceData.details = 'Ana Sayfa'
  }
  else if (path.startsWith('/home')) {
    presenceData.details = 'Ana Sayfa'
  }
  else if (path.startsWith('/konu')) {
    presenceData.details = 'Bir yazı okuyor:'
    presenceData.state = baslik?.textContent
  }
  else if (
    document.location.pathname.split('/')[1] !== ''
    && baslik
    && !path.startsWith('/anasayfa')
    && !path.startsWith('/homepage')
    && !path.startsWith('/home')
  ) {
    presenceData.details = 'Sitede geziniyor:'
    presenceData.state = sayfaBasligi
  }

  presence.setActivity(presenceData)
})
