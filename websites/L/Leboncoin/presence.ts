import { Assets } from 'premid'

const presence = new Presence({
  clientId: '966800501326876692',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey:
      'https://cdn.rcd.gg/PreMiD/websites/L/Leboncoin/assets/logo.png',
    smallImageKey: Assets.Reading,
    smallImageText: 'Regarde des annonces',
    startTimestamp: browsingTimestamp,
    details: 'Regarde la page :',
  }

  function getAdvertiserName(): string {
    const name = document.querySelector('.ml-lg > a:nth-child(1)')?.textContent ?? ''
    if (name) {
      return name
    }
    else {
      // Pro seller
      let fallbackName = document.querySelector(
        '.styles_wrapperBottom__unGZF > div:nth-child(2) > h2:nth-child(1)',
      )?.textContent ?? ''
      if (!fallbackName) {
        fallbackName = document.querySelector(
          '.styles_wrapperBottom__unGZF > div:nth-child(2) > a:nth-child(1)',
        )?.textContent ?? ''
      }
      return fallbackName || 'Vendeur inconnu'
    }
  }

  function getAdPrice(): string {
    let price = document
      .querySelector(
        'div:nth-child(2) > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > p:nth-child(1)',
      )
      ?.textContent
      ?.trim() ?? ''
    if (!price || !price.includes('€')) {
      price = document
        .querySelector(
          'article > div:nth-child(2) > div:nth-child(3) > div:nth-child(1) > div:nth-child(1) > p:nth-child(1)',
        )
        ?.textContent
        ?.trim() ?? ''
    }
    return price || 'Prix inconnu'
  }

  if (document.location.pathname.includes('/deposer-une-annonce')) {
    presenceData.state = 'Déposer une annonce'
  }
  else if (document.location.pathname.includes('/favorites')) {
    presenceData.state = 'Mes annonces sauvegardées'
  }
  else if (document.location.pathname.includes('/mes-recherches')) {
    presenceData.state = 'Mes recherches sauvegardées'
  }
  else if (document.location.pathname.includes('/mes-annonces')) {
    presenceData.state = 'Mes annonces'
  }
  else if (document.location.pathname.includes('/emploi')) {
    presenceData.state = 'Offres d\'emploi'
  }
  else if (document.location.pathname.includes('/paiement-securise-livraison')) {
    presenceData.state = 'Paiement sécurisé'
  }
  else if (document.location.pathname.includes('/messages')) {
    presenceData.state = 'Messages privés'
  }
  else if (document.location.pathname.includes('/dc')) {
    presenceData.state = 'Informations légales'
  }
  else if (document.location.pathname.includes('/annonces/offres')) {
    presenceData.state = 'Annonces pour toute la France'
  }
  else if (
    document.location.pathname.includes('/compte')
    || document.location.pathname.includes('/account/')
  ) {
    presenceData.state = 'Paramètres du compte'
  }
  else if (
    document.location.pathname.includes('/profil/')
    || document.location.pathname.includes('/profile/')
  ) {
    presenceData.state = `Profil de ${
      document.querySelector('h3.mr-lg')?.textContent ?? 'Inconnu'
    }`
    presenceData.buttons = [
      { label: 'Consulter le profil', url: document.location.href },
    ]
  }
  else if (document.location.pathname.includes('/boutique')) {
    presenceData.state = `Boutique ${
      document.querySelector('h1.mb-md')?.textContent ?? 'Inconnue'
    }`
    presenceData.buttons = [
      { label: 'Consulter la boutique', url: document.location.href },
    ]
  }
  else if (document.location.pathname.includes('/recherche')) {
    presenceData.details = 'Dans les résultats de recherche :'

    const searchTitle = document.querySelector('h1')?.textContent?.trim() ?? ''
    if (!searchTitle) {
      presenceData.state = 'Recherche en cours'
      presence.setActivity(presenceData)
      return
    }

    const searchTitleParts = searchTitle.split('«') || []
    if (searchTitleParts.length > 1) {
      const lastPart = searchTitleParts.pop() ?? ''
      if (!lastPart) {
        presenceData.state = 'Résultats de recherche'
        presence.setActivity(presenceData)
        return
      }
      const searchTerms = lastPart.split('»')[0] ?? ''
      presenceData.state = `Annonces pour «${searchTerms}»`
    }
    else {
      presenceData.state = 'Résultats de recherche'
    }
  }
  else if (
    document.location.pathname.includes('/ad/')
    || document.location.pathname.includes('/vi/')
  ) {
    const titleParts = document.title?.split('-') ?? []
    const title = titleParts.length > 0 ? titleParts[0]?.trim() ?? '' : ''
    presenceData.details = `Annonce ${title}`

    const adsPrice = getAdPrice()
    const advertiserName = getAdvertiserName()

    if (!adsPrice && !advertiserName) {
      presenceData.state = 'Consulte une annonce'
      presence.setActivity(presenceData)
      return
    }

    const contractType = document.querySelector(
      'div.py-lg:nth-child(2) > div:nth-child(1) > div:nth-child(1) > p:nth-child(2)',
    )?.textContent ?? '?'

    const finalPrice = document.location.pathname.includes('/offres_d_emploi/')
      ? `Payé ${adsPrice} ${contractType}` // 'Payé' is used for job offers
      : `Vendu ${adsPrice}` // 'Vendu' is used for other ads

    presenceData.state = `${finalPrice} par ${advertiserName}`
    presenceData.buttons = [
      { label: 'Consulter l\'annonce', url: document.location.href },
    ]
  }
  else if (document.location.pathname === '/') {
    presenceData.state = 'Page d\'accueil'
  }
  else {
    presenceData.details = 'Explore'
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
