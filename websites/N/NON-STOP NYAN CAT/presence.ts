const presence = new Presence({
  clientId: '631039621656084480',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/N/NON-STOP%20NYAN%20CAT/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  if (
    document.location.pathname === '/'
    || document.location.pathname.startsWith('/index.php')
  ) {
    presenceData.details = 'Nyaning'
  }
  else if (document.location.pathname === '/credits.php') {
    presenceData.details = 'Looking at the credits'
    presenceData.state = '...and probably nyaning'
  }
  else if (document.location.pathname === '/stats.php') {
    presenceData.details = 'Looking at their stats'
    presenceData.state = '...and probably nyaning'
  }
  presence.setActivity(presenceData)
})
