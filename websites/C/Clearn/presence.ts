import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1490167907068674189',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://imgur.com/vQmQSrT.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    smallImageKey: "https://imgur.com/03fGXs3.png",
    details: "Coding on Clearn"
  }

  presence.setActivity(presenceData)
})
