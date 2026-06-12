const presence: Presence = new Presence({
  clientId: '1004301145348526090',
})

presence.on('UpdateData', async () => {
  const title = document.title
  const path = window.location.pathname
  const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content')

  const defaultLogo = 'logo'
  const presenceData: PresenceData = {
    details: 'Hangar\'da Geziniyor',
    largeImageKey: defaultLogo,
    largeImageText: 'usehangar.gg',
  }

  if (path === '/' || path === '/feed') {
    presenceData.state = 'Ana Sayfada'
    presenceData.details = 'Akış\'ı inceliyor'
  }
  else if (path.startsWith('/hub/')) {
    const hubName = title.split(' | ')[0] || 'Bir Hub'
    presenceData.state = 'Hub İnceliyor'
    presenceData.details = hubName
    if (ogImage) presenceData.largeImageKey = ogImage
    presenceData.smallImageKey = defaultLogo
    presenceData.smallImageText = 'Hangar'
  }
  else if (path.startsWith('/profile/')) {
    presenceData.state = 'Bir profili'
    presenceData.details = 'inceliyor'
  }
  else if (path.startsWith('/post/')) {
    presenceData.state = 'Bir gönderiyi'
    presenceData.details = 'okuyor'
  }

  presence.setActivity(presenceData)
})
