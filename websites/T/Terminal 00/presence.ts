const presence = new Presence({
  clientId: '701863684728946799',
})
const elapsed = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/T/Terminal%2000/assets/logo.png',
    startTimestamp: elapsed,
    details: location.href.split(location.host)[1],
  }

  if (
    location.pathname === '/'
    || location.href.split(location.host)[1]?.toLowerCase() === '/index'
  ) {
    presenceData.details = '/index'
  }

  presence.setActivity(presenceData)
})
