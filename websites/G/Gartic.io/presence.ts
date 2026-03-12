const presence = new Presence({
  clientId: '808668919635247104',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/G/Gartic.io/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const path = document.location.pathname
  if (path === '/') {
    presenceData.details = 'Viewing the Homepage'
  }
  else if (path === '/rooms') {
    presenceData.details = 'Viewing Rooms'
  }
  else if (
    document.location.pathname.split('/')[1]?.match(/^\d/)
    || path === '/room'
  ) {
    if (document.querySelector('.infosUsers')) {
      presenceData.details = 'Setting up Info to Join'
      presenceData.state = `Players: ${
        document.querySelector('.infosRoom li:last-child span strong')
          ?.textContent
      }`
    }
    else {
      presenceData.details = `${
        document.querySelector('.you .nick')?.textContent
      } - ${document
        .querySelector('.you .points')
        ?.textContent
        ?.split('pts')[0]
        ?.trim()} points`
      presenceData.state = `Lobby: ${
        document.querySelector('title')?.textContent?.split('-')[0]
      }`
    }
  }
  else {
    presenceData.details = 'Somewhere on-site'
  }

  presence.setActivity(presenceData)
})
