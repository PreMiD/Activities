import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1408180664670359673',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/A/auth%27s%20RNG/assets/logo.png',
}

function getStat(key: string): string | null {
  try {
    return localStorage.getItem(key)
  }
  catch {
    return null
  }
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
  else if (pathname.includes('FAQ')) {
    presenceData.state = 'reading the FAQ'
  }
  else if (pathname.includes('licenseview')) {
    presenceData.state = 'viewing license'
  }
  else if (pathname.includes('/blog/')) {
    presenceData.state = 'reading the blog'
  }
  else if (pathname.includes('community')) {
    presenceData.state = 'reading community CoC page'
  }
  else if (pathname.includes('legal')) {
    presenceData.state = 'reading legal info'
  }
  else {
    const rolls = getStat('totalRolls')
    const points = getStat('shopPoints')

    if (rolls && points) {
      presenceData.state = `${points} pts · ${rolls} rolls`
    }
    else {
      presenceData.state = 'Playing'
    }
  }

  presence.setActivity(presenceData)
})
