const presence = new Presence({
  clientId: '1334878859610554509',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/I/IGN/assets/logo.png',
}

async function getStrings() {
  return presence.getStrings({
    search: 'general.searchFor',
    viewHome: 'general.viewHome',
    buttonViewPage: 'general.buttonViewPage',
    buttonReadArticle: 'general.buttonReadArticle',
    readingArticle: 'general.readingArticle',
    viewMember: 'general.viewMember',
    watching: 'general.watching',
    wiki: 'IGN.wiki',
    buttonViewWiki: 'general.buttonViewWiki',
    viewAccount: 'general.viewAccount',
    viewList: 'general.viewList',
    viewPlaylists: 'general.viewPlaylists',
    followedPlaylists: 'IGN.followedPlaylists',
    viewingAWishlist: 'general.viewingAWishlist',
    library: 'IGN.library',
    playing: 'IGN.playing',
    backlog: 'IGN.backlog',
    paused: 'IGN.paused',
    beat: 'IGN.beat',
    quit: 'IGN.quit',
    exploringMaps: 'IGN.exploringMaps',
    rewards: 'IGN.rewards',
    viewCategory: 'general.viewCategory',
    viewPage: 'general.viewPage',
    viewGame: 'general.viewGame',
    buttonViewGame: 'general.buttonViewGame',
    viewComics: 'IGN.viewComics',
    buttonViewComics: 'IGN.buttonViewComics',
    viewTV: 'IGN.viewTV',
    buttonViewTV: 'IGN.buttonViewTV',
    viewTech: 'IGN.viewTech',
    buttonViewTech: 'IGN.buttonViewTech',
    buttonViewMovie: 'general.buttonViewMovie',
    viewMovie: 'general.viewMovie',
    viewGenre: 'general.viewGenre',
    video: 'IGN.video',
    cinema: 'IGN.cinema',
    browsing: 'general.browsing',
    buttonWatchVideo: 'general.buttonWatchVideo',
  })
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href, search } = document.location
  const strings = await getStrings()
  const pathOne = pathname.split('/')[1]
  const pathTwo = pathname.split('/')[2]
  const pathThree = pathname.split('/')[3]

  switch (pathOne) {
    case 'articles': {
      presenceData.details = strings.readingArticle
      presenceData.state = document.querySelector('.display-title')?.textContent
      presenceData.buttons = [
        {
          label: strings.buttonReadArticle,
          url: href,
        },
      ]
      break
    }
    case 'videos': {
      if (pathTwo) {
        presenceData.details = strings.watching
        presenceData.state = document.querySelector('.title2')?.textContent
        presenceData.buttons = [
          {
            label: strings.buttonWatchVideo,
            url: href,
          },
        ]
        presenceData.largeImageKey = document.querySelector<HTMLImageElement>('.object-image')?.src ?? ActivityAssets.Logo
      }
      else {
        presenceData.details = strings.viewCategory
        presenceData.state = document.querySelector('.title1')?.textContent
      }
      break
    }
    case 'wikis': {
      presenceData.details = strings.wiki
      presenceData.state = document.querySelector('.display-title')?.textContent
      presenceData.buttons = [
        {
          label: strings.buttonViewWiki,
          url: href,
        },
      ]
      presenceData.largeImageKey = document.querySelector<HTMLImageElement>('.object-image')?.src ?? ActivityAssets.Logo
      break
    }
    case 'person': {
      presenceData.details = strings.viewMember
      presenceData.state = document.querySelector('h1.display-title')?.textContent
      break
    }
    case 'u': {
      presenceData.details = strings.viewMember
      presenceData.state = document.querySelector('.user-name')?.textContent
      break
    }
    case 'maps': {
      presenceData.details = strings.exploringMaps
      break
    }
    case 'account': {
      const pathFour = pathname.split('/')[4]
      switch (pathThree) {
        case 'lists': {
          if (pathFour) {
            presenceData.details = strings.viewList
            presenceData.state = document.querySelector('.display-title')?.textContent
          }
          else {
            presenceData.details = strings.viewPlaylists
          }
          break
        }
        case 'following': {
          presenceData.details = strings.followedPlaylists
          break
        }
        case 'playlist': {
          switch (pathFour) {
            case 'wishlist': {
              presenceData.details = strings.viewingAWishlist
              break
            }
            case 'backlog': {
              presenceData.details = strings.backlog
              break
            }
            case 'playing': {
              presenceData.details = strings.playing
              break
            }
            case 'paused': {
              presenceData.details = strings.paused
              break
            }
            case 'beat': {
              presenceData.details = strings.beat
              break
            }
            case 'quit': {
              presenceData.details = strings.quit
              break
            }
            default:
              presenceData.details = strings.library
          }
          break
        }
        default: {
          presenceData.details = strings.viewAccount
          break
        }
      }
      break
    }
    case 'playlist': {
      if (pathThree) {
        presenceData.details = strings.viewList
        presenceData.state = document.querySelector('.display-title')?.textContent
        presenceData.largeImageKey = document.querySelector<HTMLImageElement>('.aspect-ratio-3-2')?.src ?? ActivityAssets.Logo
      }
      else {
        presenceData.details = strings.viewPlaylists
      }
      break
    }
    case 'rewards': {
      presenceData.details = strings.rewards
      break
    }
    case 'deals':
    case 'columns':
    case 'playstation':
    case 'xbox':
    case 'nintendo':
    case 'pc':
    case 'mobile':
    case 'watch':
    case 'editors-choice':
    case 'reviews':
    case 'news':
    case 'article':
    case 'tabletop': {
      presenceData.details = strings.viewCategory
      presenceData.state = pathOne === 'columns'
        ? document.querySelector('.display-title')?.textContent
        : pathOne === 'article' || pathOne === 'tabletop'
          ? document.querySelector('.herotitle')?.textContent
          : document.querySelector('.title1')?.textContent
      break
    }
    case 'ps5': {
      presenceData.details = strings.viewCategory
      presenceData.state = 'PlayStation'
      break
    }
    case 'xbox-series-x': {
      presenceData.details = strings.viewCategory
      presenceData.state = 'Xbox'
      break
    }
    case 'nintendo-switch': {
      presenceData.details = strings.viewCategory
      presenceData.state = 'Nintendo'
      break
    }
    case 'anime': {
      presenceData.details = strings.viewCategory
      presenceData.state = 'Anime'
      break
    }
    case 'video': {
      presenceData.details = strings.viewCategory
      presenceData.state = strings.video
      break
    }
    case 'cinema-tv':
    case 'movie': {
      presenceData.details = strings.viewCategory
      presenceData.state = strings.cinema
      break
    }
    case 'events': {
      presenceData.details = strings.viewCategory
      presenceData.state = document.querySelector('a.selected.bold')?.textContent
      break
    }
    case 'upcoming': {
      presenceData.details = strings.viewPage
      presenceData.state = document.querySelector('.title5')?.textContent
      break
    }
    case 'special': {
      presenceData.details = 'On a Paid Promotion page'
      break
    }
    case 'icons': {
      presenceData.details = strings.viewPage
      presenceData.state = document.querySelector('.display-title')?.textContent
      break
    }
    case 'games': {
      switch (pathTwo) {
        case 'producer':
        case 'publisher':
        case 'feature':
        case 'franchise':
        case 'genre':
        case 'platform': {
          presenceData.details = strings.viewPage
          presenceData.state = document.querySelector('.title5')?.textContent
          break
        }
        default: {
          presenceData.details = strings.viewGame
          presenceData.state = document.querySelector('.display-title')?.textContent
          presenceData.largeImageKey = document.querySelector<HTMLImageElement>('.object-image')?.src ?? ActivityAssets.Logo
          presenceData.buttons = [
            {
              label: strings.buttonViewGame,
              url: href,
            },
          ]
          break
        }
      }
      break
    }
    case 'movies': {
      if (pathTwo) {
        switch (pathTwo) {
          case 'producer':
          case 'publisher':
          case 'franchise':
          case 'genre':
          case 'platform': {
            presenceData.details = strings.viewPage
            presenceData.state = document.querySelector('.title5')?.textContent
            break
          }
          default: {
            presenceData.details = strings.viewMovie
            presenceData.state = document.querySelector('.display-title')?.textContent
            presenceData.largeImageKey = document.querySelector<HTMLImageElement>('.object-image')?.src ?? ActivityAssets.Logo
            presenceData.buttons = [
              {
                label: strings.buttonViewMovie,
                url: href,
              },
            ]
            break
          }
        }
      }
      else {
        presenceData.details = strings.viewCategory
        presenceData.state = document.querySelector('.title1')?.textContent
      }
      break
    }
    case 'tv': {
      if (pathTwo) {
        switch (pathTwo) {
          case 'producer':
          case 'publisher':
          case 'franchise':
          case 'genre':
          case 'platform': {
            presenceData.details = strings.viewPage
            presenceData.state = document.querySelector('.title5')?.textContent
            break
          }
          default: {
            presenceData.details = strings.viewTV
            presenceData.state = document.querySelector('.display-title')?.textContent
            presenceData.largeImageKey = document.querySelector<HTMLImageElement>('.object-image')?.src ?? ActivityAssets.Logo
            presenceData.buttons = [
              {
                label: strings.buttonViewTV,
                url: href,
              },
            ]
            break
          }
        }
      }
      else {
        presenceData.details = strings.viewCategory
        presenceData.state = document.querySelector('.title1')?.textContent
      }
      break
    }
    case 'comics': {
      if (pathTwo) {
        switch (pathTwo) {
          case 'producer':
          case 'publisher':
          case 'franchise':
          case 'genre':
          case 'platform': {
            presenceData.details = strings.viewPage
            presenceData.state = document.querySelector('.title5')?.textContent
            break
          }
          default: {
            presenceData.details = strings.viewComics
            presenceData.state = document.querySelector('.display-title')?.textContent
            presenceData.largeImageKey = document.querySelector<HTMLImageElement>('.object-image')?.src ?? ActivityAssets.Logo
            presenceData.buttons = [
              {
                label: strings.buttonViewComics,
                url: href,
              },
            ]
            break
          }
        }
      }
      else {
        presenceData.details = strings.viewCategory
        presenceData.state = document.querySelector('.title1')?.textContent
      }
      break
    }
    case 'tech': {
      if (pathTwo) {
        switch (pathTwo) {
          case 'producer':
          case 'publisher':
          case 'franchise':
          case 'genre':
          case 'platform': {
            presenceData.details = strings.viewPage
            presenceData.state = document.querySelector('.title5')?.textContent
            break
          }
          default: {
            presenceData.details = strings.viewTech
            presenceData.state = document.querySelector('.display-title')?.textContent
            presenceData.largeImageKey = document.querySelector<HTMLImageElement>('.object-image')?.src ?? ActivityAssets.Logo
            presenceData.buttons = [
              {
                label: strings.buttonViewTech,
                url: href,
              },
            ]
            break
          }
        }
      }
      else {
        presenceData.details = strings.viewCategory
        presenceData.state = document.querySelector('.title1')?.textContent
      }
      break
    }
    case 'se': {
      presenceData.details = strings.search
      presenceData.state = decodeURIComponent(
        search?.split('=')[2]?.replaceAll('+', ' ') ?? '',
      )
      break
    }
    default: {
      if (
        pathThree === 'page'
        || pathThree === 'video'
        || pathThree === 'news'
        || pathThree === 'interview'
        || pathThree === 'feature'
        || pathThree === 'preview'
      ) {
        presenceData.details = pathThree === 'video' ? strings.watching : strings.readingArticle
        presenceData.state = document.querySelector('#id_title')?.textContent
        presenceData.buttons = [
          {
            label: pathThree === 'video' ? strings.buttonWatchVideo : strings.buttonReadArticle,
            url: href,
          },
        ]
        break
      }
      else if (pathOne) {
        const gameTab = document.querySelector('.title')?.textContent
        if (gameTab) {
          presenceData.details = strings.viewGame
          presenceData.state = gameTab
          presenceData.largeImageKey = document.querySelector<HTMLImageElement>('img_cover')?.src ?? ActivityAssets.Logo
          presenceData.buttons = [
            {
              label: strings.buttonViewGame,
              url: href,
            },
          ]
        }
        else {
          presenceData.details = strings.browsing
        }
      }
      else {
        presenceData.details = strings.viewHome
      }
      break
    }
  }

  presence.setActivity(presenceData)
})
