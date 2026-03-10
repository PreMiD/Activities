const presence = new Presence({ clientId: '765221629168582706' })

presence.on('UpdateData', async () => {
  const path: string = document.location.pathname
  const presenceData: PresenceData = {
    largeImageKey: 'https://bartucivas.com.tr/img/bartu-civas.png',
    startTimestamp: Date.now(),
  }
  const baslik = document.querySelector('a.item-title')
  const sayfaBasligi = document.title || "Ana Sayfa"

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
