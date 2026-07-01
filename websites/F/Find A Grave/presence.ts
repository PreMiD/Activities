import { ActivityType } from 'premid'

const presence = new Presence({
  clientId: '1495991942297682011',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  // Busca todas as traduções de uma vez seguindo a documentação oficial
  const strings = await presence.getStrings({
    browsingMemorials: 'find_a_grave.browsingMemorials',
    browsingCemeteries: 'find_a_grave.browsingCemeteries',
    searchingMemorials: 'find_a_grave.searchingMemorials',
    browsingHome: 'find_a_grave.browsingHome'
  })

  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/F/Find%20A%20Grave/assets/logo.png',
    startTimestamp: browsingTimestamp,
    type: ActivityType.Watching,
  }

  const path = document.location.pathname

  if (path.includes('/memorial/')) {
    const name = document.querySelector('h1.memorial-name')?.textContent?.trim()
      ?? document.querySelector('h1')?.textContent?.trim()
      ?? 'Memorial'
    const dates = document.querySelector('.memorial-dates')?.textContent?.trim() ?? ''

    presenceData.details = `${strings.browsingMemorials}: ${name}`
    presenceData.state = dates || 'Find A Grave'
  }
  else if (path.includes('/cemetery/')) {
    const name = document.querySelector('h1')?.textContent?.trim() ?? 'Cemitério'

    presenceData.details = strings.browsingCemeteries
    presenceData.state = name
  }
  else if (path.includes('/memorial') || path.includes('/search')) {
    const query = new URLSearchParams(document.location.search).get('firstname')
      ?? new URLSearchParams(document.location.search).get('lastname')
      ?? ''

    presenceData.details = strings.searchingMemorials
    presenceData.state = query ? `"${query}"` : 'Find A Grave'
  }
  else {
    presenceData.details = strings.browsingHome
  }

  presence.setActivity(presenceData)
})
