import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1377299850613227520',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/G/GOG/assets/logo.png',
}

async function getStrings() {
  return presence.getStrings({
    search: 'general.searchFor',
    viewHome: 'general.viewHome',
    buttonViewPage: 'general.buttonViewPage',
    viewMember: 'general.viewMember',
    viewAccount: 'general.viewAccount',
    viewList: 'general.viewList',
    viewingAWishlist: 'general.viewingAWishlist',
    viewPage: 'general.viewPage',
    viewGame: 'general.viewGame',
    buttonViewGame: 'general.buttonViewGame',
    viewGenre: 'general.viewGenre',
    browsing: 'general.browsing',
    redeemACode: 'GOG.redeemACode',
    workPage: 'GOG.workPage',
    browsingGames: 'GOG.browsingGames',
    aboutPage: 'GOG.aboutPage',
    viewWallet: 'GOG.viewWallet',
    shopCart: 'general.shopCart',
    preservationPage: 'GOG.preservationPage',
    forums: 'general.forums',
    submitGame: 'GOG.submitGame',
    feedPage: 'GOG.feedPage',
    viewProfile: 'general.viewProfile',
    thanksPage: 'GOG.thanksPage',
    readingPost: 'general.readingPost',
    blogPage: 'GOG.blogPage',
    settings: 'GOG.settings',
    games: 'GOG.games',
    wishlist: 'GOG.wishlist',
    friends: 'GOG.friends',
    chat: 'GOG.chat',
  })
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href, search } = document.location
  const strings = await getStrings()
  switch (pathname.split('/')[1]) {
    case 'feed':
      presenceData.details = strings.viewPage
      presenceData.state = strings.feedPage
      break
    case 'u':
      presenceData.details = strings.viewProfile
      presenceData.state = document.querySelector('.user-status__username')?.textContent
      presenceData.largeImageKey = document.querySelector<HTMLImageElement>('.user-status__avatar-image')?.srcset?.split(' ')[0] ?? ActivityAssets.Logo
      break
    case 'redeem':
      presenceData.details = strings.redeemACode
      break
    case 'work':
      presenceData.details = strings.viewPage
      presenceData.state = strings.workPage
      break
    case 'indie':
    case 'submit-your-game':
      presenceData.details = strings.viewPage
      presenceData.state = strings.submitGame
      break
    case 'forum':
      presenceData.details = strings.viewPage
      presenceData.state = strings.forums
      break
    case 'dreamlist':
      presenceData.details = strings.viewPage
      presenceData.state = 'GOG Dreamlist'
      break
    case 'galaxy':
      presenceData.details = strings.viewPage
      presenceData.state = 'GOG Galaxy'
      break
    case 'blog':
      presenceData.details = strings.viewPage
      presenceData.state = strings.blogPage
      if (pathname.split('/')[2]) {
        presenceData.details = strings.readingPost
        presenceData.state = document.querySelector('.entry-title')?.textContent
        presenceData.largeImageKey = document.querySelector<HTMLMetaElement>('[property="og:image"]')?.content ?? ActivityAssets.Logo
      }
      break
    case 'thanks':
      presenceData.details = strings.viewPage
      presenceData.state = strings.thanksPage
      break
    default:
      presenceData.details = strings.browsing
      if (pathname.split('/')[2]) {
        switch (pathname.split('/')[2]) {
          case 'games':
          {
            presenceData.details = strings.browsingGames
            const searchInput = decodeURIComponent(
              search?.split('query=')[1]?.split('&')[0] ?? '',
            )
            if (searchInput) {
              presenceData.details = strings.search
              presenceData.smallImageKey = Assets.Search
              presenceData.state = searchInput
            }
            break
          }
          case 'game':
            presenceData.details = strings.viewGame
            presenceData.state = document.querySelector('.productcard-basics__title')?.textContent
            presenceData.buttons = [{
              label: strings.buttonViewGame,
              url: href,
            }]
            presenceData.largeImageKey = document.querySelector<HTMLMetaElement>('[property="thumbnail"]')?.content ?? ActivityAssets.Logo
            break
          case 'wallet':
            presenceData.details = strings.viewWallet
            break
          case 'about_gog':
            presenceData.details = strings.viewPage
            presenceData.state = strings.aboutPage
            break
          case 'account':
            switch (pathname.split('/')[3]) {
              case 'settings':
                presenceData.details = strings.settings
                break
              case 'friends':
                presenceData.details = strings.friends
                break
              case 'chat':
                presenceData.details = strings.chat
                break
              case 'wishlist':
                presenceData.details = strings.wishlist
                break
              default:
                presenceData.details = strings.games
                break
            }
            break
          case 'wishlist':
            presenceData.details = strings.viewingAWishlist
            break
          case 'gog-preservation-program':
            presenceData.details = strings.viewPage
            presenceData.state = strings.preservationPage
            break
          case 'checkout':
            presenceData.details = strings.viewPage
            presenceData.state = strings.shopCart
            break
          default:
            presenceData.details = strings.viewHome
            break
        }
      }
      break
  }

  presence.setActivity(presenceData)
})
