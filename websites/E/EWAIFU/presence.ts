const presence = new Presence({
  clientId: '503557087041683458',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/E/EWAIFU/assets/logo.png',
  Home = 'https://cdn.rcd.gg/PreMiD/websites/E/EWAIFU/assets/0.png',
}

const timestampCheck: {
  hash: string
  timestamp: number
} = {
  hash: '',
  timestamp: Math.floor(Date.now() / 1000),
}
const staticPages: Record<string, PresenceData> = {
  '/': {
    details: 'Discovering Ewaifus',
    smallImageKey: ActivityAssets.Home,
  },
  '/login': { details: 'Sign In', smallImageKey: ActivityAssets.Logo },
  '/register': { details: 'Sign Up' },
  '/wallet': { details: 'Wallet' },
}

presence.on('UpdateData', async () => {
  let presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: timestampCheck.timestamp,
    name: 'EWAIFU',
  }
  const { href, pathname } = document.location
  const ewaifuName = document.querySelector(
    '[class*="text-2xl xl:text-3xl font-raleway capitalize"]',
  )?.textContent
  const avatar = document
    .querySelector(
      '[class="h-full w-full rounded-full object-cover profile-pfp img-animation"]',
    )
    ?.getAttribute('src')
  const hash: string = href
  if (timestampCheck.hash !== hash) {
    timestampCheck.hash = hash
    timestampCheck.timestamp = Math.floor(Date.now() / 1000)
  }
  switch (true) {
    case pathname.includes('/profile/'): {
      if (!ewaifuName) {
        presenceData.details = 'Loading'
      }
      else {
        presenceData.details = `Viewing ${ewaifuName}'s profile`

        presenceData.largeImageKey = avatar ?? ActivityAssets.Logo

        presenceData.smallImageKey = ActivityAssets.Logo
      }
      presenceData.buttons = [{ label: 'View EWAIFU', url: href }]
      break
    }
    default: {
      if (Object.keys(staticPages).includes(pathname))
        presenceData = { ...presenceData, ...staticPages[pathname] }
      else presenceData.details = 'Unknown page'
    }
  }

  presence.setActivity(presenceData)
})
