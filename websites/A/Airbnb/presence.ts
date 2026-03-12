const presence = new Presence({
  clientId: '993151156652093480',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/A/Airbnb/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const privacy = await presence.getSetting('privacy')
  const { pathname, href } = document.location

  if (pathname.includes('/rooms')) {
    if (privacy) {
      presenceData.details = 'Viewing a room '
    }
    else {
      presenceData.details = 'Viewing a room'
      presenceData.state = document.querySelector(
        '#site-content > div > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div > div > div > div > section > div._b8stb0 > span > h1',
      )?.textContent
      presenceData.buttons = [{ label: 'View Room', url: href }]
    }
  }
  else if (pathname.includes('/book')) {
    if (privacy) {
      presenceData.details = 'Booking a room'
    }
    else {
      presenceData.details = `Booking ${
        document.querySelector('#LISTING_CARD-title')?.textContent
      }`
      presenceData.state = `From ${
        document.querySelector(
          '[data-plugin-in-point-id="DATE_PICKER"] > div > div > div._b7b6bk > div._1qyi2pa > div._jbk4n3',
        )?.textContent
      } for ${
        document.querySelector(
          '[data-plugin-in-point-id="GUEST_PICKER"] > div > div > div._b7b6bk > div._1qyi2pa > div._jbk4n3',
        )?.textContent
      }`
      presenceData.buttons = [{ label: 'View Booking Details', url: href }]
    }
  }
  else if (pathname.includes('/inbox')) {
    presenceData.details = 'Viewing Messages'
  }
  else if (pathname.includes('notifications')) {
    presenceData.details = 'Viewing Notifications'
  }
  else if (pathname.includes('wishlists')) {
    presenceData.details = 'Viewing wishlists'
  }
  else if (pathname.includes('split-stays')) {
    presenceData.details = 'Viewing a split stay'
  }
  else if (pathname.includes('/account')) {
    presenceData.details = 'Viewing account details'
  }
  else {
    presenceData.details = 'Browsing'
  }

  presence.setActivity(presenceData)
})
