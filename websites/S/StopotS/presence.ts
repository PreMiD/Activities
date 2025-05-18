const presence = new Presence({
  clientId: '503557087041683458',
})
const elapsed = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/StopotS/assets/logo.png',
    startTimestamp: elapsed,
    name: 'StopotS',
  }
  const path = document.location.pathname
  if (document.querySelector('.ctUsers')) {
    presenceData.details = `${
      document.querySelector('.you .nick')?.textContent
    } - ${document
      .querySelector('.you span')
      ?.textContent
      ?.split('pts')[0]
      ?.trim()} points`
    presenceData.state = `${'Round: ' + ' '}${
      document.querySelector('.rounds span')?.textContent
    }${document.querySelector('.rounds p:nth-child(3)')?.textContent}`
  }
  else if (path === '/create') {
    presenceData.details = 'Creating a Room'
  }
  else if (path === '/search') {
    presenceData.details = 'Viewing Rooms'
  }
  else {
    presenceData.details = 'Not in-game'
  }

  presence.setActivity(presenceData)
})
