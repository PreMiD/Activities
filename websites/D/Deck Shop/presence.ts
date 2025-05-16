const presence = new Presence({
  clientId: '503557087041683458',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.imgur.com/UxgNHpE.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    name: 'Deck Shop',
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href } = document.location
  const pathList = pathname.split('/').filter(Boolean)
  if (pathList[0]?.length === 2) {
    // remove language code from path logic
    pathList.splice(0, 1)
  }
  const strings = await presence.getStrings({
    viewHome: 'general.viewHome',
    browsing: 'general.browsing',
    browseGuides: 'deck shop.browseGuides',
    readGuide: 'deck shop.readGuide',
    buttonReadArticle: 'general.buttonReadArticle',
  })

  switch (pathList[0] ?? '/') {
    case '/': {
      presenceData.details = strings.viewHome
      break
    }
    case 'guide': {
      if (pathList[1]) {
        presenceData.details = strings.readGuide
        presenceData.state = document.querySelector('h1')
        presenceData.buttons = [{ label: strings.buttonReadArticle, url: href }]
      }
      else {
        presenceData.details = strings.browseGuides
      }
      break
    }
    case 'spy': {
      break
    }
    default: {
      presenceData.details = strings.browsing
    }
  }

  presence.setActivity(presenceData)
})
