const presence = new Presence({
  clientId: '715289275977039987',
})
const browsedTimestamp = Math.floor(Date.now() / 1000)
presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/R/Ralex%20Bot/assets/logo.jpg',
  }
  if (document.location.hostname === 'bot.ralex.xyz') {
    presenceData.startTimestamp = browsedTimestamp
    if (document.location.pathname === '/') {
      presenceData.details = 'Ana sayfayı inceliyor.'
    }
    else if (document.location.pathname.includes('/komutlar')) {
      presenceData.details = 'Komutlara bakıyor.'
    }
    else if (document.location.pathname.includes('/panel')) {
      presenceData.details = 'Panele bakıyor.'
    }
    else if (
      document.location.pathname === '/yonetim'
      || document.location.pathname === '/yonetim/'
    ) {
      presenceData.details = 'Sunucularını inceliyor.'
    }
    else if (
      document.location.pathname.includes('/yonetim/')
      && document.location.pathname.includes('ozel-komutlar')
    ) {
      presenceData.details = 'Bir sunucusunu yönetiyor.'
      presenceData.state = 'Özel komut ayarlarını düzenliyor'
    }
    else if (
      document.location.pathname.includes('/yonetim/')
      && document.location.pathname.includes('twitch')
    ) {
      presenceData.details = 'Bir sunucusunu yönetiyor.'
      presenceData.state = 'Twitch ayarlarını düzenliyor.'
    }
    else if (
      document.location.pathname.includes('/yonetim/')
      && document.location.pathname.includes('youtube')
    ) {
      presenceData.details = 'Bir sunucusunu yönetiyor.'
      presenceData.state = 'Youtube ayarlarını düzenliyor.'
    }
    else if (
      document.location.pathname.includes('/yonetim/')
      && document.location.pathname.includes('hosgeldin-gorusuruz')
    ) {
      presenceData.details = 'Bir sunucusunu yönetiyor.'
      presenceData.state = 'Giriş çıkış ayarlarını düzenliyor.'
    }
    else if (
      document.location.pathname.includes('/yonetim/')
      && document.location.pathname.includes('genel')
    ) {
      presenceData.details = 'Bir sunucusunu yönetiyor.'
      presenceData.state = 'Genel ayarlarını düzenliyor.'
    }
    else if (
      document.location.pathname.includes('/yonetim/')
      && document.location.pathname.includes('filtreler')
    ) {
      presenceData.details = 'Bir sunucusunu yönetiyor.'
      presenceData.state = 'Filtre ayarlarını düzenliyor.'
    }
    else if (
      document.location.pathname.includes('/yonetim/')
      && document.location.pathname.includes('yanitlayicilar')
    ) {
      presenceData.details = 'Bir sunucusunu yönetiyor.'
      presenceData.state = 'Yanıtlayıcı ayarlarını düzenliyor.'
    }
    else if (
      document.location.pathname.includes('/yonetim/')
      && document.location.pathname.includes('engelle')
    ) {
      presenceData.details = 'Bir sunucusunu yönetiyor.'
      presenceData.state = 'Komut ayarlarını düzenliyor'
    }
    else if (
      document.location.pathname.includes('/yonetim/')
      && document.location.pathname.includes('basvuru')
    ) {
      presenceData.details = 'Bir sunucusunu yönetiyor.'
      presenceData.state = 'Başvuru komutunu düzenliyor.'
    }
    else if (
      document.location.pathname.includes('/yonetim/')
      && document.location.pathname.includes('logging')
    ) {
      presenceData.details = 'Bir sunucusunu yönetiyor.'
      presenceData.state = 'Log ayarlarını düzenliyor.'
    }
    else if (
      document.location.pathname.includes('/yonetim/')
      && document.location.pathname !== '/yonetim'
      && document.location.pathname !== '/yonetim/'
      && ![
        'ozel-komutlar',
        'twitch',
        'youtube',
        'hosgeldin-gorusuruz',
        'genel',
        'filtreler',
        'yanitlayicilar',
        'engelle',
        'basvuru',
        'logging',
      ].includes(document.location.pathname)
    ) {
      presenceData.details = 'Bir sunucusunun ayarlarına bakıyor'
    }
    else if (document.location.pathname.includes('/404')) {
      presenceData.details = 'Bilinmeyen bir yerde geziniyor'
    }
    else {
      presenceData.details = 'Gezdiğin sayfayı'
      presenceData.state = 'Ralex evreninde bulamadım ツ'
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
