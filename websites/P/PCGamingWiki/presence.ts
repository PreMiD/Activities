const presence = new Presence({
  clientId: '1325499066565656647',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/P/PCGamingWiki/assets/0.png',
}

presence.on('UpdateData', async () => {
  const { pathname, search, href, hostname } = document.location
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    details: 'Viewing Page:',
  }

  switch (hostname) {
    case 'community.pcgamingwiki.com': {
      switch (pathname.split('/')[1]) {
        case 'topic': {
          presenceData.details = 'On Topic:'
          presenceData.state = document.querySelector(
            'span.ipsType_break > span:nth-child(1)',
          )
          presenceData.buttons = [{ label: 'View Topic', url: href }]
          break
        }
        case 'forum': {
          presenceData.details = 'On Forum:'
          presenceData.state = document.querySelector('.ipsType_pageTitle')
          presenceData.buttons = [{ label: 'View Forum', url: href }]
          break
        }
        case 'profile': {
          presenceData.details = 'Viewing Profile:'
          presenceData.state = document.querySelector('h1.ipsType_reset')
          break
        }
        case 'staff': {
          presenceData.details = 'On Staff page'
          break
        }
        case 'leaderboard':
        case 'pastleaders':
        case 'topmembers': {
          presenceData.details = 'On Leaderboard page'
          break
        }
        case 'gallery': {
          if (pathname.split('/')[2] === 'image') {
            presenceData.details = 'Viewing Image:'
            presenceData.state = document.querySelector('span.ipsContained')
            presenceData.buttons = [{ label: 'View Image', url: href }]
          }
          else {
            presenceData.details = 'On Gallery page'
          }
          break
        }
        case 'online': {
          presenceData.details = 'Viewing Online Users'
          break
        }
        case 'files': {
          if (pathname.split('/')[2] === 'file') {
            presenceData.details = 'Viewing File:'
            presenceData.state = document.querySelector(
              'h1.ipsType_pageTitle > span:nth-child(1)',
            )
            presenceData.buttons = [{ label: 'View File', url: href }]
          }
          else {
            presenceData.details = 'Viewing Files page'
          }
          break
        }
        case 'tags': {
          presenceData.details = 'Searching for tag:'
          presenceData.state = decodeURIComponent(pathname.split('/')[2]!)
          break
        }
        case 'search': {
          presenceData.details = 'On Search Page'
          if (search.split('=')[1]) {
            presenceData.details = 'Searching the Community for:'
            presenceData.state = decodeURIComponent(
              search.split('=')[1]!,
            ).replace('&search_and_or', '')
          }
          break
        }
        case 'discover': {
          presenceData.details = 'Viewing All Activity'
          break
        }
        default: {
          presenceData.details = 'Exploring Community'
          break
        }
      }
      break
    }
    default: {
      switch (pathname.split('/')[2]) {
        case 'Home': {
          presenceData.details = 'In Home'
          break
        }
        case 'PCGamingWiki:About': {
          presenceData.state = 'About Us'
          break
        }
        case 'index.php': {
          if (decodeURIComponent(search.split('=')[2]!) === 'edit') {
            presenceData.details = 'Viewing Source of:'
            presenceData.state = document
              .querySelector('.article-title')
              ?.textContent
              ?.trim()
              .replace('View source for ', '')
          }
          if (decodeURIComponent(search.split('=')[2]!) === 'history') {
            presenceData.details = 'Viewing revision history of:'
            presenceData.state = document
              .querySelector('.article-title')
              ?.textContent
              ?.trim()
              .replace('Revision history of ', '')
              .slice(1, -1)
          }
          else {
            presenceData.details = 'Searching for:'
            presenceData.state = decodeURIComponent(
              search.split('=')[1]!,
            ).replace('&title', '')
          }
          break
        }
        default: {
          presenceData.state = document
            .querySelector('.article-title')
            ?.textContent
            ?.trim()
          break
        }
      }
      break
    }
  }

  presence.setActivity(presenceData)
})
