import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1399774169536921660',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://imgur.com/pjywsu6.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,

  }

  const { pathname } = document.location

  switch (true) {
    case pathname.endsWith(''): {
      presenceData.details = 'Viewing home page'
      presenceData.smallImageKey = Assets.Reading
      break
    }
    case pathname.endsWith('/terms-of-service'): {
      presenceData.details = 'Reading terms of service'
      presenceData.smallImageKey = Assets.Reading
      break
    }
    case pathname.endsWith('/privacy-policy'): {
      presenceData.details = 'Reading privacy policy'
      presenceData.smallImageKey = Assets.Reading
      break
    }
    case pathname.endsWith('/profile'): {
      presenceData.details = 'Viewing a profile'
      break
    }
    case pathname.endsWith('/invite'): {
      presenceData.details = 'Viewing an invite'
      break
    }
    case pathname.endsWith('/panais-canary/servers'): {
      presenceData.details = 'Viewing the dashboard'
      break
    }
  }
  presence.setActivity(presenceData)
})
