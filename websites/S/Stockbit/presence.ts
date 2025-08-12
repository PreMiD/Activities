import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1404312265288847491',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.imgur.com/mrEN3GP.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    name: 'Stockbit',
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { pathname, hostname } = document.location
  const pathList = pathname.split('/').filter(Boolean)

  switch (hostname) {
    case 'academy.stockbit.com': {
      presenceData.name += ' Academy'
      presenceData.details = 'Learning...'
      presenceData.smallImageKey = Assets.Reading
      break
    }
    case 'help.stockbit.com': {
      presenceData.details = 'In help center'
      presenceData.smallImageKey = Assets.Question
      break
    }
    case 'snips.stockbit.com': {
      presenceData.name += ' Snips'
      presenceData.smallImageKey = Assets.Reading
      if (pathList.length < 2) {
        presenceData.details = 'Scrolling articles'
      }
      else {
        presenceData.details = 'Reading article'
        let articleTitle = document.querySelector('h1.entry-title > a')?.textContent || ''
        if (articleTitle.length > 128) {
          articleTitle = `${articleTitle.slice(0, 125)}...`
        }
        presenceData.state = articleTitle
      }
      break
    }
    case 'stockbit.com': {
      switch (pathList[0] ?? '/') {
        case '/': {
          presenceData.details = 'In the homepage'
          break
        }
        case 'stream': {
          presenceData.details = 'Scrolling community insight'
          presenceData.smallImageKey = Assets.Viewing
          break
        }
        case 'watchlist': {
          presenceData.details = 'Looking at watchlist'
          presenceData.smallImageKey = Assets.Viewing
          break
        }
        case 'orderbook': {
          presenceData.details = 'Reading orderbook'
          presenceData.smallImageKey = Assets.Reading
          break
        }
        case 'e-ipo': {
          presenceData.details = 'Looking at e-IPO'
          presenceData.smallImageKey = Assets.Viewing
          break
        }
        case 'screener': {
          presenceData.details = 'In a stock screener'
          break
        }
        case 'academy': {
          if (pathname.startsWith('/academy/modules')) {
            const moduleName = document.querySelector('meta[name="title"]')?.getAttribute('content') || ''
            presenceData.state = `Module: ${moduleName}`
          }
          presenceData.details = 'Learning in academy'
          presenceData.smallImageKey = Assets.Reading
          break
        }
        case 'insider': {
          presenceData.details = 'Watching insider activity'
          presenceData.smallImageKey = Assets.Viewing
          break
        }
        case 'valuation': {
          presenceData.details = 'Using valuation tools'
          break
        }
        case 'sector': {
          presenceData.details = 'Watching market sector'
          presenceData.smallImageKey = Assets.Viewing
          if (pathList[1]) {
            const sectorName = document.querySelector('meta[name="title"]')?.getAttribute('content') || ''
            presenceData.state = `${sectorName.replace('Sektor ', '')}`
          }
          break
        }
        case 'calendar': {
          presenceData.details = 'Seeing calendar'
          presenceData.smallImageKey = Assets.Viewing
          break
        }
        case 'earnings': {
          presenceData.details = 'Reading earnings recap'
          presenceData.smallImageKey = Assets.Reading
          break
        }
        case 'glossary': {
          presenceData.details = 'Reading glossary'
          presenceData.smallImageKey = Assets.Reading
          break
        }
        case 'ebook': {
          presenceData.details = 'Looking for e-book'
          presenceData.smallImageKey = Assets.Search
          break
        }
        case 'post': {
          presenceData.details = 'Reading someone\'s post'
          presenceData.smallImageKey = Assets.Reading
          break
        }
        case 'search': {
          presenceData.details = 'Searching...'
          presenceData.smallImageKey = Assets.Search
          break
        }
        case 'catalog': {
          presenceData.details = 'Checking catalog'
          presenceData.state = document.querySelector('#catalog-title')?.textContent || ''
          break
        }
        case 'chat': {
          presenceData.details = 'Chatting with someone'
          break
        }
        case 'broadcast-chat': {
          presenceData.details = 'Reading broadcast chat'
          break
        }
        case 'symbol': {
          const symbolName = pathList[1]
          const symbolFullName = document.querySelector('div h1')?.textContent || ''
          const symbolLogo = document.querySelector<HTMLImageElement>('.company-header-icon')?.src
          presenceData.details = `Observing ${symbolName}`
          presenceData.smallImageKey = symbolLogo
          presenceData.smallImageText = symbolFullName || symbolName
          if (pathList[2] === 'chartbit') {
            presenceData.state = '📊 Playing with Chartbit'
          }
          break
        }
        case 'securities': {
          switch (pathList[1]) {
            case 'portfolio': {
              presenceData.details = 'Checking portfolio'
              break
            }
            case 'order': {
              presenceData.details = 'Checking order'
              break
            }
            case 'history': {
              presenceData.details = 'Checking history'
              break
            }
          }
          break
        }
      }
      break
    }
  }
  if (!presenceData.details) {
    presenceData.details = 'Browsing...'
  }
  presence.setActivity(presenceData)
})
