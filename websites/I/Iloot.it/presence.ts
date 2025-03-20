const presence = new Presence({
  clientId: '660822610090655755',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/I/Iloot.it/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  if (document.location.hostname === 'iloot.it') {
    presenceData.details = 'The gamer earning platform'
    if (document.location.pathname.includes('/partners'))
      presenceData.details = 'Looking At Partner Page'
    else if (document.location.pathname.includes('/login'))
      presenceData.details = 'Loging To Iloot.it'
    else if (document.location.pathname.includes('/register'))
      presenceData.details = 'Registering At Iloot.it'
    else if (document.location.pathname.includes('/profile'))
      presenceData.details = 'Looking At Own Profile'
    else if (document.location.pathname.includes('/minilinks'))
      presenceData.details = 'Creating Minilinks'
    else if (document.location.pathname.includes('/watch_advertisements'))
      presenceData.details = 'Watching Advertisements'
    else if (document.location.pathname.includes('/captcha'))
      presenceData.details = 'Filling Captchers'
    else if (document.location.pathname.includes('/payout'))
      presenceData.details = 'Looking At Payout Page'
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
