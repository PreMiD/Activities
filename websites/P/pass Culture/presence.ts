const presence = new Presence({
  clientId: '503557087041683458',
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/P/pass%20Culture/assets/logo.png',
    name: 'pass Culture',
  }
  const path = document.location.pathname.split('/')
  const showCounts = await presence.getSetting<boolean>('show_counts')

  switch (path[1]) {
    case 'questionnaire-pratiques-initiales':
      presenceData.details = 'En train de faire le questionnaire'
      break
    case 'accueil':
      presenceData.details = 'Regarde la page d\'accueil'
      break
    case 'accueil-thematique': {
      presenceData.details = 'Regarde la page d\'accueil'

      const offersType = document.querySelector<HTMLHeadingElement>(
        '[data-testid="ThematicHome"] [data-testid="homeBodyScrollView"] h1',
      )?.textContent
      if (offersType)
        presenceData.state = offersType
      break
    }
    case 'profil':
      presenceData.details = 'Regarde son profil'
      break
    case 'recherche': {
      presenceData.details = 'Recherche :'

      const query = document.querySelector<HTMLInputElement>('input[type=search]')?.value
      const results = Number.parseInt(document.title)
      if (query && !Number.isNaN(results))
        presenceData.state = `${query} (${results} résultats)`
      break
    }
    case 'reservations': {
      const reservationsCount = document.querySelector<HTMLHeadingElement>(
        '[data-testid="OnGoingBookingsList"] h2',
      )?.textContent

      presenceData.details = 'Regarde ses réservations'
      if (reservationsCount && showCounts)
        presenceData.state = reservationsCount
      break
    }
    case 'reservations-terminees': {
      const doneReservationsCount = document.querySelector<HTMLHeadingElement>(
        '[data-testid="EndedBookings"] h2',
      )?.textContent

      presenceData.details = 'Regarde ses réservations terminées'
      if (doneReservationsCount && showCounts)
        presenceData.state = doneReservationsCount
      break
    }
    case 'reservation': {
      presenceData.details = 'Regarde une réservation'

      const reservation = document.querySelector<HTMLHeadingElement>(
        '[data-testid="BookingDetailsScrollView"] h1',
      )?.textContent
      const reservationPrice = document
        .querySelector<HTMLSpanElement>(
          '[data-testid="BookingDetailsScrollView"] button span',
        )
        ?.textContent
        ?.trim()
      const offerLink = document
        .querySelector<HTMLAnchorElement>(
          'a[data-testid="Voir le détail de l’offre"]',
        )
        ?.getAttribute('href')
      if (reservation && reservationPrice) {
        presenceData.state = `${reservation} (${reservationPrice})`
        presenceData.buttons = [
          {
            label: 'Voir l\'offre',
            url: `${document.location.protocol}//${document.location.hostname}${
              offerLink?.split('?')[0]
            }`,
          },
        ]
      }
      break
    }
    case 'favoris': {
      presenceData.details = 'Regarde ses favoris'

      const favoritesCount = document.querySelector(
        '[data-testid="favoritesResultsFlatlist"] h2',
      )?.textContent
      if (favoritesCount && showCounts)
        presenceData.state = favoritesCount
      break
    }
    case 'offre': {
      if (path[3] && path[3] === 'description') {
        presenceData.details = 'Regarde les détails d\'une offre'
      }
      else {
        presenceData.details = 'Regarde une offre'

        const offer = document.querySelector<HTMLHeadingElement>(
          '[data-testid="offer-container"] h1[data-testid^="Nom de l’offre"]',
        )?.textContent
        const price = document.querySelector<HTMLDivElement>(
          'div[data-testid=caption-iconPrice]',
        )?.textContent
        if (offer && price) {
          presenceData.state = `${offer} (${price})`
          presenceData.buttons = [
            {
              label: 'Voir l\'offre',
              url: document.location.href.split('?')[0]!,
            },
          ]
        }
      }
      break
    }
    default:
      presence.clearActivity()
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
