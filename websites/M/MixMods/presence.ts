const presence = new Presence({
  clientId: '503557087041683458',
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/M/MixMods/assets/logo.png',
    name: 'MixMods',
  }

  if (document.location.pathname === '/') {
    presenceData.details = 'Na página inicial...'

    presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/M/MixMods/assets/logo.png'
    presenceData.smallImageText = 'www.mixmods.com.br'
  }
  else if (document.location.pathname.match('/search/label')) {
    presenceData.details = 'Visualizando categoria:'
    presenceData.state = decodeURI(
      document.location.href
        .split('/label/')[1]!
        .split('?&max')[0]!
        .split('?&max')[0]!,
    )
  }
  else if (document.location.pathname.startsWith('/p')) {
    switch (document.location.pathname) {
      case '/p/about.html':
        presenceData.details = 'Visualizando:'
        presenceData.state = 'Sobre Nós'

        break
      case '/p/lista-de-crash-e-solucoes.html':
        presenceData.details = 'Visualizando:'
        presenceData.state = 'Lista de Crash'

        break
      case '/p/recomendados.html':
        presenceData.details = 'Visualizando:'
        presenceData.state = 'Recomendados'

        break
      case '/p/disclaimer.html':
        presenceData.details = 'Visualizando:'
        presenceData.state = 'Disclaimer'

        break
    }
  }
  else if (document.querySelectorAll('.label-info.breadcrumbs')[0]) {
    presenceData.details = 'Visualizando um post:'
    presenceData.state = document.querySelectorAll(
      '.post-title.entry-title',
    )[0]?.textContent

    presenceData.smallImageText = `Postado por Junior_Djjr em ${
      document.querySelector('[itemprop=datePublished]')?.textContent
    }`
  }
  else {
    presenceData.details = 'Navegando no site'

    presenceData.state = `Página ${
      document.location.href.split('#')[1]?.split('=')[1]
    }`
  }

  presence.setActivity(presenceData)
})
