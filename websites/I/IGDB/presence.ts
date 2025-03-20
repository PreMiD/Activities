const presence = new Presence({
  clientId: '924944781703020554',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/I/IGDB/assets/logo.png',
}

async function getStrings() {
  return presence.getStrings({
    viewGenre: 'general.viewGenre',
    viewCategory: 'general.viewCategory',
    browsing: 'general.browsing',
    buttonViewGame: 'general.buttonViewGame',
    viewGame: 'general.viewGame',
    discover: 'IGDB.discover',
    comingSoon: 'IGDB.comingSoon',
    recentlyReleased: 'IGDB.recentlyReleased',
    newGame: 'IGDB.newGame',
    newCompany: 'IGDB.newCompany',
    browseGenres: 'IGDB.browseGenres',
    browsePlatforms: 'IGDB.browsePlatforms',
    viewPlatform: 'IGDB.viewPlatform',
    top100: 'IGDB.top100',
    reviews: 'IGDB.reviews',
    browseThemes: 'IGDB.browseThemes',
    viewTheme: 'IGDB.viewTheme',
    browseCollections: 'IGDB.browseCollections',
    viewCollection: 'IGDB.viewCollection',
    browsePlayerPerspectives: 'IGDB.browsePlayerPerspectives',
    viewPlayerPerspectives: 'IGDB.viewPlayerPerspectives',
    browseFranchises: 'IGDB.browseFranchises',
    viewFranchises: 'IGDB.viewFranchises',
    browseCategories: 'IGDB.browseCategories',
    browseCompanies: 'IGDB.browseCompanies',
    viewCompany: 'IGDB.viewCompany',
    browseGameEngines: 'IGDB.browseGameEngines',
    viewGameEngine: 'IGDB.viewGameEngine',
    viewUser: 'general.viewUser',
    settings: 'IGDB.settings',
    viewList: 'general.viewList',
    searchFor: 'general.searchFor',
    search: 'search',
    browseCharacters: 'IGDB.browseCharacters',
    viewCharacter: 'IGDB.viewCharacter',
    browseEvents: 'IGDB.browseEvents',
    viewEvent: 'IGDB.viewEvent',
    API: 'IGDB.API',
    contact: 'IGDB.contact',
    about: 'IGDB.about',
    karmaHunters: 'IGDB.karmaHunters',
  })
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { pathname, search, href } = document.location
  const pathTwo = pathname.split('/')[2]
  const strings = await getStrings()

  switch (pathname.split('/')[1]) {
    case 'discover':
      presenceData.details = strings.discover
      break
    case 'games':
      switch (pathTwo) {
        case 'coming_soon':
          presenceData.details = strings.comingSoon
          break
        case 'recently_released':
          presenceData.details = strings.recentlyReleased
          break
        case 'new':
          presenceData.details = strings.newGame
          break
        default:
          if (pathname.split('/')[3] === 'reviews') {
            presenceData.details = strings.reviews
          }
          else {
            presenceData.details = strings.viewGame
            presenceData.state = document.querySelector('h1')?.textContent
            presenceData.largeImageKey = document.querySelector<HTMLImageElement>('.mui-image-img')?.src
            presenceData.buttons = [
              {
                label: strings.buttonViewGame,
                url: href,
              },
            ]
          }
      }
      break
    case 'users':
      switch (pathname.split('/')[3]) {
        case 'lists':
          presenceData.details = strings.viewList
          presenceData.state = document.querySelector(
            '.breadcrumb > .active > span',
          )?.textContent
          break
        case 'edit':
        case 'social_media':
        case 'notifications_edit':
        case 'site_settings':
        case 'password':
        case 'account_data':
          presenceData.details = strings.settings
          break
        default:
          presenceData.details = strings.viewUser
          presenceData.state = pathTwo
          presenceData.largeImageKey = document.querySelector<HTMLImageElement>('.mui-image-img')?.src
      }
      break
    case 'genres':
      if (pathTwo) {
        presenceData.details = strings.viewGenre
        presenceData.state = document.title.slice(0, -5)
      }
      else {
        presenceData.details = strings.browseGenres
      }
      break
    case 'platforms':
      if (pathTwo) {
        presenceData.details = strings.viewPlatform
        presenceData.state = document.title
        presenceData.largeImageKey = document.querySelector<HTMLImageElement>('.logo_med')?.src
      }
      else {
        presenceData.details = strings.browsePlatforms
      }
      break
    case 'top-100':
      presenceData.details = strings.top100
      presenceData.state = document.title
      break
    case 'themes':
      if (pathTwo) {
        presenceData.details = strings.viewTheme
        presenceData.state = document.title.slice(0, -5)
      }
      else {
        presenceData.details = strings.browseThemes
      }
      break
    case 'collections':
      if (pathTwo) {
        presenceData.details = strings.viewCollection
        presenceData.state = document.title
      }
      else {
        presenceData.details = strings.browseCollections
      }
      break
    case 'player_perspectives':
      if (pathTwo) {
        presenceData.details = strings.viewPlayerPerspectives
        presenceData.state = document.title.slice(0, -5)
      }
      else {
        presenceData.details = strings.browsePlayerPerspectives
      }
      break
    case 'franchises':
      if (pathTwo) {
        presenceData.details = strings.viewFranchises
        presenceData.state = document.title
      }
      else {
        presenceData.details = strings.browseFranchises
      }
      break
    case 'categories':
      if (pathTwo) {
        presenceData.details = strings.viewCategory
        presenceData.state = document.title.slice(0, -5)
      }
      else {
        presenceData.details = strings.browseCategories
      }
      break
    case 'companies':
      if (pathTwo === 'new') {
        presenceData.details = strings.newCompany
      }
      else if (pathTwo) {
        presenceData.details = strings.viewCompany
        presenceData.state = document.title
        presenceData.largeImageKey = document.querySelector<HTMLImageElement>('.logo_med')?.src
      }
      else {
        presenceData.details = strings.browseCompanies
      }
      break
    case 'game_engines':
      if (pathTwo) {
        presenceData.details = strings.viewGameEngine
        presenceData.state = document.title
        presenceData.largeImageKey = document.querySelector<HTMLImageElement>('.img-responsive')?.src
      }
      else {
        presenceData.details = strings.browseGameEngines
      }
      break
    case 'characters':
      if (pathTwo) {
        presenceData.details = strings.viewCharacter
        presenceData.state = document.title
        presenceData.largeImageKey = document.querySelector<HTMLImageElement>('.cover_big')?.src
      }
      else {
        presenceData.details = strings.browseCharacters
      }
      break
    case 'events':
      if (pathTwo) {
        presenceData.details = strings.browseEvents
        presenceData.state = document.title
        presenceData.largeImageKey = document.querySelector<HTMLImageElement>(
          '.MuiGrid2-root > .mui-image-wrapper > .mui-image-img',
        )?.src
      }
      else {
        presenceData.details = strings.viewEvent
      }
      break
    case 'seach':
      presenceData.details = strings.searchFor
      presenceData.state = decodeURI(search?.split('=')[1] ?? '')
      break
    case 'advanced_search':
      presenceData.details = strings.search
      break
    case 'about':
      presenceData.details = strings.about
      break
    case 'karma_hunters':
      presenceData.details = strings.karmaHunters
      break
    case 'contact':
      presenceData.details = strings.contact
      break
    case 'api':
      presenceData.details = strings.API
      break
    default:
      presenceData.details = strings.browsing
      break
  }

  presence.setActivity(presenceData)
})
