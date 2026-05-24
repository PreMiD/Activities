const presence = new Presence({
  clientId: '1344306431913885727',
})

const browsingTimestamp = Date.now()

presence.on('UpdateData', () => {
  const { pathname, hash } = document.location

  const presenceData: PresenceData = {
    largeImageKey: 'https://i.imgur.com/DZb1KAE.jpeg',
    startTimestamp: browsingTimestamp,
  }

  if (pathname === '/' || pathname === '') {
    if (hash) {
      const routeName = decodeURIComponent(hash.substring(1))
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')

      presenceData.details = `Lendo sobre ${routeName} nas rotas`
    }
    else {
      presenceData.details = 'Vendo a página inicial'
    }
  }
  else if (pathname.startsWith('/profile/')) {
    presenceData.details = 'Visualizando um perfil'
  }
  else {
    presenceData.details = `Usando a rota "${pathname}" da api`
  }

  if (presenceData.details) {
    presence.setActivity(presenceData)
  }
  else {
    presence.clearActivity()
  }
})
