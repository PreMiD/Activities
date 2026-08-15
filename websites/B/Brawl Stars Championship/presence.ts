import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '503557087041683458',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.imgur.com/ByIrt2V.png',
}

presence.on('UpdateData', async () => {
  const { pathname } = document.location

  if (!pathname.includes('/brawlstars')) {
    presence.clearActivity()
    return
  }

  const privacy = await presence.getSetting<boolean>('privacy')

  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: ActivityAssets.Logo,
    largeImageText: 'Brawl Stars Championship',
    startTimestamp: browsingTimestamp,
  }

  if (privacy) {
    presenceData.details = 'Browsing...'
    presenceData.state = 'Brawl Stars Championship'
    presence.setActivity(presenceData)
    return
  }

  if (pathname.includes('/live')) {
    presenceData.details = 'Watching Live Stream'
    presenceData.state = 'Brawl Stars Championship'
    presenceData.smallImageKey = Assets.Live
    presenceData.smallImageText = 'Live'
  }
  else {
    presenceData.details = 'Browsing Event Hub'
    presenceData.state = 'Brawl Stars Championship'
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = 'Browsing'
  }

  presence.setActivity(presenceData)
})
