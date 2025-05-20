const presence = new Presence({
  clientId: '503557087041683458',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.imgur.com/gzoRJ80.png',
}

function capitalize(input: string): string {
  return input[0]?.toUpperCase() + input.slice(1)
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    name: 'Emurse',
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href } = document.location
  const pathList = pathname.split('/').filter(Boolean)

  function applyArticleData(title: string, subList: string[]): void {
    switch (subList[0] ?? '/') {
      case '/': {
        presenceData.details = `Browsing the ${title}`
        break
      }
      case 'category': {
        presenceData.details = `Browsing the ${title}`
        presenceData.state = `By Category: ${subList[1]}`
        break
      }
      case 'dashboard': {
        presenceData.details = 'Viewing Their Dashboard'
        break
      }
      case 'Identity': {
        presenceData.details = 'Logging in'
        break
      }
      case 'tag': {
        presenceData.details = `Browsing the ${title}`
        presenceData.state = `By Tag: ${subList[1]}`
        break
      }
      default: {
        presenceData.details = `Reading a ${title}`
        presenceData.state = document.querySelector('h1')
        presenceData.buttons = [{ label: 'View Article', url: href }]
      }
    }
  }

  switch (pathList[0]) {
    case 'articles': {
      if (pathList[1]) {
        applyArticleData(`${capitalize(pathList[1])} Articles`, pathList.slice(2))
      }
      else {
        presenceData.details = 'Browsing Articles'
      }
      break
    }
    case 'development-blog': {
      applyArticleData('Development Blog', pathList.slice(1))
      break
    }
    default: {
      presenceData.details = 'Browsing...'
    }
  }

  presence.setActivity(presenceData)
})
