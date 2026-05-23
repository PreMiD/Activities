const presence = new Presence({
  clientId: '993496501886136371',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

async function getStrings() {
  return presence.getStrings({
    buttonViewDirections: 'googlemaps.buttonViewDirections',
    buttonViewPlace: 'googlemaps.buttonViewPlace',
    searchingForAPlace: 'googlemaps.searchingForAPlace',
    searchingForPlace: 'googlemaps.searchingForPlace',
    viewingAPlace: 'googlemaps.viewingAPlace',
    viewingDirections: 'googlemaps.viewingDirections',
    viewingDirectionsToALocation: 'googlemaps.viewingDirectionsToALocation',
    viewingMap: 'googlemaps.viewingMap',
    viewingPlace: 'googlemaps.viewingPlace',
  })
}

function placeURISeparator(str: string) {
  return str.replace(/\+/g, ' ')
}

presence.on('UpdateData', async () => {
  const privacy = await presence.getSetting('privacy')
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/G/Google%20Maps/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const strings = await getStrings()
  if (document.location.pathname.includes('/place')) {
    if (privacy) {
      presenceData.details = strings.viewingAPlace
    }
    else {
      const place = document.location.href
      const indexes = []
      for (const [index, element] of Array.from(place).entries()) {
        if (element === '/')
          indexes.push(index)
      }

      presenceData.details = strings.viewingPlace
      presenceData.state = decodeURIComponent(placeURISeparator(place.substring(indexes[4]! + 1, indexes[5])))
      presenceData.buttons = [
        { label: strings.buttonViewPlace, url: document.location.href },
      ]
    }
  }
  else if (document.location.pathname.includes('/dir')) {
    if (privacy) {
      presenceData.details = strings.viewingDirectionsToALocation
    }
    else {
      presenceData.details = strings.viewingDirections
      let from, destination
      if (!document.querySelector('#sb_ifc50 > input')) {
        from = document
          .querySelector('#sb_ifc51 > input')
          ?.getAttribute('aria-label')
        destination = document
          .querySelector('#sb_ifc52 > input')
          ?.getAttribute('aria-label')
      }
      else {
        from = document
          .querySelector('#sb_ifc50 > input')
          ?.getAttribute('aria-label')
        destination = document
          .querySelector('#sb_ifc51 > input')
          ?.getAttribute('aria-label')
      }
      presenceData.state = `${from}, ${destination}`
      presenceData.buttons = [
        { label: strings.buttonViewDirections, url: document.location.href },
      ]
    }
  }
  else if (document.location.pathname.includes('/search')) {
    if (privacy) {
      presenceData.details = strings.searchingForAPlace
    }
    else {
      const search = document.location.href
      const indexes = []
      for (const [index, element] of Array.from(search).entries()) {
        if (element === '/')
          indexes.push(index)
      }

      presenceData.details = strings.searchingForPlace
      presenceData.state = decodeURIComponent(placeURISeparator(search.substring(indexes[4]! + 1, indexes[5])))
    }
  }
  else {
    presenceData.details = strings.viewingMap
  }

  presence.setActivity(presenceData)
})
