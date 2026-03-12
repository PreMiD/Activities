const presence = new Presence({
  clientId: '1167431662636912650',
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/M/MonBureauNum%C3%A9rique/assets/logo.png',
  }
  const searchParams = new URLSearchParams(document.location.search)
  const ACTION = searchParams.get('ACTION')

  if (document.location.hostname.split('.')[1] === 'moodle') {
    presenceData.details = 'Regarde un cours'
    presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/M/MonBureauNum%C3%A9rique/assets/0.png'
  }
  else {
    switch (document.location.pathname.split('/')[1]) {
      case 'sg.do':
        switch (document.location.hostname.split('.')[0]) {
          case 'www':
            presenceData.details = 'Regarde la page d\'accueil'
            break
          case 'cas':
            presenceData.details = 'Entrain de se connecter...'
            break
          default:
            switch (searchParams.get('PROC')) {
              case 'MESSAGERIE':
                switch (ACTION) {
                  case 'LISTER_COMMUNICATION':
                    presenceData.details = 'Regarde ses mails'
                    break
                  case 'CONSULTER_COMMUNICATION':
                    presenceData.details = 'Regarde un mail'
                    break
                }
                break
              case 'PARAMETRAGE_GENERAL':
                presenceData.details = 'Regarde ses paramètres'
                break
              case 'REGLES_FILTRAGE':
                presenceData.details = 'Regarde ses règles de filtrage'
                break
              case 'CARNET_ADRESSE':
                presenceData.details = 'Regarde son carnet d\'adresse'
                break
              case 'PAGE_ACCUEIL':
                presenceData.details = 'Regarde la page d\'accueil'
                break
              case 'CLASSEUR_PEDA':
                switch (ACTION) {
                  case 'AFFICHER_ELEVES_ACCUEIL':
                    presenceData.details = 'Regarde son cahier de texte'
                    break
                  case 'AFFICHER_ELEVES_ACCUEIL_CLASSEUR':
                    presenceData.details = 'Regarde son classeur pédagogique'
                    break
                }
                break
              case 'CDT_AFFICHAGE':
                presenceData.details = 'Regarde son emploi du temps'
                break
              case 'TRAVAIL_A_FAIRE':
                presenceData.details = 'Regarde son cahier de texte'
                break
              case 'GESTION_ABSENCES_TUTEUR_ELEVE':
                presenceData.details = 'Regarde ses absences'
                break
              case 'CONSULTER_RELEVE':
                switch (ACTION) {
                  case 'AFFICHER_RELEVE_NOTES_ELEVE':
                    presenceData.details = 'Regarde ses notes'
                    break
                  case 'AFFICHER_RELEVE_COMPETENCES_ELEVE':
                    presenceData.details = 'Regarde ses compétences'
                    break
                }
                break
              case 'CONSULTER_BULLETIN':
                presenceData.details = 'Regarde ses bulletins'
                break
              case 'CDL':
                presenceData.details = 'Regarde son carnet de liaison'
                break
              case 'AGENDAPERSO':
                presenceData.details = 'Regarde son agenda personnel'
                break
              case 'PORTE_DOCUMENT':
                presenceData.details = 'Regarde son porte document'
                break
              case 'GESTION_FAVORIS':
                presenceData.details = 'Regarde ses favoris'
                break
              case 'FICHE_ELEVE':
                presenceData.details = 'Regarde sa fiche élève'
                break
              case 'CONTENUS':
                presenceData.details = 'Regarde ses contributions'
                break
              case 'MEDIACENTRE':
                presenceData.details = 'Regarde le médiacentre'
                break
              default:
                presenceData.details = 'Regarde la page d\'accueil'
            }
        }
        break
      case '':
        presenceData.details = 'Regarde la page d\'accueil'
        break
      case 'classes':
        presenceData.details = 'Regarde son espace de classe'
        break
      default:
        presenceData.details = 'Regarde une page d\'actualité'
    }
  }

  presence.setActivity(presenceData)
})
