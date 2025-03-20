const presence = new Presence({
  clientId: '1233135474395189399',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/P/Pub/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href, search } = document.location
  const searchParams = new URLSearchParams(search)
  const pathList = pathname.split('/').filter(Boolean)

  switch (pathList[0] ?? '/') {
    case '/': {
      presenceData.details = 'Browsing the home page'
      break
    }
    case 'help': {
      presenceData.details = 'Browsing help'
      if (pathList[1])
        presenceData.state = document.querySelector('h1')
      break
    }
    case 'packages': {
      if (pathList[1]) {
        presenceData.details = 'Viewing a package'
        presenceData.state = pathList[1]
        presenceData.buttons = [{ label: 'View Package', url: href }]
      }
      else if (searchParams.has('q')) {
        presenceData.details = 'Searching for packages'
        presenceData.state = searchParams.get('q')
      }
      else {
        presenceData.details = 'Browsing packages'
        presenceData.state = `${
          document.querySelector<HTMLSpanElement>('.count')?.textContent
        } packages`
      }
      break
    }
    case 'policy': {
      presenceData.details = 'Reading the policy'
      break
    }
    case 'security': {
      presenceData.details = 'Reading the security policy'
      break
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.clearActivity()
})
