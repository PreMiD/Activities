const presence = new Presence({
  clientId: '819865300173324288',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/D/DiscordJS%20Guide/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  presenceData.details = 'Viewing Docs'
  presenceData.state = `Page: ${document
    .querySelectorAll('h1')[0]
    ?.textContent
    ?.replace('#', '')}`

  if (!presenceData.details)
    presence.setActivity()
  else presence.setActivity(presenceData)
})
