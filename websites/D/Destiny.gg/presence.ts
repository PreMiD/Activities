import { Assets } from 'premid'

const browsingTimestamp = Math.floor(Date.now() / 1000)
const presence = new Presence({
  clientId: '759921592926339072',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/D/Destiny.gg/assets/logo.png',
  SmallImage = 'https://cdn.rcd.gg/PreMiD/websites/D/Destiny.gg/assets/0.png',
  Money = 'https://cdn.rcd.gg/PreMiD/websites/D/Destiny.gg/assets/1.png',
  Profile = 'https://cdn.rcd.gg/PreMiD/websites/D/Destiny.gg/assets/2.png',
  Chat = 'https://cdn.rcd.gg/PreMiD/websites/D/Destiny.gg/assets/3.png',
}
presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    smallImageKey: ActivityAssets.SmallImage,
    startTimestamp: browsingTimestamp,
  }

  if (
    document.location.pathname === '/'
    || document.location.pathname === '/home/'
  ) {
    presenceData.details = 'Viewing the homepage.'
  }
  else if (document.location.pathname.includes('/bigscreen')) {
    presenceData.details = 'Watching Destiny.'
    presenceData.smallImageKey = Assets.Play
  }
  else if (document.location.pathname.includes('/donate')) {
    presenceData.details = 'Donating to Destiny.'
    presenceData.smallImageKey = ActivityAssets.Money
  }
  else if (document.location.pathname.includes('/subscribe')) {
    presenceData.details = 'Subscribing to Destiny.'
    presenceData.smallImageKey = ActivityAssets.Money
  }
  else if (document.location.pathname.includes('/profile')) {
    presenceData.details = 'Editing D.gg profile.'
    presenceData.smallImageKey = ActivityAssets.Profile
  }
  else if (document.location.pathname.includes('/embed/chat')) {
    presenceData.details = 'Chatting'
    presenceData.smallImageKey = ActivityAssets.Chat
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
