import { ActivityType } from 'premid'

const presence = new Presence({
  clientId: '1396393095100104785',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.imgur.com/zfq8ohe.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    details: 'Browsing other pages...',
    // smallImageKey: Assets.Play,
    type: ActivityType.Watching
  }
  switch (document.location.hostname) {
    case 'book.sfacg.com': {
      presenceData.details = 'SFACG'
      presenceData.state = 'Watching home page'
      presenceData.startTimestamp = browsingTimestamp
      break
    }
  }
  presence.setActivity(presenceData)
})
