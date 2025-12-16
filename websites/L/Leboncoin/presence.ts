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
      // Individual seller
      let fallbackName = document.querySelector(
        '#aside > section:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > a:nth-child(1)',
      )?.textContent ?? ''
      if (!fallbackName) {
        fallbackName = document.querySelector(
          '.gap-y-md > div:nth-child(2) > a:nth-child(1)',
        )?.textContent ?? ''
      }

      // Pro seller
      if (!fallbackName) {
        fallbackName = document.querySelector(
          '#aside > div:nth-child(1) > section:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > h2:nth-child(1)',
        )?.textContent ?? ''
      }
      if (!fallbackName) {
        fallbackName = document.querySelector(
          '.gap-y-md > div:nth-child(2) > div:nth-child(1) > h2:nth-child(1)',
        )?.textContent ?? ''
      }

      // Company
      if (!fallbackName) {
        fallbackName = document.querySelector(
          'a.break-words',
        )?.textContent ?? ''
      }
      if (!fallbackName) {
        fallbackName = document.querySelector(
          'a.block:nth-child(1)',
        )?.textContent ?? ''
      }

      return fallbackName || 'Vendeur inconnu'
    }
  }

  function getAdPrice(): string {
    const price = document
      .querySelector(
        'p.text-headline-1',
      )
      ?.textContent
      ?.trim()
      .replace(/\s+/g, '') ?? ''
    return price || 'Prix inconnu'
  }

  if (document.location.pathname.includes('/deposer-une-annonce')) {
    presenceData.state = 'Déposer une annonce'
  }
  else if (document.location.pathname.includes('/favorites')) {
    presenceData.state = 'Mes annonces sauvegardées'
  }
  else if (document.location.pathname.includes('/mes-recherches')
    || document.location.pathname.includes('/my-searches')) {
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
      document.querySelector('h1.mr-lg')?.textContent ?? 'Inconnu'
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

    const searchTitle = document.querySelector('h1.mb-lg')?.textContent?.trim() ?? ''
    if (!searchTitle) {
      presenceData.state = 'Recherche en cours'
      presence.setActivity(presenceData)
      return
    }

    const searchTitleParts = searchTitle.split(':')
    const lastPart = searchTitleParts.slice(0, -1).join(':').trim()
    presenceData.state = lastPart
    presence.setActivity(presenceData)
    return
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

    const finalPrice = document.location.pathname.includes('/offres_d_emploi/')
      ? `Payé ${adsPrice}` // 'Payé' is used for job offers
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
