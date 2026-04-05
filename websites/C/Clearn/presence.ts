const presence = new Presence({
  clientId: '1490167907068674189',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://imgur.com/vQmQSrT.png',
  SmallLogo = 'https://imgur.com/03fGXs3.png'
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    smallImageKey: ActivityAssets.SmallLogo,
    details: "Coding on Clearn",
  }

  presence.setActivity(presenceData)
})
