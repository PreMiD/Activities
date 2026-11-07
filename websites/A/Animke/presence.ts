const presence = new Presence({
  clientId: '1568585652734402693',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://i.imgur.com/vI5Sgsv.png',
    details: 'Bakınıyor',
    startTimestamp: browsingTimestamp,
  }

  presence.setActivity(presenceData)
})