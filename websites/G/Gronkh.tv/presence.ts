import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1396486294779068416',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets { // Other default assets can be found at index.d.ts
  Logo = 'https://i.imgur.com/rZooYzo.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    // smallImageKey: Assets.Play,
  }

  presence.setActivity(presenceData)
})
