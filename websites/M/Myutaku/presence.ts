const presence = new Presence({
  clientId: '891749178227695678',
})
const path = document.location.pathname
const browsingTimestamp = Math.floor(Date.now() / 1000)
const genre = document.querySelector('#type-media')
const title = document.querySelector(
  '#main-fiche > div.fiche-inside.fiche-top > div.fiche-fr > div.fiche-titre > div.dd-flex',
)
const titleKnownFor = document.querySelector(
  '#app > div.main > div.fiche-inside.fiche-top.fiche-auteur > div:nth-child(2) > div:nth-child(2) > div.subListeHome.edition_manga > div:nth-child(1) > div.hc-info-poster > div.hcip-titre',
)
const menu = document.querySelector(
  '#app > div.main > div.mainMenu > a:nth-child(1)',
)
const user = document.querySelector(
  '#app > div.profil-new > div.aPropos-Pro > div.aPP',
)
const currentUser = document.querySelector(
  'body > div.top > div.top-account > div.ta-main > a > div.ta-nickname',
)
const character = document.querySelector(
  '#app > div.main > div.fiche-inside.fiche-top.fiche-auteur > div:nth-child(2) > div.fiche-titre > div > h1',
)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/M/Myutaku/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  if (path.includes('/home')) {
    presenceData.details = 'Page d\'accueil'
  }
  else if (path.startsWith('/explorer')) {
    presenceData.details = 'Regarde la page :'
    presenceData.state = 'Explorer'
    switch (document.location.search) {
      case '?type=manga':
        presenceData.details = 'Explore les mangas'
        delete presenceData.state
        break
      case '?type=film':
        presenceData.details = 'Explore les films'
        delete presenceData.state
        break
      case '?type=tv':
        presenceData.details = 'Explore les animes'
        delete presenceData.state
        break
      case '?type=oav':
        presenceData.details = 'Explore les OAVs'
        delete presenceData.state
        break
      case '?type=special':
        presenceData.details = 'Explore les animes spéciaux'
        delete presenceData.state
        break
    }
  }
  else if ((genre || menu) && title) {
    presenceData.details = `Regarde la page ${genre?.textContent} de :`
    presenceData.state = title.textContent
  }
  else if (path.includes('/parametre')) {
    presenceData.details = 'Configure ses paramètres'
  }
  else if (path.includes('/feedback/')) {
    presenceData.details = 'Regarde la page :'
    presenceData.state = 'Suggestions'
  }
  else if (path.includes('/@')) {
    presenceData.details = 'Regarde le profil de :'
    presenceData.state = user?.textContent
  }
  else if (path.includes('/collection')) {
    if (
      document.location.search.includes('?')
      && user?.textContent === currentUser?.textContent
    ) {
      switch (document.location.search) {
        case '?manga':
          presenceData.details = 'Regarde sa collection manga'
          break
        case '?film':
          presenceData.details = 'Regarde sa collection film'
          break
        case '?perso':
          presenceData.details = 'Regarde sa collection des personnages favoris'
          break
        case '?biblio':
          presenceData.details = 'Regarde sa bibliothèque'
          break
        default:
          presenceData.details = 'Regarde sa collection d\'anime'
          break
      }
    }
    else {
      switch (document.location.search) {
        case '?manga':
          presenceData.details = 'Regarde la collection manga de :'
          presenceData.state = user?.textContent
          break
        case '?film':
          presenceData.details = 'Regarde la collection film de :'
          presenceData.state = user?.textContent
          break
        case '?perso':
          presenceData.details = 'Regarde la collection des personnages favoris de :'
          presenceData.state = user?.textContent
          break
        case '?biblio':
          presenceData.details = 'Regarde la bibliothèque de :'
          presenceData.state = user?.textContent
          break
        default:
          presenceData.details = 'Regarde la collection d\'anime de :'
          presenceData.state = user?.textContent
          break
      }
    }
  }
  else if (character) {
    presenceData.details = 'Regarde la page du personnage :'
    presenceData.state = `${character.textContent} de ${titleKnownFor?.textContent}`
  }
  else {
    presenceData.details = 'Page d\'accueil'
    presence.info(
      'Si votre statut discord n\'affiche pas bien la presence, n\'hésitez pas à refresh la page',
    )
  }

  presence.setActivity(presenceData)
})
