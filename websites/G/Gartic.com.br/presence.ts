const presence = new Presence({
  clientId: '808757125747966032',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/G/Gartic.com.br/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  if (document.location.pathname.split('/')[1]?.match(/^\d/)) {
    presenceData.details = `${
      document.querySelector('div.user.proprio .dados span')?.textContent
    } - ${document
      .querySelector('div.user.proprio .dados pre')
      ?.textContent
      ?.split('pontos')[0]
      ?.trim()} points`
    presenceData.state = `Lobby: ${
      document.querySelector('title')?.textContent?.split('-')[0]
    }`
  }
  else {
    presenceData.details = 'Not in-game'
  }

  presence.setActivity(presenceData)
})
