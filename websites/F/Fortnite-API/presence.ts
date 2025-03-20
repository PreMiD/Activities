const presence = new Presence({
  clientId: '622163652207706122',
})
const presenceData: PresenceData = {
  largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/F/Fortnite-API/assets/logo.png',
  startTimestamp: Date.now(),
}

presence.on('UpdateData', () => {
  const path = document.location.pathname

  switch (path) {
    case '/': {
      presenceData.details = 'Documentation Home page'
      break
    }
    case '/about': {
      presenceData.details = 'About page'
      break
    }
    case '/account': {
      presenceData.details = 'Account page'
      break
    }
    case '/v1/banners': {
      presenceData.details = 'API request [ GET Banners ]'
      presenceData.state = 'Returns an array of all banners'

      break
    }
    case '/v1/banners/colors': {
      presenceData.details = 'API request [ GET Banner Colors ]'
      presenceData.state = 'Returns an array of all banner colors'

      break
    }
    case '/v1/stats/br/v2': {
      presenceData.details = 'API request [ GET BR Stats V2 ]'
      presenceData.state = 'Returns stats of the requested player account'

      break
    }
    case '/v2/aes': {
      presenceData.details = 'API request [ GET AES ]'
      presenceData.state = 'Returns the current aes key'

      break
    }
    case '/v2/shop/br': {
      presenceData.details = 'API request [ GET BR Shop ]'
      presenceData.state = 'Returns data of the current battle royale shop'

      break
    }
    case '/v2/shop/br/combined': {
      presenceData.details = 'API request [ GET BR Shop Combined ]'
      presenceData.state = 'Returns data of the current battle royale shop (combined)'

      break
    }
    case '/v2/creatorcode': {
      presenceData.details = 'API request [ GET Creator Code ]'
      presenceData.state = 'Returns data of a creator code by its name'

      break
    }
    case '/v2/creatorcode/search': {
      presenceData.details = 'API request [ GET Creator Code Search ]'
      presenceData.state = 'Returns data of the first creator code matching the name'

      break
    }
    case '/v2/creatorcode/search/all': {
      presenceData.details = 'API request [ GET Creator Code Search All ]'
      presenceData.state = 'Returns an array of creator code data matching the name'

      break
    }
    case '/v2/cosmetics/br': {
      presenceData.details = 'API request [ GET Cosmetics List ]'
      presenceData.state = 'Returns an array of all battle royale cosmetics'

      break
    }
    case '/v2/cosmetics/br/new': {
      presenceData.details = 'API request [ GET New Cosmetics ]'
      presenceData.state = 'Returns data of the latest added battle royale cosmetics'

      break
    }
    case '/v2/cosmetics/br/search': {
      presenceData.details = 'API request [ GET Cosmetics Search ]'
      presenceData.state = 'Returns data of the first battle royale cosmetic which matches the search parameter(s)'

      break
    }
    case '/v2/cosmetics/br/search/all': {
      presenceData.details = 'API request [ GET Cosmetics Search All ]'
      presenceData.state = 'Returns an array of all battle royale cosmetics which match the search parameter(s)'

      break
    }
    case '/v2/cosmetics/br/search/ids': {
      presenceData.details = 'API request [ GET Cosmetics Search by IDs ]'
      presenceData.state = 'Returns an array of the requested battle royale cosmetic ids'

      break
    }
    case '/v2/news': {
      presenceData.details = 'API request [ GET News ]'
      presenceData.state = 'Returns data of the current battle royale, save the world & creative news'

      break
    }
    case '/v2/news/br': {
      presenceData.details = 'API request [ GET News BR ]'
      presenceData.state = 'Returns data of the current battle royale news'

      break
    }
    case '/v2/news/stw': {
      presenceData.details = 'API request [ GET News STW ]'
      presenceData.state = 'Returns data of the current save the world news'

      break
    }
    case '/v2/news/creative': {
      presenceData.details = 'API request [ GET News Creative ]'
      presenceData.state = 'Returns data of the current creative news'

      break
    }
    default: {
      presenceData.details = 'Browsing'
      presenceData.state = path.substring(1)
    }
  }

  presence.setActivity(presenceData)
})
