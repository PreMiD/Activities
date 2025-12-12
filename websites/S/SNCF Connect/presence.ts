const presence = new Presence({
  clientId: '1415252544141398067',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.imgur.com/ubNQ6eP.png',
  Train = 'https://i.imgur.com/l9Qlmi4.png',
}

let origin, originTime, destination, destinationTime

presence.on('UpdateData', async () => {
  const privacy = await presence.getSetting<boolean>('privacy')

  const strings = await presence.getStrings({
    arrival: 'sncfconnect.arrival',
    departure: 'sncfconnect.departure',
    destination: 'sncfconnect.destination',
    home: 'general.viewHome',
    origin: 'sncfconnect.origin',
    payingTickets: 'sncfconnect.payingTickets',
    rateInbound: 'sncfconnect.rateInbound',
    rateOutbound: 'sncfconnect.rateOutbound',
    ratesInbound: 'sncfconnect.ratesInbound',
    ratesOutbound: 'sncfconnect.ratesOutbound',
    searchingItineraries: 'sncfconnect.searchingItineraries',
    searchingItinerariesInterstitial: 'sncfconnect.searchingItinerariesInterstitial',
    searchingItinerariesToALocation: 'sncfconnect.searchingItinerariesToALocation',
    viewPage: 'general.viewPage',
    viewingADepartureTimes: 'sncfconnect.viewingADepartureTimes',
    viewingAnArrivalTimes: 'sncfconnect.viewingAnArrivalTimes',
    viewingArrivalTimes: 'sncfconnect.viewingArrivalTimes',
    viewingCart: 'sncfconnect.viewingCart',
    viewingDepartureTimes: 'sncfconnect.viewingDepartureTimes',
    viewingDetailsOfAnItinerary: 'sncfconnect.viewingDetailsOfAnItinerary',
    viewingDetailsOfATicket: 'sncfconnect.viewingDetailsOfATicket',
    viewingDetailsOfTheItinerary: 'sncfconnect.viewingDetailsOfTheItinerary',
    viewingDetailsOfTheTicket: 'sncfconnect.viewingDetailsOfTheTicket',
    viewingStationTimetables: 'sncfconnect.viewingStationTimetables',
    viewingTickets: 'sncfconnect.viewingTickets',
    viewingTrafficInfo: 'sncfconnect.viewingTrafficInfo',
  })

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  const path = document.location.pathname

  if (path === '/' || /^\/[a-z]{2}-[a-z]{2}$/.test(path)) {
    presenceData.details = strings.home
  }
  else if (path?.includes('/interstitiel')) {
    presenceData.details = strings.searchingItinerariesInterstitial
  }
  else if (path?.includes('/search/od')) {
    [origin, destination] = document.querySelectorAll<HTMLInputElement>('input.MuiInputBase-input')
    presenceData.details = privacy ? strings.searchingItinerariesToALocation : strings.searchingItineraries
    presenceData.state = privacy ? '' : `${strings.departure?.replace('{0}', origin?.value || 'noData')} • ${strings.arrival?.replace('{0}', destination?.value || 'noData')}`
  }
  else if (path?.includes('/doorToDoor/itineraries')) {
    [origin, destination] = document.querySelectorAll('[data-test="place"]');
    [originTime, destinationTime] = document.querySelectorAll('[data-test="time-label"]')
    presenceData.details = privacy ? strings.viewingDetailsOfAnItinerary : strings.viewingDetailsOfTheItinerary
    presenceData.state = privacy ? '' : `${strings.departure?.replace('{0}', origin?.textContent?.trim() || 'noData')} (${originTime?.textContent?.trim() || 'noData'}) • ${strings.arrival?.replace('{0}', destination?.textContent?.trim() || 'noData')} (${destinationTime?.textContent?.trim() || 'noData'})`
  }
  else if (path?.includes('/shop/results/outward')) {
    [origin, destination] = document.querySelectorAll('[data-test="place"]');
    [originTime, destinationTime] = document.querySelectorAll('[data-test="time-label"]')
    const outboundSelected = document.querySelector('.MuiDrawer-modal')
    if (outboundSelected) {
      presenceData.details = privacy ? strings.ratesOutbound : strings.rateOutbound
      presenceData.state = privacy ? '' : `${strings.departure?.replace('{0}', origin?.textContent?.trim() || 'noData')} (${originTime?.textContent?.trim() || 'noData'}) • ${strings.arrival?.replace('{0}', destination?.textContent?.trim() || 'noData')} (${destinationTime?.textContent?.trim() || 'noData'})`
    }
    else {
      presenceData.details = strings.ratesOutbound
    }
  }
  else if (path?.includes('/shop/results/inward')) {
    [origin, destination] = document.querySelectorAll('[data-test="place"]');
    [originTime, destinationTime] = document.querySelectorAll('[data-test="time-label"]')
    const inboundSelected = document.querySelector('.MuiDrawer-modal')
    if (inboundSelected) {
      presenceData.details = privacy ? strings.ratesInbound : strings.rateInbound
      presenceData.state = privacy ? '' : `${strings.departure?.replace('{0}', origin?.textContent?.trim() || 'noData')} (${originTime?.textContent?.trim() || 'noData'}) • ${strings.arrival?.replace('{0}', destination?.textContent?.trim() || 'noData')} (${destinationTime?.textContent?.trim() || 'noData'})`
    }
    else {
      presenceData.details = strings.ratesInbound
    }
  }
  else if (path?.includes('/cart') && !path?.includes('/catalogue')) {
    presenceData.details = strings.viewingCart
  }
  else if (path?.includes('/payment') && !path?.includes('/account')) {
    presenceData.details = strings.payingTickets
  }
  else if (path?.includes('/trips/detail')) {
    presenceData.details = privacy ? strings.viewingDetailsOfATicket : strings.viewingDetailsOfTheTicket
    presenceData.state = privacy ? '' : document.querySelector('main h1')?.textContent || 'noData'
  }
  else if (path?.includes('/trips')) {
    presenceData.details = strings.viewingTickets
  }
  else if (path?.includes('/trafficInfo')) {
    const categorySelected = document.querySelector('button[aria-selected="true"]')
    const ileDeFranceSelect = document.querySelector('button[aria-pressed="true"]')
    const regionSelect = document.querySelector('span.Mui-checked')?.previousElementSibling
    presenceData.details = strings.viewingTrafficInfo
    presenceData.state = privacy ? '' : `${categorySelected?.textContent?.trim() || 'noData'}`
    if (ileDeFranceSelect) {
      presenceData.state += privacy ? '' : ` • ${ileDeFranceSelect?.getAttribute('aria-label') || 'noData'}`
    }
    else if (regionSelect) {
      presenceData.state += privacy ? '' : ` • ${regionSelect?.textContent?.trim() || 'noData'}`
    }
  }
  else if (path?.includes('/station-timetable/results')) {
    const trainInfos = document.querySelector('#modal-header-title')
    const departureTabSelected = document.querySelector('button#tab-departures[aria-selected="true"]')
    presenceData.details = privacy ? (departureTabSelected ? strings.viewingADepartureTimes : strings.viewingAnArrivalTimes) : (departureTabSelected ? strings.viewingDepartureTimes : strings.viewingArrivalTimes)
    presenceData.state = privacy ? '' : document.querySelector('main h1')?.textContent || 'noData'
    if (trainInfos && !privacy) {
      const stations = document.querySelectorAll('div[aria-labelledby="modal-header-title"] ul[role="list"]:last-child li span[data-test="timeline-station"]')
      const arrivalStation = document.querySelectorAll('div[aria-labelledby="modal-header-title"] ul[role="list"]:last-child li div[data-test="timeline-departure-time"] span')
      if (departureTabSelected) {
        presenceData.state += ` • ${trainInfos.textContent?.trim() || 'noData'} | ${strings.destination.replace('{0}', stations[stations.length - 1]?.textContent?.trim() || 'noData')} (${arrivalStation[arrivalStation.length - 1]?.textContent?.trim() || 'noData'})`
      }
      else {
        presenceData.state += ` • ${trainInfos.textContent?.trim() || 'noData'} | ${strings.origin.replace('{0}', stations[0]?.textContent?.trim() || 'noData')} (${arrivalStation[0]?.textContent?.trim() || 'noData'})`
      }
      presenceData.smallImageKey = ActivityAssets.Train
    }
  }
  else if (path?.includes('/station-timetable')) {
    presenceData.details = strings.viewingStationTimetables
  }
  else {
    presenceData.details = strings.viewPage
    presenceData.state = document.title?.split(/SNCF Connect [-|]/)[1]?.trim() || document.title?.split(/[-|] SNCF Connect/)[0]?.trim() || document.title
  }

  presence.setActivity(presenceData)
})
