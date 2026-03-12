const presence = new Presence({
  clientId: '843731213893107713',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
const assets = {
  gryffindor: 'https://cdn.rcd.gg/PreMiD/websites/W/Wizarding%20World/assets/0.png',
  hufflepuff: 'https://cdn.rcd.gg/PreMiD/websites/W/Wizarding%20World/assets/1.png',
  ravenclaw: 'https://cdn.rcd.gg/PreMiD/websites/W/Wizarding%20World/assets/2.png',
  slytherin: 'https://cdn.rcd.gg/PreMiD/websites/W/Wizarding%20World/assets/3.png',
}

presence.on('UpdateData', async () => {
  const setting = {
    timeElapsed: await presence.getSetting<boolean>('timeElapsed'),
    showButtons: await presence.getSetting<boolean>('showButtons'),
  }
  const urlpath = window.location.pathname.split('/')
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/W/Wizarding%20World/assets/logo.jpg',
  }

  if (setting.timeElapsed)
    presenceData.startTimestamp = browsingTimestamp

  if (document.location.host === 'www.wizardingworld.com') {
    if (!urlpath[1]) {
      presenceData.details = 'Home'
    }
    else {
      switch (urlpath[1]) {
        case 'news':
        case 'features': {
          presenceData.details = urlpath[1] === 'news' ? 'News' : 'Features'

          if (urlpath[2]) {
            presenceData.state = document.querySelector('h1.ArticleHero_title__cOam6')
              ?.textContent || 'Unknown'

            if (setting.showButtons) {
              presenceData.buttons = [
                {
                  label: 'View Article',
                  url: window.location.href,
                },
              ]
            }
          }

          break
        }
        case 'quiz': {
          presenceData.details = 'Quiz'

          if (urlpath[2]) {
            presenceData.state = document.querySelector('h1.ArticleHero_title__cOam6')
              ?.textContent || 'Unknown'

            if (setting.showButtons) {
              presenceData.buttons = [
                {
                  label: 'View Quiz',
                  url: window.location.href,
                },
              ]
            }
          }

          break
        }
        case 'writing-by-jk-rowling': {
          presenceData.details = 'J.K. Rowling Originals'

          if (urlpath[2]) {
            const post = document.querySelector('h1.ArticleHero_title__cOam6')
            const label = post?.textContent && post?.textContent.length >= 15
              ? `${post?.textContent.substring(0, 15)}...`
              : post?.textContent

            presenceData.state = post?.textContent || 'Unknown'

            if (setting.showButtons && post) {
              presenceData.buttons = [
                {
                  label: `View: ${label}`,
                  url: window.location.href,
                },
              ]
            }
          }

          break
        }
        case 'discover': {
          presenceData.details = 'Discover'

          if (
            urlpath[2] === 'books'
            || urlpath[2] === 'films'
            || urlpath[2] === 'portkey-games'
            || urlpath[2] === 'on-stage'
            || urlpath[2] === 'experiences'
          ) {
            if (urlpath[3]) {
              let ctopic = 'Loading...'

              presenceData.state = document.querySelector('h1.Header_productName__8oV2G')
                ?.textContent || 'Unknown'

              switch (urlpath[2]) {
                case 'books': {
                  ctopic = 'Book'
                  break
                }
                case 'films': {
                  ctopic = 'Film'
                  break
                }
                case 'portkey-games': {
                  ctopic = 'Game'
                  break
                }
                case 'experiences': {
                  ctopic = 'Experience'
                  break
                }
              }

              if (setting.showButtons && urlpath[2] !== 'on-stage') {
                presenceData.buttons = [
                  {
                    label: `View ${ctopic}`,
                    url: window.location.href,
                  },
                ]
              }
            }
            else {
              presenceData.state = document.querySelector('h1.DiscoverListHeader_header__3ivqr')
                ?.textContent || 'Unknown'
            }
          }

          break
        }
        case 'collections': {
          presenceData.details = 'Collections'

          if (urlpath[2]) {
            presenceData.state = document.querySelector('h1.CollectionHero_header__3rDGu')
              ?.textContent || 'Unknown'

            if (setting.showButtons) {
              presenceData.buttons = [
                {
                  label: 'View Collection',
                  url: window.location.href,
                },
              ]
            }
          }

          break
        }
        case 'harry-potter-fan-club': {
          presenceData.details = 'Fan Club'
          break
        }
        default:
          presenceData.details = 'Other'
      }
    }
  }
  else if (document.location.host === 'my.wizardingworld.com') {
    if (urlpath[1] === 'passport')
      presenceData.details = 'Passport'

    if (document.querySelector('span.HogwartsHouse_houseName__CykI1')) {
      presenceData.smallImageKey = assets[
        document
          .querySelector('span.HogwartsHouse_houseName__CykI1')
          ?.textContent
          ?.toLocaleLowerCase() as keyof typeof assets
      ]
      presenceData.smallImageText = document.querySelector(
        'span.HogwartsHouse_houseName__CykI1',
      )?.textContent
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
