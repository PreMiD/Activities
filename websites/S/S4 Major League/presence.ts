import { Assets } from 'premid'

const presence = new Presence({
  clientId: '155779975455191184'
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://s4ml.club/favicon.png',
    details: 'Playing Major League on Xero',
    state: 'www.s4ml.club',
    startTimestamp: Math.floor(Date.now() / 1000),
    buttons: [
      {
        label: 'Join S4ML',
        url: 'https://www.s4ml.club'
      }
    ]
  }

  presence.setActivity(presenceData)
})
