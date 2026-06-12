const presence: Presence = new Presence({
  clientId: '1004301145348526090',
})

presence.on('UpdateData', async () => {
  const title = document.title
  const path = window.location.pathname
  const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content')

  const defaultLogo = 'logo'
  let state: string | undefined
  let details: string | undefined
  let largeImageKey: string = defaultLogo
  let smallImageKey: string | undefined
  let smallImageText: string | undefined

  if (path === '/' || path === '/feed') {
    state = 'Ana Sayfada'
    details = 'Akış\'ı inceliyor'
  }
  else if (path.startsWith('/hub/')) {
    const hubName = title.split(' | ')[0] || 'Bir Hub'
    state = 'Hub İnceliyor'
    details = hubName
    if (ogImage) largeImageKey = ogImage
    smallImageKey = defaultLogo
    smallImageText = 'Hangar'
  }
  else if (path.startsWith('/profile/')) {
    state = 'Bir profili'
    details = 'inceliyor'
  }
  else if (path.startsWith('/post/')) {
    state = 'Bir gönderiyi'
    details = 'okuyor'
  }
  else {
    details = 'Hangar\'da Geziniyor'
  }

  presence.setActivity({
    state,
    details,
    largeImageKey,
    largeImageText: 'usehangar.gg',
    smallImageKey,
    smallImageText,
  })
})
