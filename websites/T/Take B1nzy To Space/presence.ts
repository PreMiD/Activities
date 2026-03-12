const presence = new Presence({
  clientId: '735314055861895288',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/T/Take%20B1nzy%20To%20Space/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  presenceData.details = `Playing ${
    document.querySelector('#song')?.textContent
  }`
  presenceData.state = `Ratelimited for ${
    document.querySelector('#ratelimited-time')?.textContent
  }s`
  presence.setActivity(presenceData)
})
