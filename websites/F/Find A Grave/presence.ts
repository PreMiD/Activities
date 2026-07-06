import { ActivityType } from 'premid'

const presence = new Presence({
  clientId: '1523013008702570607',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const strings = await presence.getStrings({
    browsingMemorials: 'find_a_grave.browsingMemorials',
    browsingCemeteries: 'find_a_grave.browsingCemeteries',
    searchingMemorials: 'general.search',
    browsingHome: 'general.viewHome',
    recentlyAdded: 'find_a_grave.recentlyAdded',
    famousMemorials: 'find_a_grave.famousMemorials',
    newListings: 'find_a_grave.newListings',
    necrology: 'find_a_grave.necrology',
    interestingMonument: 'find_a_grave.interestingMonument',
    interestingEpitaph: 'find_a_grave.interestingEpitaph',
    contribute: 'find_a_grave.contribute',
  })

  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/F/Find%20A%20Grave/assets/logo.png',
    startTimestamp: browsingTimestamp,
    type: ActivityType.Watching,
  }

  const path = document.location.pathname

  if (path.includes('/memorial/recently-added')) {
    presenceData.details = strings.recentlyAdded
  }
  else if (path.includes('/memorial/')) {
    let name = document.querySelector('h1.memorial-name')?.textContent
      ?? document.querySelector('h1')?.textContent
      ?? 'Memorial'
    const dates = document.querySelector('.memorial-dates')?.textContent?.trim() ?? ''

    name = name.replace(/\s+/g, ' ').trim()

    name = name
      .replace(/Memoriais famosos/gi, '')
      .replace(/Famous Memorials?/gi, '')
      .replace(/Veterano\(a\)/gi, '')
      .replace(/Veteran/gi, '')
      .replace(/\s+/g, ' ')
      .trim()

    presenceData.details = name
    presenceData.state = dates ? `${strings.browsingMemorials} • ${dates}` : strings.browsingMemorials
  }
  else if (path.includes('/memorial') || path.includes('/search')) {
    const query = new URLSearchParams(document.location.search).get('firstname')
      ?? new URLSearchParams(document.location.search).get('lastname')
      ?? ''

    presenceData.details = strings.searchingMemorials
    if (query) {
      presenceData.state = `"${query}"`
    }
  }
  else if (path.includes('/cemetery')) {
    const name = document.querySelector('h1')?.textContent?.trim() ?? ''

    presenceData.details = strings.browsingCemeteries
    if (name && !path.endsWith('/cemetery') && !path.endsWith('/cemetery/')) {
      presenceData.state = name
    }
  }
  else if (path.includes('/contribute')) {
    presenceData.details = strings.contribute
  }
  else if (path.includes('/famous-memorial')) {
    presenceData.details = strings.famousMemorials
  }
  else if (path.includes('/new-listings')) {
    presenceData.details = strings.newListings
  }
  else if (path.includes('/necrology')) {
    presenceData.details = strings.necrology
  }
  else if (path.includes('/interesting-monument')) {
    presenceData.details = strings.interestingMonument
  }
  else if (path.includes('/interesting-epitaph')) {
    presenceData.details = strings.interestingEpitaph
  }
  else {
    presenceData.details = strings.browsingHome
  }

  presence.setActivity(presenceData)
})
