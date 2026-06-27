import { ActivityType } from 'premid'

const presence = new Presence({
  clientId: '1495991942297682011',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
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

    presenceData.details = `${await presence.getStrings('browsingMemorials')}: ${name}`
    presenceData.state = dates || 'Find A Grave'
  }
  else if (path.includes('/cemetery/')) {
    const name = document.querySelector('h1')?.textContent?.trim() ?? 'Cemitério'

    presenceData.details = await presence.getStrings('browsingCemeteries')
    presenceData.state = name
  }
  else if (path.includes('/memorial') || path.includes('/search')) {
    const query = new URLSearchParams(document.location.search).get('firstname')
      ?? new URLSearchParams(document.location.search).get('lastname')
      ?? ''

    presenceData.details = await presence.getStrings('searchingMemorials')
    presenceData.state = query ? `"${query}"` : 'Find A Grave'
  }
  else {
    presenceData.details = await presence.getStrings('browsingHome')
  }

  presence.setActivity(presenceData)
})
