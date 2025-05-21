const presence = new Presence({
  clientId: '503557087041683458',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.imgur.com/9jkZw23.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    name: 'Best Buy',
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href } = document.location
  const pathList = pathname.split('/').filter(Boolean)

  switch (pathList[0]) {
    case 'cart': {
      presenceData.details = 'Viewing their cart'
      break
    }
    case 'checkout': {
      presenceData.details = 'Checking out'
      break
    }
    case 'loyalty': {
      presenceData.details = 'Viewing loyalty program'
      break
    }
    case 'site': {
      switch (pathList[1]) {
        case 'brands': {
          presenceData.details = 'Browsing a brand'
          presenceData.state
            = document.querySelector('h1')
              ?? document.querySelector<HTMLImageElement>('.navLogo')?.alt
          break
        }
        case 'clp':
        case 'promo': {
          presenceData.details = 'Viewing a sale'
          presenceData.state = document.querySelector('h1')
          break
        }
        case 'customer': {
          presenceData.details = 'Viewing their items'
          presenceData.state = document.querySelector(
            '.shop-saved-items .sr-only[role=heading]',
          )
          break
        }
        case 'gift-ideas': {
          presenceData.details = 'Looking for gift ideas'
          break
        }
        case 'searchpage': {
          presenceData.details = 'Searching'
          presenceData.state = document
            .querySelector('h1')
            ?.textContent
            ?.slice(1, -1)
          break
        }
        default: {
          if (pathname.endsWith('.p')) {
            presenceData.details = 'Viewing a product'
            presenceData.state = document.querySelector('h1')
            presenceData.buttons = [{ label: 'View Product', url: href }]
          }
          else if (pathList[2] === 'gift-ideas') {
            presenceData.details = 'Looking for gift ideas'
          }
          else {
            presenceData.details = 'Browsing...'
            presenceData.state = document.querySelector('h1')
          }
        }
      }
      break
    }
    default: {
      presenceData.details = 'Browsing...'
    }
  }

  presence.setActivity(presenceData)
})
