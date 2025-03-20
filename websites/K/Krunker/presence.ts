const presence = new Presence({
  clientId: '631970829348896769',
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/K/Krunker/assets/logo.png',
  }
  const gameInfo = document.querySelector('#curGameInfo')

  if (gameInfo) {
    presenceData.details = gameInfo.textContent?.replace('on ', ' on ')
    presenceData.state = `${
      document.querySelector('#menuClassName')?.textContent
    } (${document.querySelector('#menuClassSubtext')?.textContent})`
    presenceData.startTimestamp = Date.now()

    presence.setActivity(presenceData)
  }
  else {
    presenceData.details = 'In the menus'
    presenceData.startTimestamp = Date.now()

    presence.setActivity(presenceData)
  }
})
