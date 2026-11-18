import { Assets } from 'premid'

const presence = new Presence({
  clientId: '000000000000000000',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: Assets.Search,
    details: 'Browsing Dojo',
    startTimestamp: browsingTimestamp,
  }

  presence.setActivity(presenceData)
})
