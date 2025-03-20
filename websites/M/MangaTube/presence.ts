import { Assets } from 'premid'

const presence = new Presence({
  clientId: '770342692462526465',
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/M/MangaTube/assets/logo.png',
  }

  // Startseite
  if (document.location.pathname === '/') {
    presenceData.details = '| Startseite'
  }
  // Serien
  else if (document.location.pathname.includes('/search')) {
    presenceData.details = '| Erweiterte Suche'
  }
  else if (document.location.pathname.includes('/read/')) {
    presenceData.details = document
      .querySelector('head > title')
      ?.textContent
      ?.split('- Kapitel ')
      .toString()
    presenceData.state = `${document
      .querySelector(
        'body > div.blur-content > div > div.reader-navigation > div.container > div.pages-control > div.dropdown.chapter-dropdown > ul > li.active > a',
      )
      ?.textContent
      ?.replace('Seite', 'Kapitel')
      .toString()} | ${document.querySelector('.page-text')?.textContent}`
    presenceData.smallImageKey = Assets.Reading
  }
  else if (document.location.pathname.startsWith('/series/')) {
    presenceData.details = '| Serie'
    presenceData.state = document.querySelector('.series-title')?.textContent
  }
  else if (document.location.pathname.startsWith('/series')) {
    presenceData.details = '| Serien'
  }
  else if (document.location.pathname.includes('/serieslist')) {
    presenceData.details = '| Serienliste';
    [presenceData.state] = document
      .querySelector('head > title')
      ?.textContent
      ?.split('- Manga-Tube') ?? []

    // Community
  }
  else if (document.location.pathname.includes('/team')) {
    presenceData.details = '| Team'
  }
  else if (document.location.pathname.startsWith('/partner')) {
    presenceData.details = '| Partner'
  }
  else if (document.location.pathname.startsWith('/gewinnspiel')) {
    presenceData.details = '| Gewinnspiel';
    [presenceData.state] = document
      .querySelector('head > title')
      ?.textContent
      ?.split(' - Manga-Tube') ?? []
  }
  else if (document.location.pathname.startsWith('/join')) {
    presenceData.details = '| Bewerben'
  }
  else if (document.location.pathname.startsWith('/faq')) {
    presenceData.details = '| FAQ'
  }
  // Profilbar
  else if (document.location.pathname.startsWith('/poll')) {
    if (document.location.pathname.endsWith('/poll/')) {
      presenceData.details = '| Laufende Umfragen'
    }
    else {
      presenceData.details = '| Umfrage'
      presenceData.state = document.querySelector('div.poll-question')?.textContent
    }
  }
  else if (document.location.pathname.includes('/write/')) {
    presenceData.details = '| Postfach'
    presenceData.state = 'Nachricht Verfassen'
  }
  else if (document.location.pathname.includes('/inbox')) {
    if (document.location.pathname.includes('/message/')) {
      presenceData.details = '| Postfach'
      presenceData.state = 'Nachricht'
    }
    else {
      presenceData.details = '| Postfach'
      presenceData.state = 'Übersicht'
    }
  }
  else if (document.location.pathname.includes('/edit')) {
    presenceData.details = '| Profil'
    presenceData.state = 'Bearbteiten'
  }
  else if (document.location.pathname.startsWith('/profile/')) {
    presenceData.details = '| Profil'
    presenceData.state = `${document.querySelector('b')?.textContent} | ${
      document.querySelector('#user_level')?.textContent
    }`
  }
  else if (document.location.pathname.includes('/blog/')) {
    presenceData.details = '| Blog'
    presenceData.state = document.querySelector('h3')?.textContent

    // Datenschutz & Impressum
  }
  else if (document.location.pathname.startsWith('/impressum')) {
    presenceData.details = '| Impressum'
  }
  else if (document.location.pathname.startsWith('/datenschutz')) {
    presenceData.details = '| Datenschutz'
  }
  // Login
  else if (document.location.pathname.startsWith('/login')) {
    presenceData.details = '| Login'
  }

  // setActivity
  presence.setActivity(presenceData)
})
