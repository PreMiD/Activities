const presence = new Presence({
  clientId: '473155249763385345',
})
const browsingTime = Math.floor(Date.now() / 1000)

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/H/HabboCity/assets/logo.png',
  }
  presenceData.startTimestamp = browsingTime

  if (
    window.location.pathname.toLowerCase() === '/'
    || window.location.pathname.toLowerCase() === '/index'
  ) {
    presenceData.details = 'Accueil'
    presenceData.state = 'Se connecte à HabboCity'
  }

  if (window.location.pathname.toLowerCase() === '/register') {
    presenceData.details = 'Accueil - Inscription'
    presenceData.state = 'S\'inscrit sur HabboCity'
    const registername = (
      window.document.querySelector('#registerusername') as HTMLInputElement
    ).value
    if (registername)
      presenceData.state = `S'inscrit sur HabboCity - ${registername}`
  }

  if (window.location.pathname.toLowerCase() === '/conditions') {
    presenceData.details = 'Conditions'
    presenceData.state = 'Lit les conditions d\'utilisations'
  }

  if (window.location.pathname.toLowerCase() === '/pin') {
    presenceData.details = 'PIN'
    presenceData.state = 'Entre son code PIN'
  }

  if (window.location.pathname.toLowerCase() === '/profil') {
    presenceData.details = `Profil - ${window.document.title.replace(
      'HabboCity:',
      '',
    )}`
    presenceData.state = 'Regarde sa page personnelle'
  }

  if (window.location.pathname.toLowerCase() === '/discord') {
    presenceData.details = 'Discord - CityCOM'
    presenceData.state = 'Rejoins le serveur discord CityCOM'
  }

  if (window.location.pathname.toLowerCase().startsWith('/profil/')) {
    presenceData.details = `Profil - ${window.document.title}`
    presenceData.state = `Regarde le profil de ${window.document.title}`
    if (
      window.document.querySelector('#profil87')
      && window.document.querySelector<HTMLElement>('#profil87')?.style.display
      === 'block'
      && window.document.querySelector('#profil121')
    ) {
      if (
        window.document.querySelector('#profil121')?.textContent
        === 'Mes apparts'
      ) {
        presenceData.state = `Regarde les appartements de ${window.document.title}`
      }
      else if (
        window.document.querySelector('#profil121')?.textContent
        === 'Mes groupes'
      ) {
        presenceData.state = `Regarde les groupes de ${window.document.title}`
      }
    }
  }

  if (window.location.pathname.toLowerCase() === '/hotel') {
    presenceData.details = 'Hôtel'
    presenceData.state = 'Joue sur l\'hôtel'
  }

  if (window.location.pathname.toLowerCase() === '/meet') {
    presenceData.details = 'Meet'
    presenceData.state = 'Regarde les relations les plus populaires de l\'hôtel'
    const meet = (
      window.document.querySelector('#meetSearch') as HTMLInputElement
    ).value
    if (meet !== '') {
      presenceData.details = `Meet - ${meet}`
      presenceData.state = `Regarde les relations de ${meet}`
    }
  }

  if (window.location.pathname.toLowerCase() === '/news') {
    presenceData.details = 'Nouveautés'
    presenceData.state = 'Regarde les dernières nouveautés'
    if (
      window.document.querySelector('#search1')
      && window.document.querySelector<HTMLElement>('#search1')?.style.display
      === 'block'
    ) {
      const search = (
        window.document.querySelector('#search3') as HTMLInputElement
      ).value
      if (search !== '') {
        presenceData.details = 'Nouveautés - Recherche'
        presenceData.state = `Recherche l'article : "${search}"`
      }
    }
  }

  if (window.location.pathname.toLowerCase().startsWith('/news/')) {
    presenceData.details = 'Nouveautés - Article'
    presenceData.state = `Lit l'article : ${window.document.title}`
  }

  if (window.location.pathname.toLowerCase() === '/community/team') {
    presenceData.details = 'Communauté - Équipe'
    presenceData.state = 'Regarde la page équipe'
  }

  if (window.location.pathname.toLowerCase() === '/community/fansites') {
    presenceData.details = 'Communauté - Organisations'
    presenceData.state = 'Regarde la page des organisations'
    if (
      window.document.querySelector('#f37')
      && window.document.querySelector<HTMLElement>('#f37')?.style.display
      === 'block'
    ) {
      presenceData.state = 'Propose son organisation'
      const nameorga = (
        window.document.querySelector('.sfdnom') as HTMLInputElement
      ).value
      if (nameorga !== '')
        presenceData.state = `Propose son organisation - ${nameorga}`
    }
  }

  if (window.location.pathname.toLowerCase() === '/community/fansites/new') {
    presenceData.details = 'Communauté - Organisations'
    presenceData.state = 'Ajoute un article à la page organisations'
    const titlearticle = (
      window.document.querySelector('#arttitre') as HTMLInputElement
    ).value
    if (titlearticle !== '')
      presenceData.state = `Ajoute un article à la page organisations - ${titlearticle}`
  }

  if (window.location.pathname.toLowerCase() === '/organisationteam') {
    presenceData.details = 'Communauté - Collaborateurs'
    presenceData.state = 'Regarde la page des collaborateurs'
  }

  if (window.location.pathname.toLowerCase() === '/prestige/joueurs') {
    presenceData.details = 'Prestige - Joueurs'
    presenceData.state = 'Regarde la page des joueurs prestigieux'
  }

  if (window.location.pathname.toLowerCase() === '/prestige/appartements') {
    presenceData.details = 'Prestige - Appartements'
    presenceData.state = 'Regarde la page des appartements prestigieux'
  }

  if (window.location.pathname.toLowerCase() === '/prestige/gamer') {
    presenceData.details = 'Prestige - Gamers'
    presenceData.state = 'Regarde la page des meilleurs aux animations'
  }

  if (window.location.pathname.toLowerCase() === '/prestige/riches') {
    presenceData.details = 'Prestige - Riches'
    presenceData.state = 'Regarde la page des joueurs les plus riches'
  }

  if (window.location.pathname.toLowerCase() === '/forum') {
    presenceData.details = 'Forum - Accueil'
    presenceData.state = 'Regarde la liste des sujets'
    if (
      window.document.querySelector('#search1')
      && window.document.querySelector<HTMLElement>('#search1')?.style.display
      === 'block'
    ) {
      const search = (
        window.document.querySelector('#search3') as HTMLInputElement
      ).value
      if (search !== '') {
        presenceData.details = 'Forum - Recherche'
        presenceData.state = `Recherche le sujet : "${search}"`
      }
    }
  }

  if (
    window.location.pathname.toLowerCase().startsWith('/forum/')
    && !window.location.pathname.toLowerCase().startsWith('/forum/categorie')
  ) {
    let nbpage = window.location.pathname.toLowerCase().split('/')[3]
    if (!nbpage)
      nbpage = '1'

    presenceData.details = 'Forum - Sujet'
    presenceData.state = `Lit le sujet : ${window.document.title
      .replace('- HabboCity', '')
      .replace(`Page ${nbpage}`, '')} - Page ${nbpage}`
  }

  if (window.location.pathname.toLowerCase().startsWith('/forum/categorie')) {
    presenceData.details = 'Forum - Catégories'
    if (window.document.title === 'Forum de HabboCity') {
      presenceData.state = 'Regarde la liste des sujets'
    }
    else {
      presenceData.state = `Regarde la liste des sujets - ${window.document.title.replace(
        'HabboCity:',
        '',
      )} - Page ${window.location.pathname.toLowerCase().split('/')[4]}`
    }
  }

  if (
    window.location.pathname.toLowerCase().startsWith('/forum/categorie/com/')
  ) {
    presenceData.details = 'Forum - Mes sujets commentés'
    presenceData.state = `Regarde ses sujets commentés - Page ${
      window.location.pathname.toLowerCase().split('/')[4]
    }`
  }

  if (
    window.location.pathname.toLowerCase().startsWith('/forum/categorie/mes/')
  ) {
    presenceData.details = 'Forum - Mes sujets'
    presenceData.state = `Regarde ses sujets - Page ${
      window.location.pathname.toLowerCase().split('/')[4]
    }`
  }

  if (window.location.pathname.toLowerCase() === '/forum/new-sujet') {
    const title = (
      window.document.querySelector('#topictitl') as HTMLInputElement
    ).value
    const category = (
      window.document.querySelector('#topiccategory') as HTMLInputElement
    ).value
    const nbcategory: { [key: string]: string } = {
      1: 'Discussion générale',
      138: 'Débats & sondages',
      4: 'Idées & suggestions',
      8: 'RPG & Sites de fans',
      5: 'Économie & Casinos',
      9: 'Jeux & événements',
      7: 'Artistique',
      137: 'Tutoriels',
      136: 'Aide',
    }
    presenceData.details = 'Forum - Nouveau sujet'
    if (title !== '')
      presenceData.state = `Crée un nouveau sujet dans ${nbcategory[category]} - ${title}`
    else
      presenceData.state = `Crée un nouveau sujet dans ${nbcategory[category]}`
  }

  if (window.location.pathname.toLowerCase() === '/boutique') {
    presenceData.details = 'Boutique - Accueil'
    presenceData.state = 'Parcoure la boutique'
  }

  if (window.location.pathname.toLowerCase() === '/boutique/citycash') {
    presenceData.details = 'Boutique - CityCash'
    presenceData.state = 'Achète des CityCash'
  }

  if (window.location.pathname.toLowerCase() === '/boutique/coffres') {
    presenceData.details = 'Boutique - Coffres'
    presenceData.state = 'Regarde les coffres disponibles'
    if (
      window.document.querySelector<HTMLElement>('#boutiqueload')?.style.display === 'block'
      && window.document.querySelector('#b168')
    ) {
      presenceData.state = 'Achète un coffre'
    }
  }

  if (window.location.pathname.toLowerCase() === '/boutique/bonamigo') {
    presenceData.details = 'Boutique - Bonamigo'
    presenceData.state = 'Joue au Bonamigo'
  }

  if (window.location.pathname.toLowerCase() === '/boutique/badges') {
    presenceData.details = 'Boutique - Badges'
    presenceData.state = 'Regarde les badges disponibles'
  }

  if (window.location.pathname.toLowerCase() === '/boutique/marche') {
    presenceData.details = 'Boutique - Marché'
    presenceData.state = 'Regarde le marché'
  }

  if (window.location.pathname.toLowerCase() === '/boutique/economie') {
    presenceData.details = 'Boutique - Économie'
    presenceData.state = 'Regarde l\'économie'
  }

  if (window.location.pathname.toLowerCase() === '/boutique/citybox') {
    presenceData.details = 'Boutique - Économie'
    presenceData.state = 'Regarde les avantages de la CityBox'
  }

  if (window.location.pathname.toLowerCase() === '/deconnexion') {
    presenceData.details = 'Déconnexion'
    presenceData.state = 'Se déconnecte de HabboCity'
  }

  if (window.location.pathname.toLowerCase() === '/settings') {
    presenceData.details = 'Paramètres'
    presenceData.state = 'Paramètre son compte'
    if (
      window.document.querySelector<HTMLElement>('#settings16')?.style.display === 'block'
      && window.document.querySelector('#settings38')
      && window.document.querySelector('#settings38')?.textContent
      === 'Mon mot de passe'
    ) {
      presenceData.details = 'Paramètres - Mot de passe'
      presenceData.state = 'Modifie son mot de passe'
    }
    if (
      window.document.querySelector<HTMLElement>('#settings16')?.style.display === 'block'
      && window.document.querySelector('#settings38')
      && window.document.querySelector('#settings38')?.textContent
      === 'Mon adresse email'
    ) {
      presenceData.details = 'Paramètres - E-mail'
      presenceData.state = 'Modifie son adresse mail'
    }
    if (
      window.document.querySelector<HTMLElement>('#settings16')?.style.display === 'block'
      && window.document.querySelector('#settings20')
      && window.document.querySelector('#settings20')?.textContent === 'Mes amis'
    ) {
      presenceData.details = 'Paramètres - Amis'
      presenceData.state = 'Gère sa liste d\'amis'
    }
    if (
      window.document.querySelector<HTMLElement>('#settings16')?.style.display === 'block'
      && window.document.querySelector('#settings38')
      && window.document.querySelector('#settings38')?.textContent === 'Code pin'
    ) {
      presenceData.details = 'Paramètres - Code PIN'
      presenceData.state = 'Modifie son code PIN'
    }
  }

  if (
    window.document.querySelector('#cityclub')
    && window.document.querySelector<HTMLElement>('#cityclub')?.style.display
    === 'block'
  ) {
    presenceData.details = 'Boutique - CityClub'
    presenceData.state = 'Adhère au CityClub'
  }

  if (window.location.pathname.toLowerCase().startsWith('/boutique')) {
    if (
      window.document.querySelector('#b101')
      && (window.document.querySelector('#b101') as HTMLInputElement).value !== ''
    ) {
      presenceData.details = 'Boutique - Mon inventaire'
      presenceData.state = `Recherche : ${
        (window.document.querySelector('#b101') as HTMLInputElement).value
      }`
    }
    if (
      window.document.querySelector<HTMLElement>('#boutiqueload')?.style.display === 'block'
      && window.document.querySelector('#b280')
    ) {
      presenceData.details = 'Boutique - Banque'
      presenceData.state = 'Convertit sa monnaie'
    }
    if (
      window.document.querySelector<HTMLElement>('#boutiqueload')?.style.display === 'block'
      && window.document.querySelector('#b104x')
    ) {
      presenceData.details = 'Boutique - Mon inventaire'
      presenceData.state = 'Regarde ses mobiliers'
    }
    if (
      window.document.querySelector<HTMLElement>('#boutiqueload')?.style.display === 'block'
      && window.document.querySelector('#b104')
    ) {
      presenceData.details = 'Boutique - Mon inventaire'
      presenceData.state = 'Regarde ses badges'
    }
    if (
      window.document.querySelector<HTMLElement>('#boutiqueload')?.style.display === 'block'
      && window.document.querySelector('#b106')
      && window.document.querySelector<HTMLElement>('#b106')?.style.display
      === 'block'
    ) {
      presenceData.details = 'Boutique - Mon inventaire'
      presenceData.state = `Vend le badge ${
        document.querySelector('#b110nom')?.textContent
      } - ${(document.querySelector('#b109') as HTMLImageElement).src.replace('https://swf.habbocity.me/c_images/album1584/', '').replace('.gif', '')}`
    }
    if (
      window.document.querySelector<HTMLElement>('#boutiqueload')?.style.display === 'block'
      && window.document.querySelector('#b201')
    ) {
      presenceData.details = 'Boutique - Mon inventaire'
      presenceData.state = 'Regarde son historique'
    }
    if (
      window.document.querySelector<HTMLElement>('#boutiqueload')?.style.display === 'block'
      && window.document.querySelector('#b208')
    ) {
      presenceData.details = 'Boutique - Mon inventaire'
      presenceData.state = 'Regarde ses appartements'
    }
    if (
      window.document.querySelector<HTMLElement>('#boutiqueload')?.style.display === 'block'
      && window.document.querySelector('#b210')
      && window.document.querySelector<HTMLElement>('#b210')?.style.display
      === 'block'
    ) {
      presenceData.details = 'Boutique - Mon inventaire'
      const apparttitle = document.querySelector('#b215')?.textContent
      const sendto = (document.querySelector('#b219') as HTMLInputElement).value
      if (sendto !== '')
        presenceData.state = `Transfère l'appartement "${apparttitle}" à ${sendto}`
      else
        presenceData.state = `Vend l'appartement "${apparttitle}" sur le marché`
    }
  }

  if (
    window.document.querySelector('#fil1')
    && window.document.querySelector<HTMLElement>('#fil1')?.style.right === '0px'
  ) {
    presenceData.details = 'Fil d\'actualité'
    if (window.document.querySelector('#fil36')) {
      if (
        window.document.querySelector('#fil36')?.parentNode?.children[0]?.id
        === 'fil34'
        || window.document.querySelector('#fil36')?.parentNode?.children[0]?.id
        === 'fil35'
      ) {
        if (
          window.document.querySelector('#fil36')?.parentNode?.children[0]?.id
          === 'fil34'
        ) {
          presenceData.state = 'Regarde le fil d\'actualité'
        }

        if (
          window.document.querySelector('#fil36')?.parentNode?.children[0]?.id
          === 'fil35'
        ) {
          presenceData.state = 'Regarde ses notifications'
        }
      }
      else {
        presenceData.state = 'Regarde les nouveautés'
      }
    }
    if (
      window.document.querySelector('#fil25')
      && (window.document.querySelector('#fil25') as HTMLInputElement).value
      !== ''
      && (window.document.querySelector('#fil25') as HTMLInputElement).value
      !== 'écrire quelque chose...'
    ) {
      presenceData.state = `Écrit un Tweet - "${
        (window.document.querySelector('#fil25') as HTMLInputElement).value
      }"`
    }
  }

  if (
    window.document.querySelector('#rydHSG45s')
    && window.document.querySelector<HTMLElement>('#rydHSG45s')?.style.display
    === 'block'
  ) {
    presenceData.details = 'City Stories'
    if (window.document.querySelector('#str4')) {
      presenceData.state = `Regarde la story de ${
        window.document.querySelector('#str4')?.textContent
      }`
    }
  }

  if (
    window.document.querySelector('#rydHSG45si')
    && window.document.querySelector<HTMLElement>('#rydHSG45si')?.style.display
    === 'block'
  ) {
    presenceData.details = 'City Stories - Mes photos'
    presenceData.state = 'Regarde ses photos'
    if (window.document.querySelector('#str46')) {
      presenceData.state = `Édite une photo : "${
        window.document.querySelector('#str46')?.textContent
      }"`
    }
  }

  if (
    window.document.querySelector('#Parrainage')
    && window.document.querySelector<HTMLElement>('#Parrainage')?.style.display
    === 'block'
  ) {
    presenceData.details = 'Parrainage'
    presenceData.state = `Parraine ses amis - https://${
      (window.document.querySelector('#Parrainage-Link') as HTMLInputElement)
        .value
    }`
  }

  if (
    window.document.querySelector('#ai1')
    && window.document.querySelector<HTMLElement>('#ai1')?.style.display === 'block'
  ) {
    const titlehelp = window.document.querySelector('#ai5')
    if (titlehelp) {
      if (titlehelp.textContent === 'Centre d\'aide') {
        presenceData.details = 'Centre d\'aide'
        presenceData.state = 'Parcoure le centre d\'aide'
      }
      if (titlehelp.textContent === 'Service client') {
        presenceData.details = 'Centre d\'aide - Support'
        presenceData.state = 'Contacte le support'
      }
      if (titlehelp.textContent === 'Mon ticket') {
        presenceData.details = 'Centre d\'aide - Mes tickets'
        presenceData.state = 'Regarde ses tickets'
      }
    }
  }

  if (!presenceData.details) {
    presenceData.details = 'Erreur - 404'
    presenceData.state = 'Page introuvable'
    presence.setActivity(presenceData)
  }
  else {
    presence.setActivity(presenceData)
  }
})
