const presence = new Presence({
  clientId: '636654506607771680',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/R/RL%20Insider/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  if (document.location.pathname === '/') {
    presenceData.details = 'Viewing the home page'
  }
  else if (document.location.pathname.includes('/search')) {
    presenceData.details = 'Searching an item'
  }
  else if (document.location.pathname.includes('/rocketpass')) {
    presenceData.details = 'Viewing the rocket pass'
  }
  else if (document.location.pathname.includes('/about')) {
    presenceData.details = 'Viewing the about page'
  }
  else if (document.querySelector('#itemNameSpan')) {
    presenceData.details = 'Viewing item:'
    presenceData.state = document.querySelector('#itemNameSpan')?.textContent
  }
  else {
    presenceData.details = 'Viewing the price changes'
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
