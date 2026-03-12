import { Assets } from 'premid'

const presence = new Presence({
  clientId: '702476721059790938',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/T/TrueTrophies/assets/logo.png',
  }

  presenceData.startTimestamp = browsingTimestamp

  if (document.location.pathname.includes('/gamer/')) {
    const user = document.querySelector('.tabs > ul > li')?.textContent

    if (document.location.pathname.includes('/gamecollection')) {
      presenceData.details = `Viewing ${user}'s`
      presenceData.state = 'Game Collection'
    }
    else if (document.location.pathname.includes('/trophies')) {
      presenceData.details = `Viewing ${user}'s`
      presenceData.state = 'Trophies'
    }
    else if (document.location.pathname.includes('/goals')) {
      presenceData.details = `Viewing ${user}'s`
      presenceData.state = 'Goals'
    }
    else if (document.location.pathname.includes('/blog')) {
      presenceData.details = `Viewing ${user}'s`
      presenceData.state = 'Blog'
    }
    else if (document.location.pathname.includes('/stats')) {
      presenceData.details = `Viewing ${user}'s`
      presenceData.state = 'Statistics'
    }
    else {
      presenceData.details = 'Viewing profile of:'
      presenceData.state = user
    }
  }
  else if (document.location.pathname.includes('/game/')) {
    if (document.location.pathname.includes('/trophies')) {
      presenceData.details = 'Viewing Trophies of game:'
      presenceData.state = document.querySelector(
        'div.panel-header.w > h3 > a',
      )?.textContent
    }
    else if (document.location.pathname.includes('/forum')) {
      presenceData.details = 'Viewing Forums of game:'
      presenceData.state = document.title.replace(' Forum', '')
    }
    else if (document.location.pathname.includes('/walkthrough')) {
      presenceData.details = 'Viewing Walkthrough of game:'
      presenceData.state = document
        .querySelector('.pagetitle')
        ?.textContent
        ?.replace(' Walkthrough', '')
    }
    else if (document.location.pathname.includes('/reviews')) {
      presenceData.details = 'Viewing Reviews of game:'
      presenceData.state = document
        .querySelector('.pagetitle')
        ?.textContent
        ?.replace(' Reviews', '')
    }
    else if (document.location.pathname.includes('/scores')) {
      presenceData.details = 'Viewing Top Scores of game:'
      presenceData.state = document
        .querySelector('.pagetitle')
        ?.textContent
        ?.replace('Top Scores For ', '')
    }
    else if (document.location.pathname.includes('/gamers')) {
      presenceData.details = 'Viewing Gamers of game:'
      presenceData.state = document.querySelector(
        'div.panel-header.w > h3 > a',
      )?.textContent
    }
    else {
      presenceData.details = 'Viewing game:'
      presenceData.state = document.querySelector('.info')?.textContent?.trim()
    }
  }
  else if (
    document.querySelector('.pagetitle')?.textContent === 'Trophy Details'
  ) {
    presenceData.details = 'Viewing trophy:'
    presenceData.state = document.querySelector('.title')?.textContent
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = `Game: ${
      document.querySelector('div.panel-header.w > h3 > a')?.textContent
    }`
  }
  else if (
    document.location.pathname === '/news'
    || document.location.pathname === '/news.aspx'
  ) {
    presenceData.details = 'Viewing the latest news'
  }
  else if (document.querySelector('.newsitem > header > h1')) {
    presenceData.details = 'Reading article:'
    presenceData.state = document.querySelector(
      '.newsitem > header > h1',
    )?.textContent
    presenceData.smallImageKey = Assets.Reading
  }
  else {
    switch (document.location.pathname) {
      case '/suggestnews.aspx': {
        presenceData.details = 'Suggesting new news'
        presenceData.smallImageKey = Assets.Writing

        break
      }
      case '/news/community': {
        presenceData.details = 'Viewing the latest community news'
        break
      }
      case '/news/playstation-vr': {
        presenceData.details = 'Viewing the latest PlayStation VR news'
        break
      }
      case '/news/playstation-network': {
        presenceData.details = 'Viewing the latest PlayStation Network news'
        break
      }
      case '/news/tags/podcast': {
        presenceData.details = 'Viewing the latest podcasts'
        break
      }
      case '/siteupdates': {
        presenceData.details = 'Viewing the latest site updates'
        break
      }
      case '/games.aspx': {
        presenceData.details = 'Viewing all games'
        break
      }
      case '/playstationtrophies.aspx': {
        presenceData.details = 'Viewing all trophies'
        break
      }
      case '/solutions-required.aspx': {
        presenceData.details = 'Viewing all trophies'
        presenceData.state = 'that require guides'

        break
      }
      case '/sitereviews.aspx': {
        presenceData.details = 'Viewing site reviews'
        break
      }
      case '/solutions': {
        presenceData.details = 'Viewing trophy solutions'
        break
      }
      case '/psn.aspx': {
        presenceData.details = 'Viewing PlayStation Network status'
        break
      }
      case '/ps4/news': {
        presenceData.details = 'Viewing the latest PS4 news'
        break
      }
      case '/ps4/games': {
        presenceData.details = 'Viewing the latest PS4 games'
        break
      }
      case '/ps4/prices': {
        presenceData.details = 'Viewing the latest PS4 prices'
        break
      }
      case '/ps3/news': {
        presenceData.details = 'Viewing the latest PS3 news'
        break
      }
      case '/ps3/games': {
        presenceData.details = 'Viewing the latest PS3 games'
        break
      }
      case '/ps3/prices': {
        presenceData.details = 'Viewing the latest PS3 prices'
        break
      }
      case '/vita/news': {
        presenceData.details = 'Viewing the latest VITA news'
        break
      }
      case '/vita/games': {
        presenceData.details = 'Viewing the latest VITA games'
        break
      }
      case '/vita/prices': {
        presenceData.details = 'Viewing the latest VITA prices'
        break
      }
      case '/ps-now/news': {
        presenceData.details = 'Viewing the latest PlayStation Now news'
        break
      }
      case '/ps-now/games': {
        presenceData.details = 'Viewing the latest PlayStation Now games'
        break
      }
      case '/playstation-vr/news': {
        presenceData.details = 'Viewing the latest PlayStation VR news'
        break
      }
      case '/playstation-vr/games': {
        presenceData.details = 'Viewing the latest PlayStation VR games'
        break
      }
      default:
        if (
          document.location.pathname.includes('/viewcomment.aspx')
          && document.querySelector('.pagetitle')?.textContent === 'View Solution'
        ) {
          presenceData.details = 'Viewing solution for trophy:'
          presenceData.state = document.querySelector('.title')?.textContent
          presenceData.smallImageKey = Assets.Reading
          presenceData.smallImageText = `Game: ${
            document.querySelector('div.panel-header.w > h3 > a')?.textContent
          }`
        }
        else {
          switch (document.location.pathname) {
            case '/serieslist.aspx': {
              presenceData.details = 'Viewing Game Series'
              break
            }
            case '/populartrophies.aspx': {
              presenceData.details = 'Viewing popular trophies'
              break
            }
            case '/walkthroughs.aspx': {
              presenceData.details = 'Viewing PlayStation Walkthroughs and Guides'
              break
            }
            case '/reviews.aspx': {
              presenceData.details = 'Viewing user reviews'
              break
            }
            case '/gamereleases.aspx': {
              presenceData.details = 'Viewing upcoming releases'
              break
            }
            case '/gamingsessions.aspx': {
              presenceData.details = 'Viewing the Gaming Sessions'
              break
            }
            case '/searchresults.aspx': {
              presenceData.details = 'Searching for:'
              presenceData.state = document.querySelector<HTMLInputElement>('#txtSearchFor')?.value
              presenceData.smallImageKey = Assets.Search

              break
            }
            default:
              if (document.location.pathname.includes('/products')) {
                if (document.location.pathname.includes('/latest')) {
                  presenceData.details = 'Viewing the latest products'
                }
                else if (
                  document.location.pathname.includes('/playstation-sales')
                ) {
                  presenceData.details = 'Viewing PlayStation sales'
                }
                else if (document.querySelector('.pagetitle')) {
                  presenceData.details = 'Viewing prices for:'
                  presenceData.state = document
                    .querySelector('.pagetitle')
                    ?.textContent
                    ?.replace('Best price for ', '')
                    .trim()
                }
              }
              else if (document.location.pathname.includes('/forum/')) {
                presenceData.smallImageKey = Assets.Reading
                if (document.location.pathname.includes('/viewthreads.aspx')) {
                  presenceData.details = 'Forums - Viewing their recent threads'
                }
                else if (document.location.pathname.includes('/forums.aspx')) {
                  presenceData.details = 'Browsing the forums...'
                }
                else if (
                  document.location.pathname.includes('/viewboard.aspx')
                ) {
                  presenceData.details = 'Forums - Viewing board:'
                  presenceData.state = document.querySelector('.pagetitle')?.textContent
                }
                else if (
                  document.location.pathname.includes('/newthreads.aspx')
                ) {
                  presenceData.details = 'Forums - Viewing new threads'
                }
                else if (
                  document.location.pathname.includes('/viewthread.aspx')
                ) {
                  presenceData.details = 'Forums - Reading thread:'
                  presenceData.state = document.querySelector(
                    '#oMessageThread > div:nth-child(2) > h1',
                  )?.textContent
                }
                else if (
                  document.location.pathname.includes('/search.aspx')
                ) {
                  presenceData.details = 'Forums - Searching for:'
                  presenceData.state = document.querySelector<HTMLInputElement>(
                    '#txtSearchFor',
                  )?.value
                  presenceData.smallImageKey = Assets.Search
                }
              }
              else if (document.location.pathname.includes('/leaderboard')) {
                presenceData.details = 'Viewing the leaderboards'
              }
              else if (
                document.location.pathname.includes('/userleaderboards.aspx')
              ) {
                presenceData.details = 'Viewing user created leaderboards'
              }
              else if (document.location.pathname === '/') {
                presenceData.details = 'Browsing...'
              }
          }
        }
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
