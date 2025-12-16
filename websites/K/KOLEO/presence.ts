import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1265368122689458378',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/K/KOLEO/assets/logo.png',
  Logo2 = 'https://cdn.rcd.gg/PreMiD/websites/K/KOLEO/assets/0.png',
  Buy = 'https://cdn.rcd.gg/PreMiD/websites/K/KOLEO/assets/1.png',
  Train = 'https://cdn.rcd.gg/PreMiD/websites/K/KOLEO/assets/2.png',
  Ticket = 'https://cdn.rcd.gg/PreMiD/websites/K/KOLEO/assets/3.png',
}

async function NoPage(presenceData: PresenceData): Promise<void> {
  presenceData.name = 'KOLEO - 404'
  presenceData.details = 'Nie znaleziono strony.'
  presenceData.largeImageKey = ActivityAssets.Logo
  delete presenceData.state
  presenceData.smallImageText = 'Zgubił się'
  presenceData.smallImageKey = Assets.Question
  await presence.setActivity(presenceData)
}

const operators = [
  'pkp-intercity',
  'polregio',
  'arriva',
  'leo-express',
  'koleje-wielkopolskie',
  'koleje-dolnoslaskie',
  'koleje-mazowieckie',
  'koleje-malopolskie',
  'wkd',
  'lka',
  'koleje-slaskie',
  'skm-trojmiasto',
  'skm-warszawa',
  'skpl',
]

const operatorNames: Record<string, string> = {
  'pkp-intercity': 'PKP Intercity',
  'polregio': 'POLREGIO',
  'arriva': 'Arriva',
  'leo-express': 'Leo Express',
  'koleje-wielkopolskie': 'Koleje Wielkopolskie',
  'koleje-dolnoslaskie': 'Koleje Dolnośląskie',
  'koleje-mazowieckie': 'Koleje Mazowieckie',
  'koleje-malopolskie': 'Koleje Małopolskie',
  'wkd': 'WKD',
  'lka': 'ŁKA',
  'koleje-slaskie': 'Koleje Śląskie',
  'skm-trojmiasto': 'SKM Trójmiasto',
  'skm-warszawa': 'SKM Warszawa',
  'skpl': 'SKPL',
}

presence.on('UpdateData', async () => {
  const { href, hostname, pathname } = document.location
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    smallImageKey: ActivityAssets.Train,
    startTimestamp: browsingTimestamp,
  }
  const privacySetting = await presence.getSetting<boolean>('privacy')

  if (hostname === 'koleo.pl') {
    if (
      href.endsWith('koleo.pl/')
      || href.endsWith('koleo.pl/#')
      || pathname.includes('rozklad-jazdy')
      || (operators.includes(pathname.split('/')[1]!) && !pathname.includes('bilety-miesieczne'))
    ) {
      const startStation = document.querySelector<HTMLInputElement>('input[name="start-station"]')
      const endStation = document.querySelector<HTMLInputElement>('input[name="end-station"]')
      const date = document.querySelector<HTMLInputElement>('input[readonly]')
      const isMainPage = href.endsWith('koleo.pl/') || href.endsWith('koleo.pl/#')

      presenceData.smallImageText = isMainPage ? 'Rozkład KOLEO' : operatorNames[pathname.split('/')[1] ?? ''] || 'Rozkład KOLEO'

      if ((startStation && startStation.value.length > 0) || (endStation && endStation.value.length > 0)) {
        presenceData.name = 'KOLEO - rozkład jazdy'
        presenceData.state = isMainPage ? 'Wpisuje dane' : 'Wybiera połączenia'
        if (!privacySetting) {
          presenceData.details = `${startStation?.value ? `Z ${startStation.value}` : ''} ${(startStation?.value && endStation?.value) ? '-' : ''} ${endStation?.value ? `Do ${endStation.value}` : ''} - Na ${date?.value}`
        }
      }
      else {
        presenceData.name = 'KOLEO'
        presenceData.state = ''
        presenceData.details = `W rozkładzie ${operatorNames[pathname.split('/')[1] ?? ''] || 'KOLEO'}`
      }
    }
    else if (pathname.startsWith('/rozklad-pkp')) {
      const startStation = document.querySelector<HTMLInputElement>('input[name="start-station"]')
      const endStation = document.querySelector<HTMLInputElement>('input[name="end-station"]')
      const date = document.querySelector<HTMLInputElement>('input[readonly]')

      presenceData.smallImageText = operatorNames[pathname.split('/')[1] ?? ''] || 'Rozkład KOLEO'

      if ((startStation && startStation.value.length > 0) || (endStation && endStation.value.length > 0)) {
        presenceData.name = 'KOLEO - rozkład jazdy'
        if (!privacySetting) {
          presenceData.details = `${startStation?.value ? `Z ${startStation.value}` : ''} ${(startStation?.value && endStation?.value) ? '-' : ''} ${endStation?.value ? `Do ${endStation.value}` : ''} - Na ${date?.value}`
        }
        presenceData.state = 'Wybiera połączenia'
      }
      else {
        presenceData.name = 'KOLEO'
        presenceData.details = `W rozkładzie ${operatorNames[pathname.split('/')[1] ?? ''] || 'KOLEO'}`
        presenceData.state = ''
      }
    }
    else if (pathname.startsWith('/connection/') || pathname.startsWith('/traveloptions/') || pathname.startsWith('/summary/')) {
      const stations = document.querySelector<HTMLDivElement>('.connection-basic-info__name')?.textContent?.split(' - ')
      const startStation = stations?.[0] || null
      const endStation = stations?.[1] || null
      const dateTime = document.querySelector<HTMLDivElement>('.connection-date b')?.textContent?.split(',').slice(1).join(',').trim()
      const people = document.querySelectorAll<HTMLButtonElement>('.tile-passenger--is-selected')?.length
      const cost = document.querySelector<HTMLDivElement>('.search-result-final__value')?.textContent?.trim()
        || document.querySelector<HTMLDivElement>('.order-summary-total__price')?.textContent?.trim()
      const paymentMethod = document.querySelector<HTMLSpanElement>('.tile-radio--is-checked')?.textContent?.trim().split('Dos')[0]
      const part = document.querySelector('.step-breadcrumbs__step--is-active .step-breadcrumbs__number-badge')?.textContent

      if (!dateTime) {
        presenceData.details = 'Ładuje połączenie'
        presenceData.smallImageText = 'Ładuje połączenie'
        presenceData.smallImageKey = ActivityAssets.Train
        return presence.setActivity(presenceData)
      }

      if (!privacySetting) {
        if (startStation && endStation) {
          presenceData.details = `Z ${startStation} - Do ${endStation} - Na ${dateTime}`
        }
        else if (startStation && !endStation) {
          presenceData.details = `Oferta ${startStation} - Na ${dateTime}`
        }
      }
      else {
        presenceData.state = 'Przegląda połączenie.'
      }

      if (part === '1') {
        presenceData.name = 'KOLEO - połączenie'
        if (!privacySetting) {
          presenceData.state = `${people ? `z ${people} ${people === 1 ? 'pasażerem' : 'pasażerami'}` : ''} za ${cost || 'nieznaną cenę'}`
        }
        presenceData.smallImageText = 'Krok 1 - Tablica z informacjami o połączeniu'
      }
      else if (part === '2') {
        presenceData.name = 'KOLEO - połączenie - wybór preferencji'
        if (!privacySetting) {
          presenceData.state = `bilet za ${cost || 'nieznaną cenę'}`
        }
        presenceData.smallImageText = 'Krok 2 - Wybór miejsca, klasy i preferencji'
      }
      else if (part === '3') {
        presenceData.name = 'KOLEO - połączenie - płatność i podsumowanie'
        if (!privacySetting) {
          presenceData.state = `bilet za ${cost || 'nieznaną cenę'}${paymentMethod ? `, za pomocą ${paymentMethod}` : ''}`
        }
        presenceData.smallImageText = 'Krok 3 - Płatność i podsumowanie'
      }

      presenceData.smallImageKey = ActivityAssets.Ticket
    }
    else if (pathname.includes('bilety-miesieczne')) {
      const transportation = document.querySelector('h1.top-banner__heading')
      if (transportation) {
        presenceData.state = `Przegląda bilety miesięczne${privacySetting ? '.' : ` w ${transportation.textContent}.`}`
        presenceData.smallImageText = 'Przegląda bilety'
        presenceData.smallImageKey = ActivityAssets.Ticket
      }

      const typeOfTicket = document.querySelector('.active-ticket__ticket-name')
      const date = document.querySelector<HTMLInputElement>('input[readonly]')

      if (typeOfTicket) {
        const stepOfBuying = document.querySelector('.step-breadcrumbs__step--is-active .step-breadcrumbs__number-badge')?.textContent
        const offers = document.querySelector('.carrier-season-ticket__total-price')

        presenceData.details = `Kupuje ${privacySetting ? 'bilet miesięczny.' : `${typeOfTicket.textContent?.toLowerCase()} na ${date?.value || 'nieznaną datę'}`}`
        presenceData.state = `W ${document.querySelector('.active-ticket__carrier-name')?.textContent}.`
        presenceData.smallImageKey = ActivityAssets.Buy

        if (stepOfBuying === '2' && !offers) {
          const startStationButton = document.querySelector('.closest-station')
          const endStationButton = document.querySelector('.swap-stations')
          const dateInputWrapper = document.querySelector('.form-date-input__input-wrapper')

          if (startStationButton && endStationButton && dateInputWrapper) {
            const startText = startStationButton?.closest('.icon-input-action')?.querySelector<HTMLInputElement>('input')?.value
            const endText = endStationButton?.closest('.icon-input-action')?.querySelector<HTMLInputElement>('input')?.value
            const dateText = dateInputWrapper?.querySelector<HTMLInputElement>('input')?.value

            presenceData.smallImageText = 'Szuka połączenia'
            presenceData.smallImageKey = ActivityAssets.Train

            if (!privacySetting) {
              presenceData.state = `Szuka połączenia ${startText && startText.length > 0 ? `z ${startText}` : ''} ${endText && endText.length > 0 ? `do ${endText}` : ''} na ${dateText}`
            }
            else {
              presenceData.state = 'Szuka połączenia'
            }
          }
          else {
            presenceData.smallImageText = 'Wybiera stację'
            presenceData.state = 'Wybiera stację docelową'
          }
        }
        else if (stepOfBuying === '2' && offers) {
          presenceData.state = 'Wybiera offertę biletu'
          presenceData.smallImageText = 'Wybiera offertę'

          if (document.querySelector('.tile-radio--is-checked')?.textContent) {
            if (!privacySetting) {
              presenceData.state = `Wybrał/a ofertę za ${document.querySelector('.tile-radio--is-checked .tile-season-offer-radio__price')?.textContent}.`
            }
            else {
              presenceData.state = 'Wybrał/a ofertę'
            }
            presenceData.smallImageText = 'Wybrał ofertę'
            presenceData.smallImageKey = ActivityAssets.Ticket
          }
        }
      }
    }
    else if (pathname.startsWith('/ticket/')) {
      const tickets = document.querySelectorAll('.ticket')

      if (tickets.length === 0) {
        presenceData.details = 'Ładuje bilet/y'
        presenceData.smallImageText = 'Ładuje bilet/y'
        presenceData.smallImageKey = ActivityAssets.Ticket
        return presence.setActivity(presenceData)
      }

      if (!privacySetting && tickets.length > 0) {
        const mergedTicketData = {
          stations: [] as string[],
          trainClasses: [] as string[],
          operators: [] as string[],
          distance: '0 km',
          tempDistance: 0,
          price: '0 zł',
          tempPrice: 0,
        }
        const uniqueStations = new Set<string>()
        const uniqueClasses = new Set<string>()
        const uniqueOperators = new Set<string>()

        for (const ticket of tickets) {
          const stations = ticket.querySelector('.ticket-stations .ticket-station span')?.textContent?.replace(/\n/g, ' ').trim().replace(/ {2}/g, ' ').split(' — ')
          const trainClasses = ticket.querySelector('.ticket-trains:nth-of-type(1) .train-class')?.textContent?.replace(/\n/g, ' ').trim().replace(/ {2}/g, ' ')
          const operators = ticket.querySelector('.ticket-trains:nth-of-type(2) strong')?.textContent?.replace(/\n/g, ' ').trim().replace(/ {2}/g, ' ')
          const distance = Number.parseFloat(ticket.querySelector('.ticket-distance span')?.textContent?.replace(/\n/g, ' ').trim().replace(/ {2}/g, ' ').replace(',', '.') ?? '0')
          const price = Number.parseFloat(ticket.querySelector('.ticket-price .price-value')?.textContent?.replace(/\n/g, ' ').trim().replace(/ {2}/g, ' ').replace('zł', '').replace(',', '.') ?? '0')

          if (stations) {
            for (const station of stations) uniqueStations.add(station)
          }
          if (trainClasses)
            uniqueClasses.add(trainClasses.replace('Klasa ', ''))
          if (operators)
            uniqueOperators.add(operators)
          if (distance)
            mergedTicketData.tempDistance += distance
          if (price)
            mergedTicketData.tempPrice += price
        }

        mergedTicketData.stations = Array.from(uniqueStations)
        mergedTicketData.trainClasses = Array.from(uniqueClasses)
        mergedTicketData.operators = Array.from(uniqueOperators)
        mergedTicketData.price = `${mergedTicketData.tempPrice.toFixed(2)} zł`
        mergedTicketData.distance = `${mergedTicketData.tempDistance} km`

        const stations = mergedTicketData.stations.join(' - ')
        const trainClasses = mergedTicketData.trainClasses.join(', ')
        const operators = mergedTicketData.operators.join(', ')

        presenceData.details = `Przegląda ${tickets.length > 1 ? 'bilety' : 'bilet'} z ${stations.split(' - ')[0]} do ${stations.split(' - ')[stations.split(' - ').length - 1]} (${mergedTicketData.distance}) za ${mergedTicketData.price}.`
        presenceData.state = `${trainClasses.length > 1 ? 'Klasy pociągów' : 'Klasa pociągu'}: ${trainClasses}, ${operators.length > 1 ? 'Operatorzy' : 'Operator'}: ${operators}.`
      }
      else {
        presenceData.details = `Przegląda ${tickets.length > 1 ? 'swoje bilety' : 'swój bilet'}.`
      }

      presenceData.smallImageText = `Przegląda ${tickets.length > 1 ? 'bilety' : 'bilet'}`
      presenceData.smallImageKey = ActivityAssets.Ticket
    }
    else if (pathname.startsWith('/my')) {
      presenceData.name = 'KOLEO - konto'
      presenceData.state = 'Przegląda swoje konto KOLEO.'
      presenceData.smallImageText = 'Przegląda konto'
      presenceData.smallImageKey = Assets.Viewing

      if (pathname.startsWith('/my/account')) {
        presenceData.name = 'KOLEO - konto - dane konta'
        presenceData.state = 'Wprowadza zmiany w swoje dane konta KOLEO'
        presenceData.smallImageText = 'Zmienia dane'
        presenceData.smallImageKey = Assets.Writing

        if (pathname.startsWith('/my/account/change-password')) {
          presenceData.name = 'KOLEO - konto - zmiana hasła'
          presenceData.state = 'Zmienia swoje hasło do konta KOLEO'
          presenceData.smallImageText = 'Zmienia hasło'
          presenceData.smallImageKey = Assets.Writing
        }
      }
      else if (pathname.startsWith('/my/orders')) {
        presenceData.name = 'KOLEO - konto - bilety'
        presenceData.state = 'Przegląda swoje bilety'
        presenceData.smallImageText = 'Przegląda'

        if (pathname.startsWith('/my/orders/archive')) {
          presenceData.state = 'Przegląda swoje archiwalne bilety.'
          presenceData.smallImageText = 'Przegląda'
        }
      }
      else if (pathname.startsWith('/my/passengers')) {
        presenceData.name = 'KOLEO - konto - pasażerowie'
        presenceData.state = 'Przegląda swoich pasażerów'
        presenceData.smallImageText = 'Przegląda'

        if (pathname.startsWith('/my/passengers/new')) {
          presenceData.name = 'KOLEO - konto - dodawanie pasażera'
          presenceData.state = 'Dodaje nowego pasażera'
          presenceData.smallImageText = 'Dodaje'
          presenceData.smallImageKey = Assets.Writing
        }
        else if (pathname.startsWith('/my/passengers/edit')) {
          presenceData.name = 'KOLEO - konto - edytowanie pasażera'
          presenceData.state = 'Edytuje swoich pasażerów'
          presenceData.smallImageText = 'Edytuje'
          presenceData.smallImageKey = Assets.Writing
        }
      }
      else if (pathname.startsWith('/my/finances')) {
        presenceData.name = 'KOLEO - konto - finanse'
        presenceData.state = 'Przegląda środki na swoim koncie KOLEO'
        presenceData.smallImageText = 'Przegląda środki'

        if (pathname.startsWith('/my/finances/') && !pathname.includes('invoice-details') && !pathname.includes('transactions')) {
          let title = ''
          if (pathname.endsWith('/blik'))
            title = 'BLIKa'
          else if (pathname.endsWith('/transfer'))
            title = 'przelewu'
          else if (pathname.endsWith('/postal-order'))
            title = 'przekazu pocztowym'
          else if (pathname.endsWith('/payment-cards'))
            title = 'karty płatniczej'
          else if (pathname.endsWith('/gift-card'))
            title = 'karty podarunkowej'

          const formAmount = document.querySelector<HTMLInputElement>('.form-base .form-input__control')

          presenceData.state = 'Doładowuje środki na swoje konto KOLEO.'

          if (formAmount && formAmount.getAttribute('inputmode') === 'decimal' && !privacySetting) {
            presenceData.state = `Doładowuje konto o ${formAmount.value} przy użyciu ${title}.`
          }
          else {
            presenceData.state = `Przy użyciu ${title}.`
          }

          presenceData.smallImageText = 'Doładowuje konto'
          presenceData.smallImageKey = ActivityAssets.Buy
        }
        else if (pathname.includes('invoice-details')) {
          presenceData.name = 'KOLEO - konto - faktura'
          presenceData.state = 'Wypełnia dane do faktury'
          presenceData.smallImageText = 'Wypełnia'
          presenceData.smallImageKey = Assets.Writing
        }
        else if (pathname.includes('transactions')) {
          presenceData.name = 'KOLEO - konto - transakcje'
          presenceData.state = 'Przegląda swoje transakcje'
          presenceData.smallImageText = 'Przegląda'
        }
      }
      else if (pathname.startsWith('/my/linked-accounts')) {
        presenceData.name = 'KOLEO - konto - połączone konta'
        presenceData.state = 'Przegląda swoje połączone konta'
        presenceData.smallImageText = 'Przegląda'
      }
      else if (pathname.startsWith('/my/settings')) {
        presenceData.name = 'KOLEO - konto - ustawienia'
        presenceData.state = 'Wprowadza zmiany w swojich ustawieniach konta'
        presenceData.smallImageText = 'Zmienia ustawienia'
        presenceData.smallImageKey = Assets.Writing
      }
      else if (pathname.startsWith('/my/yearly-summaries')) {
        presenceData.name = 'KOLEO - konto - roczne podsumowania'
        presenceData.state = 'Przegląda roczne podsumowania'
        presenceData.smallImageText = 'Przegląda'
      }
    }
    else if (pathname.startsWith('/signin') || (pathname.startsWith('/users/auth') && pathname.includes('intent=login'))) {
      presenceData.state = 'Loguje się'
      presenceData.smallImageText = 'Loguje się'
      presenceData.smallImageKey = Assets.Writing
    }
    else if (pathname.startsWith('/signup') || (pathname.startsWith('/users/auth') && pathname.includes('intent=signup'))) {
      presenceData.state = 'Rejestruje się'
      presenceData.smallImageText = 'Rejestruje się'
      presenceData.smallImageKey = Assets.Writing
    }
    else if (pathname.startsWith('/kontakt')) {
      presenceData.state = 'Przegląda informacje kontaktowe.'
      presenceData.smallImageText = 'Przegląda informacje'
      presenceData.smallImageKey = Assets.Viewing
    }
    else if (pathname.startsWith('/privacy_policy')) {
      presenceData.state = 'Czyta politykę prywatności.'
      presenceData.smallImageText = 'Czyta politykę'
      presenceData.smallImageKey = Assets.Reading
    }
    else if (pathname.startsWith('/media')) {
      presenceData.state = 'Przegląda media KOLEO.'
      presenceData.smallImageText = 'Przegląda media'
      presenceData.smallImageKey = Assets.Viewing
    }
    else {
      NoPage(presenceData)
    }
  }
  else if (hostname === 'pomoc.koleo.pl') {
    presenceData.name = 'KOLEO - pomoc'
    presenceData.largeImageKey = ActivityAssets.Logo2
    presenceData.smallImageText = 'Przegląda pomoc'
    presenceData.smallImageKey = Assets.Viewing

    if (pathname === '/') {
      presenceData.state = 'Przegląda pomoc KOLEO.'
    }
    else if (pathname.startsWith('/?s')) {
      presenceData.state = 'Korzysta z wyszukiwarki'
      if (!privacySetting) {
        presenceData.details = document.querySelector<HTMLInputElement>('#hkb-search')?.value
      }
      presenceData.smallImageText = 'Korzysta z wyszukiwarki'
      presenceData.smallImageKey = Assets.Search
    }
    else if (pathname.startsWith('/faq')) {
      presenceData.state = 'Przegląda często zadane pytania.'
    }
    else if (pathname.startsWith('/wp-content')) {
      presenceData.state = 'Przegląda pliki.'
    }
    else {
      if (!privacySetting) {
        const articleTitle = document.querySelector('.hkb-article__title') || document.querySelector('.entry-header .entry-title')
        const searchTab = document.querySelector<HTMLInputElement>('#hkb-search')

        presenceData.state = `Czyta artykuł${articleTitle ? ` - ${articleTitle.textContent}` : '.'}`

        if (searchTab && searchTab.value.length > 0) {
          presenceData.details = `Korzysta z wyszukiwarki: ${searchTab.value}`
          presenceData.smallImageText = 'Korzysta z wyszukiwarki'
          presenceData.smallImageKey = Assets.Search
        }
      }
      else {
        presenceData.details = 'Czyta artykuł.'
      }

      presenceData.smallImageText = 'Czyta artykuł'
      presenceData.smallImageKey = Assets.Reading
    }
  }
  else if (hostname === 'magazyn.koleo.pl') {
    presenceData.name = 'KOLEO - magazyn'
    presenceData.largeImageKey = ActivityAssets.Logo2
    presenceData.smallImageKey = Assets.Viewing

    if (pathname === '/') {
      presenceData.details = 'Przegląda artykuły w magazynie KOLEO.'
      presenceData.smallImageText = 'Przegląda artykuły'
    }
    else if (pathname.startsWith('/o-koleo')) {
      presenceData.details = 'Przegląda informacje o KOLEO.'
      presenceData.smallImageText = 'Przegląda informacje'
    }
    else if (pathname.startsWith('/author/')) {
      const authorName = document.querySelector('.module-title')

      if (authorName && !privacySetting) {
        presenceData.details = `Przegląda artykuły napisane przez ${authorName.textContent}.`
        presenceData.state = `Ilość artykułów: ${document.querySelector('.gridlove-posts')?.children.length}`
        presenceData.smallImageText = 'Przegląda profil'
      }
      else {
        presenceData.details = 'Przegląda artykuły.'
        presenceData.smallImageText = 'Przegląda artykuły'
      }
    }
    else if (pathname.startsWith('/opinie')) {
      presenceData.details = 'Przegląda opinie ludzi.'
      presenceData.smallImageText = 'Przegląda opinie'

      const tempOpinion = document.querySelector('rw-popup-review.hydrated')

      if (tempOpinion && !privacySetting) {
        const shadowRootOpinion = tempOpinion.shadowRoot
        const opinionUserElement = shadowRootOpinion?.querySelector('.main .header .info .name')
        const opinionStarsElements = shadowRootOpinion?.querySelectorAll('.main .stat .icon-star')
        const opinionLinkElement = shadowRootOpinion?.querySelector('.main .header .info .channel-link a')

        if (opinionUserElement && opinionStarsElements && opinionLinkElement) {
          presenceData.details = `Przegląda opinię ${opinionUserElement.textContent?.trim()}, który/a ocenił/a KOLEO na ${opinionStarsElements.length} gwiazdki.`
        }
      }
    }
    else {
      const topicOfPage = document.title.split('›')[0]?.trim() || document.querySelector('.entry-header h1.entry-title')?.textContent
      const authorOfPage = document.querySelector('.mks_author_widget .widget-title')?.textContent
      const metaOfPage = document.querySelector('.entry-meta')
      const dateOfPage = metaOfPage?.querySelector('div.meta-date span')?.textContent

      if (authorOfPage) {
        presenceData.details = `Czyta temat${!privacySetting ? ` napisany przez ${authorOfPage}` : ''}.`

        if (!privacySetting) {
          presenceData.state = [topicOfPage, dateOfPage, metaOfPage?.querySelector('div.meta-rtime')?.textContent].filter(Boolean).join(' | ')
        }

        presenceData.smallImageText = 'Czyta temat'
        presenceData.smallImageKey = Assets.Reading
      }
      else {
        presenceData.details = `Przegląda artykuły${!privacySetting ? ` zawierające ${document.querySelector('.module-title h1.h2')?.textContent}` : ''}.`

        if (!privacySetting) {
          presenceData.state = `Ilość artykułów: ${document.querySelector('.gridlove-posts')?.children.length} | Utworzono: ${dateOfPage}`
        }

        presenceData.smallImageText = 'Przegląda profil przewoźnika'
      }
    }
  }
  else if (hostname === 'travel.koleo.pl') {
    presenceData.name = 'KOLEO - travel'
    presenceData.largeImageKey = ActivityAssets.Logo2
    presenceData.smallImageKey = Assets.Viewing

    if (pathname === '/') {
      presenceData.details = 'Przegląda travel KOLEO.'
      presenceData.smallImageText = 'Przegląda travel'
    }
    else {
      const topicOfPage = document.title.split('›')[0]?.trim() || document.querySelector('.entry-header h1.entry-title')?.textContent

      if (topicOfPage) {
        const authorOfPage = document.querySelector('.mks_author_widget .widget-title')?.textContent
        const dateOfPage = document.querySelector('.entry-meta div.meta-date span')?.textContent

        if (dateOfPage) {
          presenceData.details = `Czyta informacje${authorOfPage && !privacySetting ? ` napisane przez ${authorOfPage}` : ''}`

          if (!privacySetting) {
            presenceData.state = [topicOfPage, dateOfPage].filter(Boolean).join(' | ')
          }

          presenceData.smallImageText = 'Czyta informacje'
          presenceData.smallImageKey = Assets.Reading
        }
        else {
          presenceData.details = `Przegląda informacji${!privacySetting ? ` o ${topicOfPage.toLowerCase()}` : ''}.`

          if (!privacySetting) {
            presenceData.state = `Ilość informacji: ${document.querySelector('.gridlove-posts')?.children.length}`
          }

          presenceData.smallImageText = 'Przegląda strone kraju'
        }
      }
      else {
        presenceData.details = 'Przegląda travel KOLEO.'
        presenceData.smallImageText = 'Przegląda travel'
      }
    }
  }
  else if (hostname === 'sklep.koleo.pl') {
    presenceData.name = 'KOLEO - sklep'
    presenceData.largeImageKey = ActivityAssets.Logo2
    presenceData.smallImageKey = Assets.Viewing

    if (pathname === '/') {
      presenceData.details = 'Przegląda sklep KOLEO.'
      presenceData.smallImageText = 'Przegląda sklep'
    }
    else if (pathname.startsWith('/katalog')) {
      const page = document.querySelector('.page-numbers.current')?.textContent
      presenceData.details = 'Przegląda katalog produktów.'
      if (page)
        presenceData.state = `Strona: ${page}`
      presenceData.smallImageText = 'Przegląda katalog'
    }
    else if (
      (pathname.startsWith('/koleo-kids/')
        || pathname.startsWith('/klocki-lego/')
        || pathname.startsWith('/kolejki-drewniane/')
        || pathname.startsWith('/kdd/')
        || pathname.startsWith('/ksiazki-dla-dzieci/')
        || pathname.startsWith('/plakaty-kolejowe/')
        || pathname.startsWith('/kubki-barowe/')
        || pathname.startsWith('/odziez/')
        || pathname.startsWith('/ksiazki/')
        || pathname.startsWith('/artykuly-podrozne/')
        || pathname.startsWith('/kalendarze/')
        || pathname.startsWith('/karta-podarunkowa-koleo/')
        || pathname.startsWith('/modelarstwo/')
        || pathname.startsWith('/czasopisma/')
        || pathname.startsWith('/gry/')
        || pathname.startsWith('/duch-podrozy/')
        || pathname.startsWith('/marka/')
        || pathname.split('/')[2]?.includes('page'))
      && !document.querySelector('.product_title')
    ) {
      const pageNumber = document.querySelector('.page-numbers.current')?.textContent
      presenceData.details = `Przegląda produkty ${pathname.startsWith('/marka') ? 'marki' : 'katalogu'}${!privacySetting ? ` - ${document.querySelector('.woocommerce-products-header__title')?.textContent}` : ''}.`
      if (pageNumber)
        presenceData.state = `Strona: ${pageNumber}`
      presenceData.smallImageText = 'Przegląda katalog'
    }
    else if (pathname.startsWith('/passy')) {
      presenceData.details = 'Przegląda dostępne passy.'
      presenceData.smallImageText = 'Przegląda passy'

      const productTitle = document.querySelector('.product_title')

      if (productTitle) {
        presenceData.details = `Przegląda pass${privacySetting ? '' : ` - ${productTitle.textContent}`}.`
        presenceData.smallImageText = 'Przegląda pass'

        if (!privacySetting) {
          presenceData.state = `Cena: ${document.querySelector('div.woocommerce-variation-price span.price span.woocommerce-Price-amount.amount bdi')?.textContent}`
        }
      }
    }
    else if (pathname.startsWith('/koszyk/')) {
      const cartItems = document.querySelectorAll('.cart_item')
      presenceData.details = 'Przegląda swój koszyk.'

      if (!privacySetting) {
        presenceData.state = cartItems.length > 0
          ? `Ilość produktów w koszyku: ${cartItems.length} | Cena za wszystko: ${document.querySelector('.order-total .woocommerce-Price-amount')?.textContent}`
          : 'Nie ma nic w koszyku'
      }

      presenceData.smallImageText = 'Przegląda koszyk'
      presenceData.smallImageKey = ActivityAssets.Buy
    }
    else if (pathname.startsWith('/zamowienie')) {
      const cartItems = document.querySelectorAll('.cart_item')

      if (cartItems.length > 0) {
        presenceData.details = 'Realizuje swoje zamówienie.'

        if (!privacySetting) {
          presenceData.state = `Cena za ${cartItems.length > 1 ? `${cartItems.length} produktów` : `${cartItems.length} produkt`} wynosi ${document.querySelector('.order-total .woocommerce-Price-amount bdi')?.textContent}`
        }

        presenceData.smallImageText = 'Realizuje zamówienie'
        presenceData.smallImageKey = ActivityAssets.Buy
      }
      else {
        presenceData.details = 'Przegląda swoje zamówienie.'
        presenceData.smallImageText = 'Przegląda zamówienie'
        presenceData.smallImageKey = ActivityAssets.Buy
      }
    }
    else if (pathname.startsWith('/moje-konto')) {
      if (document.querySelector('.woocommerce-form-login__submit')) {
        presenceData.details = 'Loguje się do swojego konta KOLEO.'
        presenceData.smallImageText = 'Loguje się'
        presenceData.smallImageKey = Assets.Writing
      }
      else {
        presenceData.details = 'Przegląda swoje konto KOLEO.'
        presenceData.smallImageText = 'Przegląda konto'
      }

      if (pathname.startsWith('/moje-konto/lost-password')) {
        presenceData.details = 'Resetuje swoje hasło do konta KOLEO.'
        presenceData.smallImageText = 'Resetuje hasło'
        presenceData.smallImageKey = Assets.Writing
      }
    }
    else if (pathname.startsWith('/regulamin')) {
      presenceData.details = 'Czyta regulamin sklepu KOLEO.'
      presenceData.smallImageText = 'Czyta regulamin'
      presenceData.smallImageKey = Assets.Reading
    }
    else if (pathname.startsWith('/polityka-prywatnosci')) {
      presenceData.details = 'Czyta politykę prywatności sklepu KOLEO.'
      presenceData.smallImageText = 'Czyta politykę'
      presenceData.smallImageKey = Assets.Reading
    }
    else if (pathname.startsWith('/francuska-11a')) {
      presenceData.details = 'Przegląda informacje kontaktowe KOLEO.'
      presenceData.smallImageText = 'Przegląda informacje'
    }
    else if (pathname.startsWith('/sklep-stacjonarny')) {
      presenceData.details = 'Przegląda informacje o sklepie stacjonarnym KOLEO.'
      presenceData.smallImageText = 'Przegląda informacje'
    }
    else if (pathname.startsWith('/dostawa')) {
      presenceData.details = 'Przegląda informacje o dostawie w sklepie KOLEO.'
      presenceData.smallImageText = 'Przegląda informacje'
    }
    else if (pathname.startsWith('/interrail-najczesciej-zadawane-pytania')) {
      presenceData.details = 'Przegląda najczęściej zadawane pytania o bilety Interrail.'
      presenceData.smallImageText = 'Przegląda pytania'
    }
    else {
      const productTitle = document.querySelector('.product_title')

      if (productTitle) {
        presenceData.details = `Przegląda produkt${privacySetting ? '' : ` - ${productTitle.textContent}`}.`
        presenceData.smallImageText = 'Przegląda produkt'

        if (!privacySetting) {
          presenceData.state = `${document.querySelector('.pwb-single-product-brands a') ? `Marka: ${document.querySelector('.pwb-single-product-brands a')?.textContent} | ` : ''}Cena: ${document.querySelector('.price span.woocommerce-Price-amount bdi')?.textContent}`
        }
      }
      else {
        await NoPage(presenceData)
        return
      }
    }
  }
  else {
    await NoPage(presenceData)
  }

  presence.setActivity(presenceData)
})
