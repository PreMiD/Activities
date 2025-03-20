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

let oldStations: string | string[]

async function NoPage(presenceData: PresenceData): Promise<void> {
  presenceData.name = 'KOLEO - 404'
  presenceData.details = 'Nie znaleziono strony.'
  presenceData.largeImageKey = ActivityAssets.Logo
  delete presenceData.state
  presenceData.smallImageText = 'Zgubił się...'
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
]

presence.on('UpdateData', async () => {
  const { href, hostname, pathname } = document.location
  const presenceData: PresenceData = {
    details: 'Ładowanie.',
    largeImageKey: ActivityAssets.Logo,
    smallImageText: 'Ładowanie...',
    smallImageKey: ActivityAssets.Train,
    startTimestamp: browsingTimestamp,
  }
  const privacySetting = await presence.getSetting<boolean>('privacy')

  if (hostname === 'koleo.pl') {
    if (
      href.endsWith('koleo.pl/')
      || href.endsWith('koleo.pl/#')
      || pathname.includes('rozklad-jazdy')
      || (operators.includes(pathname.split('/')[1]!)
        && !pathname.includes('bilety-miesieczne'))
    ) {
      let startText: string | undefined,
        endText: string | undefined,
        dateText: string | undefined,
        partOfSite: string | undefined

      if (href.endsWith('koleo.pl/') || href.endsWith('koleo.pl/#')) {
        startText = document.querySelector<HTMLInputElement>(
          '#query_start_station',
        )?.value
        endText = document.querySelector<HTMLInputElement>(
          '#query_end_station',
        )?.value
        dateText = document.querySelector<HTMLInputElement>('#query_date')?.value
        partOfSite = 'całym KOLEO'
      }
      else if (
        pathname.includes('rozklad-jazdy')
        || operators.includes(pathname.split('/')[1]!)
      ) {
        const startStationButton = document.querySelector('.closest-station')
        const endStationButton = document.querySelector('.swap-stations')
        const dateInputWrapper = document.querySelector(
          '.form-date-input__input-wrapper',
        )

        if (startStationButton && endStationButton && dateInputWrapper) {
          startText = startStationButton
            .closest('.icon-input-action')
            ?.querySelector<HTMLInputElement>('input')
            ?.value
          endText = endStationButton
            .closest('.icon-input-action')
            ?.querySelector<HTMLInputElement>('input')
            ?.value
          dateText = dateInputWrapper.querySelector<HTMLInputElement>('input')?.value
        }
        partOfSite = document.querySelector('.top-banner__heading')?.textContent
          || 'caŁym KOLEO'
      }

      if (startText && endText) {
        presenceData.details = 'Szuka połączenia...'
        presenceData.state = `Z ${startText} - Do ${endText} - Na ${dateText} | W ${partOfSite}`
      }
      else {
        presenceData.details = 'Szuka połączenia rozkładu koleji.'
      }
      presenceData.smallImageText = 'Szuka połączenia...'
      presenceData.buttons = [
        { label: 'Rozkład Jazdy', url: 'https://koleo.pl/rozklad-jazdy' },
      ]
    }
    else if (pathname.startsWith('/rozklad-pkp')) {
      presenceData.state = 'W rozkładzie PKP...'
      const startStation = document.querySelector<HTMLInputElement>(
        '#query_start_station',
      )
      const endStation = document.querySelector<HTMLInputElement>('#query_end_station')
      const date = document.querySelector<HTMLInputElement>('#query_date')
      if (startStation && endStation && date) {
        const [startText, endText, dateText] = [
          startStation.value,
          endStation.value,
          date.value,
        ]
        if (
          href
          && startText
          && endText
          && dateText
          && (!oldStations || oldStations[0] !== href)
        ) {
          oldStations = [href, startText, endText, dateText.replace(/_/g, ' ')]
        }

        if (oldStations && oldStations[0] === href) {
          if (!privacySetting) {
            if (
              oldStations[0] === href
              && startText === oldStations[1]
              && endText === oldStations[2]
              && dateText === oldStations[3]
            ) {
              presenceData.details = 'Wybiera połączenie...'
              presenceData.state = `Z ${startText} - Do ${endText} - Na ${dateText}`
              presenceData.smallImageText = 'Wybiera najlepsze połączenie...'
            }
            else {
              presenceData.details = 'Szuka połączenia...'
              presenceData.state = `${
                startText.length > 0 ? `Z ${startText}` : ''
              }${startText.length > 0 && endText.length > 0 ? ' - ' : ''}${
                endText.length > 0 ? `Do ${endText}` : ''
              }${
                startText.length > 0 || endText.length > 0 ? ' - ' : ''
              }Na ${dateText}`
              presenceData.smallImageText = 'Szuka połączenia...'
            }
            presenceData.buttons = [
              {
                label: 'Zobacz Połączenia',
                url: `https://koleo.pl/${pathname
                  .split('/')
                  .slice(1, 5)
                  .join('/')}`,
              },
            ]
          }
          else {
            if (
              startText === oldStations[1]
              && endText === oldStations[2]
              && dateText === oldStations[3]
            ) {
              presenceData.details = 'Wybiera ofertę połączenia na wyznaczone stacje.'
              presenceData.smallImageText = 'Wybiera najlepszą oferte...'
              presenceData.smallImageKey = ActivityAssets.Ticket
            }
            else {
              presenceData.details = 'Szuka połączenia na wyznaczone stacje.'
              presenceData.smallImageText = 'Szuka...'
              presenceData.smallImageKey = ActivityAssets.Train
            }
            presenceData.buttons = [
              {
                label: 'Zobacz Połączenia',
                url: 'https://koleo.pl/rozklad-jazdy',
              },
            ]
          }
        }
      }
    }
    else if (pathname.includes('bilety-miesieczne')) {
      const transportation = document.querySelector('h1.top-banner__heading')
      if (transportation) {
        presenceData.details = `Przegląda bilety miesięczne${
          privacySetting ? '.' : ` w ${transportation.textContent}.`
        }`
        presenceData.smallImageText = 'Przegląda bilety...'
        presenceData.smallImageKey = ActivityAssets.Ticket
      }
      const typeOfTicket = document.querySelector(
        '.active-ticket__ticket-name',
      )
      if (typeOfTicket) {
        const stepOfBuying = document.querySelector(
          '.step-breadcrumbs__step--is-active .step-breadcrumbs__number-badge',
        )?.textContent
        const offers = document.querySelector(
          '.carrier-season-ticket__total-price',
        )
        presenceData.details = `Kupuje ${
          privacySetting
            ? 'bilet miesięczny.'
            : `${typeOfTicket.textContent?.toLowerCase()}.`
        }`
        presenceData.state = `W ${
          document.querySelector('.active-ticket__carrier-name')?.textContent
        }.`
        presenceData.smallImageKey = ActivityAssets.Buy
        if (stepOfBuying === '2' && !offers) {
          const startStationButton = document.querySelector('.closest-station')
          const endStationButton = document.querySelector('.swap-stations')
          const dateInputWrapper = document.querySelector(
            '.form-date-input__input-wrapper',
          )

          if (startStationButton && endStationButton && dateInputWrapper) {
            const [startText, endText, dateText] = [
              startStationButton
                ?.closest('.icon-input-action')
                ?.querySelector<HTMLInputElement>('input')
                ?.value,
              endStationButton
                ?.closest('.icon-input-action')
                ?.querySelector<HTMLInputElement>('input')
                ?.value,
              dateInputWrapper
                ?.querySelector<HTMLInputElement>('input')
                ?.value,
            ]

            presenceData.smallImageText = 'Szuka połączenia...'
            presenceData.smallImageKey = ActivityAssets.Train
            if (!privacySetting) {
              presenceData.state = `Szuka połączenia ${
                startText && startText.length > 0 ? `z ${startText}` : ''
              } ${endText && endText.length > 0 ? `do ${endText}` : ''} na ${dateText}`
            }
            else {
              presenceData.state = 'Szuka połączenia...'
            }
          }
          else {
            presenceData.smallImageText = 'Wybiera stację...'
            presenceData.state = 'Wybiera stację docelową...'
          }
        }
        else if (stepOfBuying === '2' && offers) {
          presenceData.state = 'Wybiera offertę biletu...'
          presenceData.smallImageText = 'Wybiera offertę...'

          if (document.querySelector('.tile-radio--is-checked')?.textContent) {
            if (!privacySetting) {
              presenceData.state = `Wybrał/a ofertę za ${
                document
                  .querySelector('.tile-radio--is-checked .tile-offer-radio__price')
                  ?.textContent
              }.`
            }
            else {
              presenceData.state = 'Wybrał/a ofertę...'
            }

            presenceData.smallImageText = 'Wybrał ofertę...'
            presenceData.smallImageKey = ActivityAssets.Ticket
          }
        }
      }
    }
    else if (
      pathname.startsWith('/summary')
      || pathname.startsWith('/confirm')
    ) {
      let titleOfOrder: string | undefined,
        dateOfTransport: string | undefined,
        typeOfTicket: string | undefined,
        costOfOrder: string | undefined,
        paymentMethod: Element | undefined,
        title: string | undefined

      if (pathname.startsWith('/summary')) {
        const tempTitleOfOrder = document.querySelector(
          '.tile-order .tile-order__name',
        )
        if (tempTitleOfOrder)
          titleOfOrder = tempTitleOfOrder?.textContent?.toLowerCase()
        const tempDateOfTransport = document.querySelector('.tile-order__date')
        if (tempDateOfTransport)
          dateOfTransport = tempDateOfTransport.textContent?.toLowerCase()
        const tempTypeOfTicket = document.querySelector(
          '.order-summary-info__content',
        )
        if (tempTypeOfTicket)
          typeOfTicket = tempTypeOfTicket.textContent ?? undefined
        const tempCostOfOrder = document.querySelector(
          '.order-summary-total__price',
        )
        if (tempCostOfOrder)
          costOfOrder = tempCostOfOrder.textContent ?? undefined
        paymentMethod = document
          .querySelector(
            '.tile-radio--is-checked .payment-method-radio__control span',
          ) ?? undefined
      }
      else if (pathname.startsWith('/confirm')) {
        const startStation = document.querySelector('li.koleoicon-arrow_right')
        const endStation = document.querySelector('li.koleoicon-arrow_left')
        if (startStation && endStation)
          titleOfOrder = `${startStation.textContent} - ${endStation.textContent}`
        const tempDateOfTransport = document.querySelector('li.koleoicon-clock')
        if (tempDateOfTransport)
          dateOfTransport = tempDateOfTransport.textContent ?? undefined
        const tempTypeOfTicket = document.querySelector(
          '.koleoicon-offer.ticket-type-info',
        )
        if (tempTypeOfTicket)
          typeOfTicket = tempTypeOfTicket.textContent?.toLowerCase()
        const tempCostOfOrder = document.querySelector('.payment-sum')
          || document.querySelector('.sum-to-pay')
        if (tempCostOfOrder)
          costOfOrder = tempCostOfOrder.textContent ?? undefined
        paymentMethod = document.querySelector('li.active') ?? undefined
      }
      if (!titleOfOrder || !dateOfTransport || !typeOfTicket || !costOfOrder) {
        presenceData.details = 'Ładuje zamówienie...'
        presenceData.smallImageText = 'Ładuje zamówienie...'
        presenceData.smallImageKey = ActivityAssets.Buy
        return presence.setActivity(presenceData)
      }

      if (paymentMethod) {
        if (
          paymentMethod.classList.contains('payment-method-wallet__name')
          || paymentMethod.classList.contains('payment-koleo-account')
        ) {
          title = 'środków na koncie KOLEO'
        }
        else if (
          paymentMethod.classList.contains('payment-method-blik__name')
          || paymentMethod.classList.contains('payment-blik')
        ) {
          title = 'BLIKa'
        }
        else if (
          paymentMethod.classList.contains('payment-method-card__name')
          || paymentMethod.classList.contains('payment-card')
        ) {
          title = 'karty płatniczej'
        }
        else if (paymentMethod.classList.contains('payment-trans')) {
          title = 'szybkiego przelewu'
        }
      }

      if (!privacySetting) {
        presenceData.details = `Kupuje bilet ${typeOfTicket}.`
        if (title) {
          presenceData.state = `Za pomocą ${title}.`
        }
        else {
          presenceData.state = `Z ${titleOfOrder.split(' - ')[0]} - Do ${
            titleOfOrder.split(' - ')[1]
          } - ${dateOfTransport} - Za cenę ${costOfOrder}.`
        }
      }
      else {
        presenceData.details = 'Kupuje bilet.'
      }
      presenceData.smallImageText = 'Kupuje bilet...'
      presenceData.smallImageKey = ActivityAssets.Buy
    }
    else if (pathname.startsWith('/ticket/')) {
      const tickets = document.querySelectorAll('.ticket')
      if (tickets.length === 0) {
        presenceData.details = 'Ładuje bilet/y...'
        presenceData.smallImageText = 'Ładuje bilet/y...'
        presenceData.smallImageKey = ActivityAssets.Ticket
        return presence.setActivity(presenceData)
      }

      if (!privacySetting && tickets.length > 0) {
        const mergedTicketData: {
          stations: string[]
          trainClasses: string[]
          operators: string[]
          distance: string
          tempDistance: number
          price: string
          tempPrice: number
        } = {
          stations: [],
          trainClasses: [],
          operators: [],
          distance: '0 km',
          tempDistance: 0,
          price: '0 zł',
          tempPrice: 0,
        }
        const uniqueStations = new Set()
        const uniqueClasses = new Set()
        const uniqueOperators = new Set()

        for (const ticket of tickets) {
          const stations = ticket
            .querySelector('.ticket-stations .ticket-station span')
            ?.textContent
            ?.replace(/\n/g, ' ')
            .trim()
            .replace(/ {2}/g, ' ')
            .split(' — ')
          const trainClasses = ticket
            .querySelector('.ticket-trains:nth-of-type(1) .train-class')
            ?.textContent
            ?.replace(/\n/g, ' ')
            .trim()
            .replace(/ {2}/g, ' ')
          const operators = ticket
            .querySelector('.ticket-trains:nth-of-type(2) strong')
            ?.textContent
            ?.replace(/\n/g, ' ')
            .trim()
            .replace(/ {2}/g, ' ')
          const distance = Number.parseFloat(
            ticket
              .querySelector('.ticket-distance span')
              ?.textContent
              ?.replace(/\n/g, ' ')
              .trim()
              .replace(/ {2}/g, ' ')
              .replace(',', '.') ?? '0',
          )
          const price = Number.parseFloat(
            ticket
              .querySelector('.ticket-price .price-value')
              ?.textContent
              ?.replace(/\n/g, ' ')
              .trim()
              .replace(/ {2}/g, ' ')
              .replace('zł', '')
              .replace(',', '.') ?? '0',
          )

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

        mergedTicketData.stations = Array.from(uniqueStations) as string[]
        mergedTicketData.trainClasses = Array.from(uniqueClasses) as string[]
        mergedTicketData.operators = Array.from(uniqueOperators) as string[]
        mergedTicketData.price = `${mergedTicketData.tempPrice.toFixed(2)} zł`
        mergedTicketData.distance = `${mergedTicketData.tempDistance} km`

        const stations = mergedTicketData.stations.join(' - ')
        const trainClasses = mergedTicketData.trainClasses.join(', ')
        const operators = mergedTicketData.operators.join(', ')
        const { distance } = mergedTicketData
        const { price } = mergedTicketData

        presenceData.details = `Przegląda ${
          tickets.length > 1 ? 'bilety' : 'bilet'
        } z ${stations.split(' - ')[0]} do ${
          stations.split(' - ')[stations.split(' - ').length - 1]
        } (${distance}) za ${price}.`
        presenceData.state = `${
          trainClasses.length > 1 ? 'Klasy pociągów' : 'Klasa pociągu'
        }: ${trainClasses}, ${
          operators.length > 1 ? 'Operatorzy' : 'Operator'
        }: ${operators}.`
      }
      else {
        presenceData.details = `Przegląda ${
          tickets.length > 1 ? 'swoje bilety' : 'swój bilet'
        }.`
      }
      presenceData.smallImageText = `Przegląda ${
        tickets.length > 1 ? 'bilety' : 'bilet'
      }...`
      presenceData.smallImageKey = ActivityAssets.Ticket
      presenceData.buttons = [
        { label: 'Moje Bilety', url: 'https://koleo.pl/my/orders' },
      ]
    }
    else if (pathname.startsWith('/travel-options/')) {
      const stationText = document.querySelector(
        '.traveloptions .connection-relation .small-16 h2',
      )
      let stations: string[] = []
      if (stationText) {
        stations = stationText.textContent
          ?.split('—')
          .map(station => station.trim()) ?? []
      }
      const startStation = stations[0]
      const endStation = stations[stations.length - 1]
      const dateTimeText = document.querySelector(
        '.traveloptions .connection-relation .connection-relation-date',
      )
      let dateText: string | undefined
      if (dateTimeText)
        dateText = dateTimeText.textContent?.split('–')[0]?.trim()

      let travelOffer: string | undefined
      for (const option of Array.from(
        document.querySelectorAll('.traveloptions-option'),
      )) {
        const input = option.querySelector<HTMLInputElement>(
          'input[type="radio"]',
        )
        if (input && input.checked) {
          const offer = option.querySelector('.traveloptions-offers strong')
          if (offer)
            travelOffer = offer.textContent?.trim()
        }
      }

      const tempPriceText = document.querySelector(
        '.summary .traveloptions-price strong:nth-of-type(1)',
      )
      let priceText: string | undefined
      if (tempPriceText)
        priceText = `${tempPriceText.textContent?.trim()} zł`

      if (travelOffer && priceText) {
        if (!privacySetting) {
          presenceData.details = `Wybiera ofertę biletu ${travelOffer}.`
          presenceData.state = `Z ${startStation} - Do ${endStation} - Na ${dateText} - Za cenę ${priceText}.`
        }
        else {
          presenceData.details = 'Wybiera ofertę biletu...'
        }
        presenceData.smallImageText = 'Wybiera ofertę...'
        presenceData.smallImageKey = ActivityAssets.Ticket
      }
      else {
        presenceData.details = 'Przegląda oferty biletów...'
        if (!privacySetting)
          presenceData.state = `Z ${startStation} - Do ${endStation} - Na ${dateText}.`
        presenceData.smallImageText = 'Przegląda oferty...'
        presenceData.smallImageKey = ActivityAssets.Ticket
      }
    }
    else if (pathname.startsWith('/my')) {
      presenceData.details = 'Przegląda swoje konto KOLEO.'
      presenceData.smallImageText = 'Przegląda konto...'
      presenceData.smallImageKey = Assets.Viewing
      presenceData.buttons = [{ label: 'Moje Konto', url: href }]
      if (pathname.startsWith('/my/account')) {
        presenceData.details = 'Wprowadza zmiany w swoje dane konta KOLEO - konto KOLEO'
        presenceData.smallImageText = 'Zmienia dane...'
        presenceData.smallImageKey = Assets.Writing
        if (pathname.startsWith('/my/account/change-password')) {
          presenceData.details = 'Zmienia swoje hasło do konta KOLEO - konto KOLEO'
          presenceData.smallImageText = 'Zmienia hasło...'
          presenceData.smallImageKey = Assets.Writing
        }
      }
      else if (pathname.startsWith('/my/orders')) {
        presenceData.details = 'Przegląda swoje bilety - konto KOLEO'
        presenceData.smallImageText = 'Przegląda...'
        if (pathname.startsWith('/my/orders/archive')) {
          presenceData.details = 'Przegląda swoje archiwalne bilety.'
          presenceData.smallImageText = 'Przegląda...'
        }
      }
      else if (pathname.startsWith('/my/passengers')) {
        presenceData.details = 'Przegląda swoich pasażerów - konto KOLEO'
        presenceData.smallImageText = 'Przegląda...'
        if (pathname.startsWith('/my/passengers/new')) {
          presenceData.details = 'Dodaje nowego pasażera - konto KOLEO'
          presenceData.smallImageText = 'Dodaje...'
          presenceData.smallImageKey = Assets.Writing
        }
        else if (pathname.startsWith('/my/passengers/edit')) {
          presenceData.details = 'Edytuje swoich pasażerów - konto KOLEO'
          presenceData.smallImageText = 'Edytuje...'
          presenceData.smallImageKey = Assets.Writing
        }
      }
      else if (pathname.startsWith('/my/finances')) {
        presenceData.details = 'Przegląda środki na swoim koncie KOLEO - konto KOLEO'
        presenceData.smallImageText = 'Przegląda środki...'
        if (
          pathname.startsWith('/my/finances/')
          && !pathname.includes('invoice-details')
          && !pathname.includes('transactions')
        ) {
          let title
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

          const formAmount = document.querySelector<HTMLInputElement>(
            '.form-base .form-input__control',
          )

          presenceData.details = 'Doładowuje środki na swoje konto KOLEO.'
          if (
            formAmount
            && formAmount.getAttribute('inputmode') === 'decimal'
            && !privacySetting
          ) {
            presenceData.state = `Doładowuje konto o ${formAmount.value} przy użyciu ${title}.`
          }
          else {
            presenceData.state = `Przy użyciu ${title}.`
          }
          presenceData.smallImageText = 'Doładowuje konto...'
          presenceData.smallImageKey = ActivityAssets.Buy
        }
        else if (pathname.includes('invoice-details')) {
          presenceData.details = 'Wypełnia dane do faktury - konto KOLEO'
          presenceData.smallImageText = 'Wypełnia...'
          presenceData.smallImageKey = Assets.Writing
        }
        else if (pathname.includes('transactions')) {
          presenceData.details = 'Przegląda swoje transakcje - konto KOLEO'
          presenceData.smallImageText = 'Przegląda...'
        }
      }
      else if (pathname.startsWith('/my/linked-accounts')) {
        presenceData.details = 'Przegląda swoje połączone konta - konto KOLEO'
        presenceData.smallImageText = 'Przegląda...'
      }
      else if (pathname.startsWith('/my/settings')) {
        presenceData.details = 'Wprowadza zmiany w swojich ustawieniach konta - konto KOLEO'
        presenceData.smallImageText = 'Zmienia ustawienia...'
        presenceData.smallImageKey = Assets.Writing
      }
    }
    else if (
      pathname.startsWith('/signin')
      || (pathname.startsWith('/users/auth') && pathname.includes('intent=login'))
    ) {
      presenceData.details = 'Loguje się...'
      presenceData.smallImageText = 'Loguje się...'
      presenceData.smallImageKey = Assets.Writing
    }
    else if (
      pathname.startsWith('/signup')
      || (pathname.startsWith('/users/auth') && pathname.includes('intent=signup'))
    ) {
      presenceData.details = 'Rejestruje się...'
      presenceData.smallImageText = 'Rejestruje się...'
      presenceData.smallImageKey = Assets.Writing
    }
    else if (pathname.startsWith('/kontakt')) {
      presenceData.details = 'Przegląda informacje kontaktowe.'
      presenceData.smallImageText = 'Przegląda informacje...'
      presenceData.smallImageKey = Assets.Viewing
    }
    else if (pathname.startsWith('/privacy_policy')) {
      presenceData.details = 'Czyta politykę prywatności.'
      presenceData.smallImageText = 'Czyta politykę...'
      presenceData.smallImageKey = Assets.Reading
    }
    else if (pathname.startsWith('/media')) {
      presenceData.details = 'Przegląda media KOLEO.'
      presenceData.smallImageText = 'Przegląda media...'
      presenceData.smallImageKey = Assets.Viewing
    }
    else {
      NoPage(presenceData)
    }
  }
  else if (hostname === 'pomoc.koleo.pl') {
    presenceData.name = 'KOLEO - pomoc'
    presenceData.largeImageKey = ActivityAssets.Logo2
    presenceData.smallImageText = 'Przegląda pomoc...'
    presenceData.smallImageKey = Assets.Viewing

    if (
      pathname === '/'
    ) {
      presenceData.details = 'Przegląda pomoc KOLEO.'
    }
    else if (pathname.startsWith('/?s')) {
      presenceData.details = 'Korzysta z wyszukiwarki...'
      if (!privacySetting) {
        presenceData.state = document.querySelector<HTMLInputElement>('#hkb-search')?.value
      }
      presenceData.smallImageText = 'Korzysta z wyszukiwarki...'
      presenceData.smallImageKey = Assets.Search
    }
    else if (pathname.startsWith('/faq')) {
      presenceData.details = 'Przegląda często zadane pytania.'
    }
    else if (pathname.startsWith('/wp-content')) {
      presenceData.details = 'Przegląda pliki.'
    }
    else {
      if (!privacySetting) {
        const articleTitle = document.querySelector('.hkb-article__title')
          || document.querySelector('.entry-header .entry-title')
        const searchTab = document.querySelector<HTMLInputElement>('#hkb-search')
        presenceData.details = `Czyta artykuł${
          articleTitle ? ` - ${articleTitle.textContent}` : '.'
        }`
        if (searchTab && searchTab.value.length > 0) {
          presenceData.state = `Korzysta z wyszukiwarki: ${searchTab.value}`
          presenceData.smallImageText = 'Korzysta z wyszukiwarki...'
          presenceData.smallImageKey = Assets.Search
        }
        presenceData.buttons = [{ label: 'Przeczytaj Artykuł', url: href }]
      }
      else {
        presenceData.details = 'Czyta artykuł.'
      }

      presenceData.smallImageText = 'Czyta artykuł...'
      presenceData.smallImageKey = Assets.Reading
    }
  }
  else if (hostname === ('magazyn.koleo.pl')) {
    presenceData.name = 'KOLEO - magazyn'
    presenceData.largeImageKey = ActivityAssets.Logo2
    presenceData.smallImageKey = Assets.Viewing
    if (
      pathname === '/'
    ) {
      presenceData.details = 'Przegląda artykuły w magazynie KOLEO.'
      presenceData.smallImageText = 'Przegląda artykuły...'
    }
    else if (pathname.startsWith('/o-koleo')) {
      presenceData.details = 'Przegląda informacje o KOLEO.'
      presenceData.smallImageText = 'Przegląda informacje...'
    }
    else if (pathname.startsWith('/author/')) {
      const authorName = document.querySelector('.module-title')
      if (authorName && !privacySetting) {
        presenceData.details = `Przegląda artykuły napisane przez ${authorName.textContent}.`
        presenceData.state = `Ilość artykułów: ${
          document.querySelector('.gridlove-posts')?.children.length
        }`
        presenceData.smallImageText = 'Przegląda profil...'
      }
      else {
        presenceData.details = 'Przegląda artykuły.'
        presenceData.smallImageText = 'Przegląda artykuły...'
      }
    }
    else if (pathname.startsWith('/opinie')) {
      presenceData.details = 'Przegląda opinie ludzi.'
      presenceData.smallImageText = 'Przegląda opinie...'

      const tempOpinion = document.querySelector('rw-popup-review.hydrated')
      if (tempOpinion && !privacySetting) {
        const shadowRootOpinion = tempOpinion.shadowRoot
        const opinionUserElement = shadowRootOpinion?.querySelector(
          '.main .header .info .name',
        )
        const opinionStarsElements = shadowRootOpinion?.querySelectorAll(
          '.main .stat .icon-star',
        )
        const opinionLinkElement = shadowRootOpinion?.querySelector(
          '.main .header .info .channel-link a',
        )

        if (opinionUserElement && opinionStarsElements && opinionLinkElement) {
          presenceData.details = `Przegląda opinię ${opinionUserElement.textContent?.trim()}, który/a ocenił/a KOLEO na ${
            opinionStarsElements.length
          } gwiazdki.`
          presenceData.buttons = [
            {
              label: 'Zobacz Opinię',
              url: opinionLinkElement.getAttribute('href'),
            },
          ]
        }
      }
      else {
        presenceData.details = 'Przegląda opinie ludzi.'
        presenceData.smallImageText = 'Przegląda opinie...'
      }
    }
    else {
      const topicOfPage = document.title.split('›')[0]?.trim()
        || document.querySelector('.entry-header h1.entry-title')?.textContent
      const authorOfPage = document.querySelector(
        '.mks_author_widget .widget-title',
      )?.textContent
      const metaOfPage = document.querySelector('.entry-meta')
      const dateOfPage = metaOfPage?.querySelector('div.meta-date span')?.textContent
      if (authorOfPage) {
        presenceData.details = `Czyta temat${
          !privacySetting ? ` napisany przez ${authorOfPage}` : ''
        }.`
        if (!privacySetting) {
          presenceData.state = [
            topicOfPage,
            dateOfPage,
            metaOfPage?.querySelector('div.meta-rtime')?.textContent,
          ]
            .filter(Boolean)
            .join(' | ')
        }
        presenceData.smallImageText = 'Czyta temat...'
        presenceData.smallImageKey = Assets.Reading
      }
      else {
        presenceData.details = `Przegląda artykuły${
          !privacySetting
            ? ` zawierające ${
              document.querySelector('.module-title h1.h2')?.textContent
            }`
            : ''
        }.`
        if (!privacySetting) {
          presenceData.state = `Ilość artykułów: ${
            document.querySelector('.gridlove-posts')?.children.length
          } | Utworzono: ${dateOfPage}`
        }
        presenceData.smallImageText = 'Przegląda profil przewoźnika...'
      }
      if (!privacySetting)
        presenceData.buttons = [{ label: 'Przeczytaj Artykuł', url: href }]
    }
  }
  else if (hostname === ('travel.koleo.pl')) {
    presenceData.name = 'KOLEO - travel'
    presenceData.largeImageKey = ActivityAssets.Logo2
    presenceData.smallImageKey = Assets.Viewing
    if (pathname === '/') {
      presenceData.details = 'Przegląda travel KOLEO.'
      presenceData.smallImageText = 'Przegląda travel...'
    }
    else {
      const topicOfPage = document.title.split('›')[0]?.trim()
        || document.querySelector('.entry-header h1.entry-title')?.textContent
      if (topicOfPage) {
        const authorOfPage = document.querySelector(
          '.mks_author_widget .widget-title',
        )?.textContent
        const dateOfPage = document.querySelector(
          '.entry-meta div.meta-date span',
        )?.textContent

        if (dateOfPage) {
          presenceData.details = `Czyta informacje${
            authorOfPage && !privacySetting
              ? ` napisane przez ${authorOfPage}`
              : ''
          }...`
          if (!privacySetting) {
            presenceData.state = [topicOfPage, dateOfPage]
              .filter(Boolean)
              .join(' | ')
          }
          presenceData.smallImageText = 'Czyta informacje...'
          presenceData.smallImageKey = Assets.Reading
        }
        else {
          presenceData.details = `Przegląda informacji${
            !privacySetting ? ` o ${topicOfPage.toLowerCase()}` : ''
          }.`
          if (!privacySetting) {
            presenceData.state = `Ilość informacji: ${
              document.querySelector('.gridlove-posts')?.children.length
            }`
          }
          presenceData.smallImageText = 'Przegląda strone kraju...'
        }
        if (!privacySetting) {
          presenceData.buttons = [
            { label: 'Przeczytaj Informacje', url: href },
          ]
        }
      }
      else {
        presenceData.details = 'Przegląda travel KOLEO.'
        presenceData.smallImageText = 'Przegląda travel...'
      }
    }
  }
  else if (hostname === ('sklep.koleo.pl')) {
    presenceData.name = 'KOLEO - sklep'
    presenceData.largeImageKey = ActivityAssets.Logo2
    presenceData.smallImageKey = Assets.Viewing
    if (
      pathname === '/'
    ) {
      presenceData.details = 'Przegląda sklep KOLEO.'
      presenceData.smallImageText = 'Przegląda sklep...'
    }
    else if (pathname.startsWith('/katalog')) {
      const page = document.querySelector('.page-numbers.current')?.textContent
      presenceData.details = 'Przegląda katalog produktów.'
      if (page)
        presenceData.state = `Strona: ${page}`
      presenceData.smallImageText = 'Przegląda katalog...'
      presenceData.buttons = [
        { label: 'Zobacz katalog', url: 'https://sklep.koleo.pl/katalog' },
      ]
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
      const pageNumber = document.querySelector(
        '.page-numbers.current',
      )?.textContent
      presenceData.details = `Przegląda produkty ${
        pathname.startsWith('/marka') ? 'marki' : 'katalogu'
      }${
        !privacySetting
          ? ` - ${
            document.querySelector('.woocommerce-products-header__title')
              ?.textContent
          }`
          : ''
      }.`
      if (pageNumber)
        presenceData.state = `Strona: ${pageNumber}`
      presenceData.smallImageText = 'Przegląda katalog...'
      presenceData.buttons = [{ label: 'Zobacz Katalog', url: href }]
    }
    else if (pathname.startsWith('/passy')) {
      presenceData.details = 'Przegląda dostępne passy.'
      presenceData.smallImageText = 'Przegląda passy...'
      const productTitle = document.querySelector('.product_title')
      if (productTitle) {
        presenceData.details = `Przegląda pass${
          privacySetting ? '' : ` - ${productTitle.textContent}`
        }.`
        presenceData.smallImageText = 'Przegląda pass...'
        if (!privacySetting) {
          presenceData.state = `Cena: ${
            document.querySelector(
              'div.woocommerce-variation-price span.price span.woocommerce-Price-amount.amount bdi',
            )?.textContent
          }`
          presenceData.buttons = [{ label: 'Zobacz Pass', url: href }]
        }
        else {
          presenceData.buttons = [
            { label: 'Zobacz Passy', url: 'https://sklep.koleo.pl/passy' },
          ]
        }
      }
    }
    else if (pathname.startsWith('/koszyk/')) {
      const cartItems = document.querySelectorAll('.cart_item')
      presenceData.details = 'Przegląda swój koszyk.'
      if (!privacySetting) {
        presenceData.state = `${
          cartItems.length > 0
            ? `Ilość produktów w koszyku: ${
              cartItems.length
            } | Cena za wszystko: ${
              document.querySelector('.order-total .woocommerce-Price-amount')
                ?.textContent
            }`
            : 'Nie ma nic w koszyku'
        }`
      }
      presenceData.smallImageText = 'Przegląda koszyk...'
      presenceData.smallImageKey = ActivityAssets.Buy
    }
    else if (pathname.startsWith('/zamowienie')) {
      const cartItems = document.querySelectorAll('.cart_item')

      if (cartItems.length > 0) {
        presenceData.details = 'Realizuje swoje zamówienie.'
        if (!privacySetting) {
          presenceData.state = `Cena za ${
            cartItems.length > 1
              ? `${cartItems.length} produktów`
              : `${cartItems.length} produkt`
          } wynosi ${
            document.querySelector('.order-total .woocommerce-Price-amount bdi')
              ?.textContent
          }`
        }
        presenceData.smallImageText = 'Realizuje zamówienie...'
        presenceData.smallImageKey = ActivityAssets.Buy
      }
      else {
        presenceData.details = 'Przegląda swoje zamówienie.'
        presenceData.smallImageText = 'Przegląda zamówienie...'
        presenceData.smallImageKey = ActivityAssets.Buy
      }
    }
    else if (pathname.startsWith('/moje-konto')) {
      if (document.querySelector('.woocommerce-form-login__submit')) {
        presenceData.details = 'Loguje się do swojego konta KOLEO.'
        presenceData.smallImageText = 'Loguje się...'
        presenceData.smallImageKey = Assets.Writing
      }
      else {
        presenceData.details = 'Przegląda swoje konto KOLEO.'
        presenceData.smallImageText = 'Przegląda konto...'
      }

      if (pathname.startsWith('/moje-konto/lost-password')) {
        presenceData.details = 'Resetuje swoje hasło do konta KOLEO.'
        presenceData.smallImageText = 'Resetuje hasło...'
        presenceData.smallImageKey = Assets.Writing
      }
    }
    else if (pathname.startsWith('/regulamin')) {
      presenceData.details = 'Czyta regulamin sklepu KOLEO.'
      presenceData.smallImageText = 'Czyta regulamin...'
      presenceData.smallImageKey = Assets.Reading
    }
    else if (pathname.startsWith('/polityka-prywatnosci')) {
      presenceData.details = 'Czyta politykę prywatności sklepu KOLEO.'
      presenceData.smallImageText = 'Czyta politykę...'
      presenceData.smallImageKey = Assets.Reading
    }
    else if (pathname.startsWith('/francuska-11a')) {
      presenceData.details = 'Przegląda informacje kontaktowe KOLEO.'
      presenceData.smallImageText = 'Przegląda informacje...'
    }
    else if (pathname.startsWith('/sklep-stacjonarny')) {
      presenceData.details = 'Przegląda informacje o sklepie stacjonarnym KOLEO.'
      presenceData.smallImageText = 'Przegląda informacje...'
    }
    else if (pathname.startsWith('/dostawa')) {
      presenceData.details = 'Przegląda informacje o dostawie w sklepie KOLEO.'
      presenceData.smallImageText = 'Przegląda informacje...'
    }
    else if (pathname.startsWith('/interrail-najczesciej-zadawane-pytania')) {
      presenceData.details = 'Przegląda najczęściej zadawane pytania o bilety Interrail.'
      presenceData.smallImageText = 'Przegląda pytania...'
    }
    else {
      const productTitle = document.querySelector('.product_title')
      if (productTitle) {
        presenceData.details = `Przegląda produkt${
          privacySetting ? '' : ` - ${productTitle.textContent}`
        }.`
        presenceData.smallImageText = 'Przegląda produkt...'
        if (!privacySetting) {
          presenceData.state = `${
            document.querySelector('.pwb-single-product-brands a')
              ? `Marka: ${
                document.querySelector('.pwb-single-product-brands a')
                  ?.textContent
              } | `
              : ''
          }Cena: ${
            document.querySelector('.price span.woocommerce-Price-amount bdi')
              ?.textContent
          }`
          presenceData.buttons = [{ label: 'Zobacz Produkt', url: href }]
        }
        else {
          presenceData.buttons = [
            { label: 'Zobacz Katalog', url: 'https://sklep.koleo.pl/katalog' },
          ]
        }
      }
      else {
        NoPage(presenceData)
      }
    }
  }
  else {
    NoPage(presenceData)
  }

  presence.setActivity(presenceData)
})
