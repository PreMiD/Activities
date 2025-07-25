import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1241561240933765240',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets { // Other default assets can be found at index.d.ts
  Logo = 'teaclient',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    smallImageKey: Assets.Viewing,
    details: 'Browsing TeaClient',
  }

  presence.setActivity(presenceData)
})
