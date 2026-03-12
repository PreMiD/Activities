const presence = new Presence({
  clientId: '670047125656043536',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/A/Aranzulla.it/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  if (document.location.pathname === '/') {
    if (document.location.href.match('/?s=')) {
      presenceData.details = 'In ricerca'
      presenceData.state = `Ha cercato:${document
        .querySelector('head > title')
        ?.textContent
        ?.replace(
          ': Risultati della ricerca | Salvatore Aranzulla',
          '',
        )}`
    }
    else {
      presenceData.details = 'Nella Homepage'
    }
  }
  else if (
    document.location.pathname.startsWith(
      '/informazioni-generali-su-salvatore-aranzulla',
    )
  ) {
    presenceData.details = 'Guarda le Info su'
    presenceData.state = 'Salvatore Aranzulla'
  }
  else if (
    document.location.pathname.startsWith('/libri-di-salvatore-aranzulla')
  ) {
    presenceData.details = 'Guarda i libri scritti da'
    presenceData.state = 'Salvatore Aranzulla'
  }
  else if (document.location.pathname.startsWith('/contatti')) {
    presenceData.details = 'Vuole contattare'
    presenceData.state = 'Salvatore Aranzulla'
  }
  else if (document.location.pathname.startsWith('/pubblicita')) {
    presenceData.details = 'Vuole contattare'
    presenceData.state = 'Salvatore Aranzulla'
  }
  else if (document.location.pathname.startsWith('/lavoro-aranzulla')) {
    presenceData.details = 'Cerca lavoro presso'
    presenceData.state = 'Aranzulla.it'
  }
  else if (document.location.pathname.startsWith('/computer')) {
    presenceData.details = 'Nelle guide sul Computer:'
    presenceData.state = document
      .querySelector('head > title')
      ?.textContent
      ?.replace(' | Salvatore Aranzulla', '')
  }
  else if (document.location.pathname.startsWith('/telefonia')) {
    presenceData.details = 'Nelle guide sulla Telefonia:'
    presenceData.state = document
      .querySelector('head > title')
      ?.textContent
      ?.replace(' | Salvatore Aranzulla', '')
  }
  else if (document.location.pathname.startsWith('/internet')) {
    presenceData.details = 'Nelle guide sull\' Internet:'
    presenceData.state = document
      .querySelector('head > title')
      ?.textContent
      ?.replace(' | Salvatore Aranzulla', '')
  }
  else if (document.location.pathname.startsWith('/page')) {
    presenceData.details = 'In ricerca'
    presenceData.state = `Ha cercato:${
      document
        .querySelector('head > title')
        ?.textContent
        ?.replace(' Risultati della ricerca (', '')
        ?.split('pagina')[0]
    }`
  }
  else {
    presenceData.details = 'Guarda la guida:'
    presenceData.state = document
      .querySelector('head > title')
      ?.textContent
      ?.replace(' | Salvatore Aranzulla', '')
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
