import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1408180664670359673',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://authsrng.xyz/assets/favicons/android-chrome-512x512.png',
}

presence.on('UpdateData', async () => {
  const { pathname } = document.location

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    smallImageKey: Assets.Play,
    startTimestamp: browsingTimestamp,
    details: 'auth\'s RNG',
  }

  if (pathname.includes('leaderboard')) {
    presenceData.state = 'viewing leaderboard'
  }
  else if (pathname.includes('profile')) {
    presenceData.state = 'viewing profile'
  }
  else if (pathname.includes('credits')) {
    presenceData.state = 'viewing credits'
  }
  else {
    presenceData.state = 'playing'
  }

  presence.setActivity(presenceData)
})