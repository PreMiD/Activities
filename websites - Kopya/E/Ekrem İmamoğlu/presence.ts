const presence = new Presence({ clientId: '778648674699706410' })

presence.on('UpdateData', async () => {
  const path: string = document.location.pathname
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/E/Ekrem%20%C4%B0mamo%C4%9Flu/assets/logo.jpeg',
    startTimestamp: Date.now(),
  }
  const baslik = document.querySelector('h1.title')

  if (path === '/') {
    presenceData.details = 'Ana Sayfa'
  }
  else if (path.startsWith('/ekrem-imamoglu-kimdir')) {
    presenceData.details = 'Ekrem İmamoğlu Kimdir?'
  }
  else if (path.startsWith('/16-milyon-icin-calisiyoruz')) {
    presenceData.details = '16 Milyon İçin Çalışıyoruz'
  }
  else if (path.startsWith('/basin-icin')) {
    presenceData.details = 'Basın İçin'
  }
  else if (path.startsWith('/haberler')) {
    presenceData.details = 'Haberler'
  }
  else if (path.startsWith('/galeri')) {
    presenceData.details = 'Galeri'
  }
  else if (path.startsWith('/aile-galerisi')) {
    presenceData.details = 'Galeri'
    presenceData.state = 'Aile Galerisi'
  }
  else if (path.startsWith('/imamoglu-ve-siz')) {
    presenceData.details = 'Galeri'
    presenceData.state = 'İmamoğlu ve Siz'
  }
  else if (path.startsWith('/imamoglu-ve-muhtarlar')) {
    presenceData.details = 'Galeri'
    presenceData.state = 'İmamoğlu ve Muhtarlar'
  }
  else if (
    document.location.pathname.split('/')[1] !== ''
    && baslik
    && !path.startsWith('/imamoglu-ve-muhtarlar')
    && !path.startsWith('/imamoglu-ve-siz')
    && !path.startsWith('/aile-galerisi')
    && !path.startsWith('/galeri')
  ) {
    presenceData.details = 'Bir yazı okuyor:'
    presenceData.state = baslik?.textContent
  }

  presence.setActivity(presenceData)
})
