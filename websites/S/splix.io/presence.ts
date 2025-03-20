const presence = new Presence({
  clientId: '640321591108042762',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/splix.io/assets/logo.png',
  }

  if (document.location.pathname === '/') {
    const ui = document.querySelector<HTMLElement>('#playUI')
    if (ui?.style.cssText === 'display: none;') {
      presenceData.startTimestamp = browsingTimestamp
      presenceData.details = 'Getting ready...'
    }
    else {
      presenceData.startTimestamp = browsingTimestamp
      presenceData.details = `${
        document.querySelector('#scoreBlock > span:nth-child(5)')?.textContent
      } ${
        document.querySelector('#scoreBlock > span:nth-child(1)')?.textContent
      }`
      presenceData.state = document.querySelector(
        '#scoreBlock > span:nth-child(7)',
      )?.textContent
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
