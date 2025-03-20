const presence = new Presence({
  clientId: '685054359200858241',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/D/Defly.io/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  if (document.location.pathname.includes('/gamemode-rules')) {
    presenceData.details = 'Viewing the game rules'
  }
  else if (document.location.pathname.includes('/changelog')) {
    presenceData.details = 'Viewing the change log'
  }
  else if (document.location.pathname === '/') {
    if (document.location.href.includes('#0')) {
      presenceData.details = 'Playing FFA mode'
      presenceData.state = `on server: ${document.location.href.split('#')[1]}`
    }
    else if (document.location.href.includes('#1')) {
      presenceData.details = 'Playing TEAM mode'
      presenceData.state = `on server: ${document.location.href.split('#')[1]}`
    }
    else if (document.location.href.includes('#2')) {
      presenceData.details = 'Playing DEFUSE mode'
      presenceData.state = `on server: ${document.location.href.split('#')[1]}`
    }
    else if (document.location.href.includes('#3')) {
      presenceData.details = 'Playing E-FFA mode'
      presenceData.state = `on server: ${document.location.href.split('#')[1]}`
    }
    else {
      presenceData.details = 'Viewing home page'
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
