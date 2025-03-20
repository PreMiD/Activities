import { Assets } from 'premid'

const presence = new Presence({
  clientId: '463000750193246209',
})

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/s.to/assets/logo.png',
  }

  if (document.location.pathname === '/') {
    presenceData.details = 'Stöbert durch'
    presenceData.state = 'die Startseite'

    presence.setActivity(presenceData)
  }
  else if (document.location.pathname.includes('/serie/stream/')) {
    const nameofserie = document.querySelector(
      '#series > section > div.container.row > div.series-meta.col-md-6-5.col-sm-6.col-xs-12 > div.series-title > h1 > span',
    )
    // Try if Name of Title are visible
    try {
      presenceData.details = `Schaut ${nameofserie?.textContent}`
      presenceData.state = document.querySelector(
        '#wrapper > div.seriesContentBox > div.container.marginBottom > div:nth-child(4) > div.hosterSiteTitle > h2 > span',
      )?.textContent
    }
    catch {
      presenceData.details = 'Schaut'
      presenceData.state = nameofserie?.textContent
    }
    delete presenceData.smallImageText
    presence.setActivity(presenceData)
  }
  else if (document.location.pathname === '/app') {
    presenceData.details = 'Schaut nach'
    presenceData.state = 'Streaming ToGo'
    presenceData.smallImageKey = Assets.Reading
    delete presenceData.smallImageText

    presence.setActivity(presenceData)
  }
  else if (document.location.pathname === '/beliebte-serien') {
    presenceData.details = 'Schaut nach'
    presenceData.state = 'Beliebten Serien'
    presenceData.smallImageKey = Assets.Search
    delete presenceData.smallImageText

    presence.setActivity(presenceData)
  }
  else if (document.location.pathname.includes('/team')) {
    presenceData.details = 'Zählt die Teammitglieder'
    presenceData.smallImageKey = Assets.Reading
    delete presenceData.smallImageText

    presence.setActivity(presenceData)
  }
  else if (document.location.pathname === '/statistics') {
    presenceData.details = 'Informiert sich über S.To'
    presenceData.state = document.querySelector(
      '#wrapper > div.container > div.row > div:nth-child(1) > div.facts.row > div:nth-child(4) > h3',
    )?.textContent
    presenceData.smallImageKey = Assets.Reading
    delete presenceData.smallImageText

    presence.setActivity(presenceData)
  }
  else if (
    document.location.pathname.startsWith('/user/')
    && document.location.pathname.endsWith('/subscribed')
  ) {
    presenceData.details = 'Durchstöbert'
    presenceData.state = document.querySelector(
      '#wrapper > div.container > div.seriesListContainer.row > div.pageTitle45 > h2',
    )?.textContent
    presenceData.smallImageKey = Assets.Reading
    delete presenceData.smallImageText

    presence.setActivity(presenceData)
  }
  else if (
    document.location.pathname.startsWith('/user/')
    && document.location.pathname.endsWith('/watched')
  ) {
    presenceData.details = 'Durchstöbert'
    presenceData.state = document.querySelector(
      '#wrapper > div.container > div.seriesListContainer.row > div.pageTitle45 > h2',
    )?.textContent
    presenceData.smallImageKey = Assets.Reading
    delete presenceData.smallImageText

    presence.setActivity(presenceData)
  }
  else if (
    document.location.pathname.startsWith('/user/')
    && document.location.pathname.endsWith('/watchlist')
  ) {
    presenceData.details = 'Durchstöbert'
    presenceData.state = document.querySelector(
      '#wrapper > div.container > div.seriesListContainer.row > div.pageTitle45 > h2',
    )?.textContent
    presenceData.smallImageKey = Assets.Reading
    delete presenceData.smallImageText

    presence.setActivity(presenceData)
  }
  else if (document.location.pathname === '/info') {
    presenceData.details = 'Sieht...'
    presenceData.state = document.querySelector(
      '#wrapper > div.container > div > div > div.col-lg-12 > div > h2',
    )?.textContent
    presenceData.smallImageKey = Assets.Reading
    delete presenceData.smallImageText

    presence.setActivity(presenceData)
  }
  else if (document.location.pathname.includes('/profil')) {
    presenceData.details = 'Beobachtet ein Profil'
    presenceData.state = document.querySelector(
      '#userDetails > div > div > div.col-lg-6.col-md-6.col-xs-12.col-sm-6 > a > h1',
    )?.textContent
    presenceData.smallImageKey = Assets.Reading
    delete presenceData.smallImageText

    presence.setActivity(presenceData)
  }
  else if (document.location.pathname.includes('/katalog/')) {
    presenceData.details = 'Sucht eine Serie im Katalog'
    presenceData.state = `Serien mit ${
      document.querySelector(
        '#wrapper > div.container.marginBottom > div.pageTitle > h1 > strong',
      )?.textContent
    }`
    presenceData.smallImageKey = Assets.Search
    delete presenceData.smallImageText

    presence.setActivity(presenceData)
  }
  else if (document.location.pathname.includes('/account/subscribed')) {
    presenceData.details = 'Informiert sich über'
    presenceData.state = 'Abonnierte Serien'
    presenceData.smallImageKey = Assets.Reading
    delete presenceData.smallImageText

    presence.setActivity(presenceData)
  }
  else if (document.location.pathname.includes('/account/watchlist')) {
    presenceData.details = 'Informiert sich über'
    presenceData.state = 'Watchlist'
    presenceData.smallImageKey = Assets.Reading
    delete presenceData.smallImageText

    presence.setActivity(presenceData)
  }
  else if (document.location.pathname.includes('/account/watched')) {
    presenceData.details = 'Liest den Log über'
    presenceData.state = 'Zuletzt geschaute Episoden'
    presenceData.smallImageKey = Assets.Reading
    delete presenceData.smallImageText

    presence.setActivity(presenceData)
  }
  else if (document.location.pathname.includes('/news')) {
    presenceData.details = 'Informiert sich über'
    presenceData.state = 'Neuigkeiten von S.To'
    presenceData.smallImageKey = Assets.Reading
    delete presenceData.smallImageText

    presence.setActivity(presenceData)
  }
  else if (document.location.pathname === '/neu') {
    presenceData.details = 'Sucht neue Serien'
    presenceData.state = 'OwO'
    presenceData.smallImageKey = Assets.Search
    delete presenceData.smallImageText

    presence.setActivity(presenceData)
  }
  else if (document.location.pathname.includes('/nachrichten')) {
    presenceData.details = 'Schreibt Nachrichten...'
    presenceData.state = `als ${
      document.querySelector(
        '#wrapper > header > div > div.header-content > nav > div > div.dd > p > a > span.name',
      )?.textContent
    }`
    presenceData.smallImageKey = Assets.Reading
    delete presenceData.smallImageText

    presence.setActivity(presenceData)
  }
  else if (document.location.pathname === '/support') {
    presenceData.details = 'Befindet sich im Support'
    presenceData.state = document.querySelector(
      '#wrapper > div.container.noPadding > div:nth-child(6) > h3',
    )?.textContent
    presenceData.smallImageKey = Assets.Reading
    delete presenceData.smallImageText

    presence.setActivity(presenceData)
  }
  else if (document.location.pathname.includes('/support/frage/')) {
    presenceData.details = 'Liest Fragen...'
    presenceData.state = document.querySelector(
      '#wrapper > div.container > div.row > div.col-lg-8 > section:nth-child(1) > article > h1',
    )?.textContent
    presenceData.smallImageKey = Assets.Reading
    delete presenceData.smallImageText

    presence.setActivity(presenceData)
  }
  else if (document.location.pathname === '/support/fragen') {
    presenceData.details = 'Liest Fragen...'
    presenceData.smallImageKey = Assets.Reading
    delete presenceData.smallImageText

    presence.setActivity(presenceData)
  }
  else if (document.location.pathname.includes('/account/settings')) {
    presenceData.details = 'Ändert die Einstellungen'
    presenceData.state = `Account: ${
      document.querySelector(
        '#wrapper > header > div > div.header-content > nav > div > div.dd > p > a > span.name',
      )?.textContent
    }`
    delete presenceData.smallImageText

    presence.setActivity(presenceData)
  }
  else if (document.location.pathname.includes('/account/support')) {
    presenceData.details = 'Liest Supporttickets'
    presenceData.state = document.querySelector(
      '#wrapper > div.container > div.pageTitle > h1',
    )?.textContent
    delete presenceData.smallImageText

    presence.setActivity(presenceData)
  }
  else if (document.location.pathname === '/account/friendships') {
    presenceData.details = 'Beobachtet'
    presenceData.state = 'die Freundesliste'
    delete presenceData.smallImageText

    presence.setActivity(presenceData)
  }
  else if (document.location.pathname === '/support/anleitung') {
    presenceData.details = 'Liest das Tutorial'
    presenceData.state = 'So viel Text owo'
    delete presenceData.smallImageText

    presence.setActivity(presenceData)
  }
  else if (document.location.pathname.endsWith('/account/statistics')) {
    presenceData.details = 'Betrachtet Statisken...'
    delete presenceData.smallImageText

    presence.setActivity(presenceData)
  }
  else {
    switch (document.location.pathname) {
      case '/registrierung': {
        presenceData.details = 'Registriert sich gerade...'
        presenceData.state = `Vielleicht als ${
          document.querySelector<HTMLInputElement>('#formUsername')?.value
        }`
        delete presenceData.smallImageText

        presence.setActivity(presenceData)

        break
      }
      case '/account': {
        presenceData.details = 'Angemeldet als'
        presenceData.state = document.querySelector(
          '#wrapper > header > div > div.header-content > nav > div > div.dd > p > a > span.name',
        )?.textContent
        delete presenceData.smallImageText

        presence.setActivity(presenceData)

        break
      }
      case '/serienwuensche': {
        presenceData.details = 'Votet für neue Serien'
        presenceData.state = `${
          document.querySelector(
            '#wrapper > div.container > div.row.leaderboardBox > div.col-md-3 > div > strong',
          )?.textContent
        } Serienwünsche`
        delete presenceData.smallImageText

        presence.setActivity(presenceData)

        break
      }
      default:
        if (document.location.pathname.includes('/serien')) {
          presenceData.details = 'Sucht eine neue Serie'
          presenceData.state = document.querySelector<HTMLInputElement>('#serInput')?.value
          presenceData.smallImageKey = Assets.Search
          delete presenceData.smallImageText

          presence.setActivity(presenceData)
        }
        else if (document.location.pathname.includes('/genre/')) {
          presenceData.details = 'Sucht in Genre'
          presenceData.state = document.querySelector(
            '#wrapper > div.container.marginBottom > div.seriesListSection > div.pageTitle.pageCenter.homeTitle > h1',
          )?.textContent
          presenceData.smallImageKey = Assets.Search
          delete presenceData.smallImageText

          presence.setActivity(presenceData)
        }
        else if (document.location.pathname.includes('/random')) {
          presenceData.details = 'Sucht eine random Serie'
          presenceData.smallImageKey = Assets.Search
          presence.setActivity(presenceData)
        }
        else if (document.location.pathname.includes('/search')) {
          presenceData.smallImageKey = Assets.Search
          presenceData.details = 'Sucht...'
          presenceData.state = document.querySelector<HTMLInputElement>('#search')?.value
          delete presenceData.smallImageText

          presence.setActivity(presenceData)
        }
        else {
          presence.setActivity()
        }
    }
  }
})
