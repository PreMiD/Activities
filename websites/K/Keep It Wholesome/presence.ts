const presence = new Presence({
  clientId: '748255086286733442',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    details: 'Keep It Wholesome',
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/K/Keep%20It%20Wholesome/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  if (document.location.pathname === '/' || !document.location.pathname) {
    presenceData.state = 'Home | Shop'

    delete presenceData.details
  }
  else if (document.location.pathname.startsWith('/blogs/our-impact')) {
    presenceData.state = 'Our Impact'

    delete presenceData.details
  }
  else if (document.location.pathname.startsWith('/pages/about-us')) {
    presenceData.state = 'About'

    delete presenceData.details
  }
  else if (document.location.pathname.startsWith('/pages/podcast')) {
    presenceData.state = 'Checking the Podcast'

    delete presenceData.details
  }
  else if (document.location.pathname === '/cart') {
    presenceData.state = 'In cart'

    delete presenceData.details
  }
  else if (document.location.pathname.startsWith('/collections')) {
    presenceData.state = 'Collections'

    delete presenceData.details
  }

  presence.setActivity(presenceData)
})
