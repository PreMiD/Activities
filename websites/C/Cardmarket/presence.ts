const presence = new Presence({
  clientId: '568035160784896035',
})

enum ActivityAssets {
  Logo = 'https://i.imgur.com/bmVVGUa.jpeg',
}

const browsingTimestamp = Math.floor(Date.now() / 1000)

function getPageInfo() {
  const { pathname } = document.location

  const pathParts = pathname.replace(/^\//, '').split('/')

  const lang = pathParts[0] || 'en'
  const game = pathParts[1] || ''

  let pageType = 'unknown'
  let category = ''
  let product = ''

  if (!game) {
    pageType = 'homepage_all'
  }
  else if (pathParts.length === 2) {
    pageType = 'homepage_game'
  }
  else if (pathParts[2] === 'Products') {
    if (pathParts.length === 4) {
      pageType = 'category'
      category = pathParts[3] || ''
    }
    else if (pathParts.length >= 5) {
      pageType = 'product'
      category = pathParts[3] || ''
      product = pathParts[pathParts.length - 1] || ''
    }
  }

  return { lang, game, pageType, category, product }
}

function formatString(str: string): string {
  return str.replace(/-/g, ' ')
}

presence.on('UpdateData', async () => {
  const { game, pageType, category, product } = getPageInfo()

  const showButtons = await presence.getSetting<boolean>('showButtons')

  const strings = await presence.getStrings({
    browsing: 'general.browsing',
    cardmarketBrowsing: 'cardmarket.browsing',
    homepage: 'cardmarket.homepage',
    gameLabel: 'cardmarket.game',
    browsingCategory: 'cardmarket.browsing_category',
    viewing: 'cardmarket.viewing',
  })

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  switch (pageType) {
    case 'homepage_all':
      presenceData.details = strings.cardmarketBrowsing
      break

    case 'homepage_game':
      presenceData.details = strings.browsing
      presenceData.state = strings.gameLabel.replace('{0}', formatString(game))
      break

    case 'category':
      presenceData.details = strings.browsingCategory.replace('{0}', formatString(category))
      presenceData.state = strings.gameLabel.replace('{0}', formatString(game))
      break

    case 'product': {
      const productNameElem = document.querySelector('h1')
      const actualProductName = productNameElem ? productNameElem.textContent?.trim() : formatString(product)

      presenceData.details = strings.viewing.replace('{0}', actualProductName || '')
      presenceData.state = `${formatString(game)} - ${formatString(category)}`

      if (showButtons) {
        presenceData.buttons = [
          {
            label: 'View Product',
            url: document.location.href,
          },
        ]
      }
      break
    }

    default:
      presenceData.details = strings.cardmarketBrowsing
      if (game) {
        presenceData.state = strings.gameLabel.replace('{0}', formatString(game))
      }
      break
  }

  if (presenceData.details) {
    presence.setActivity(presenceData)
  }
  else {
    presence.clearActivity()
  }
})
