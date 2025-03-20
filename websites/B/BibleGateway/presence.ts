const presence = new Presence({
  clientId: '958805663532859473',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/B/BibleGateway/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const { pathname, search } = location
  switch (pathname) {
    case '/': {
      presenceData.details = 'Browsing the homepage'
      break
    }
    case '/passage/': {
      if (new URLSearchParams(search).get('search')) {
        presenceData.details = 'Reading scripture'
        presenceData.state = Array.from(
          document.querySelectorAll(
            '.passage-display > div:first-child .dropdown-display-text',
          ),
        )
          .map(el => el.textContent)
          .join(', ')
      }
      else {
        presenceData.details = 'Searching for scripture'
      }
      break
    }
    case '/keyword/':
    case '/topical/': {
      presenceData.details = 'Searching for scripture'
      break
    }
    case '/topical/topical_searchresults/': {
      const searchQuery = document.querySelector('.current')?.textContent ?? ''
      presenceData.details = 'Browsing topical search results'
      presenceData.state = searchQuery.substring(1, searchQuery.length - 1)
      break
    }
    case '/quicksearch/': {
      const searchQuery = document.querySelector('.search-term')?.textContent ?? ''
      presenceData.details = 'Browsing quick search results'
      presenceData.state = searchQuery.substring(1, searchQuery.length - 1)
      break
    }
    default:
      if (/\/verse\/.+/.test(pathname)) {
        presenceData.details = 'Browsing verse translations'
        presenceData.state = document
          .querySelector('.long-heading')
          ?.textContent
          ?.replace(/^\s+/, '')
          ?.replace(/\s+$/, '')
      }
      else if (pathname === '/versions/') {
        presenceData.details = 'Browsing versions'
      }
      else if (/\/versions\/.+/.test(pathname)) {
        presenceData.details = 'Browsing version details'
        presenceData.state = document
          .querySelector('.bread-crumb')
          ?.childNodes[2]
          ?.textContent
          ?.replace(/^\s+\/\s+/, '')
          ?.replace(/\s+$/, '')
          .replace(/\s+(?=\s\()/, '')
      }
      else if (/\/devotionals\/.+/.test(pathname)) {
        presenceData.details = 'Browsing devotional'
        presenceData.state = document
          .querySelector('.long-heading')
          ?.textContent
          ?.split('/')[1]
      }
      else if (pathname.startsWith('/blog/')) {
        const blogPath = pathname.substring(5)
        if (blogPath === '/') {
          presenceData.details = 'Browsing blog'
          presenceData.state = 'Home page'
        }
        else if (blogPath.startsWith('/author/')) {
          presenceData.details = 'Browsing blog author'
          presenceData.state = document.title?.match(/.*?(?=,)/)?.[0]
        }
        else {
          presenceData.details = 'Browsing blog'
          presenceData.state = document.querySelector(
            '.content-heading',
          )?.childNodes[3]?.textContent
        }
      }
      else {
        const pageTitle = document.querySelector('.long-heading')
        presenceData.details = 'Browsing'
        if (pageTitle) {
          presenceData.state = pageTitle.textContent
            ?.replace(/^\s+/, '')
            ?.replace(/\s+$/, '')
        }
        else {
          presenceData.state = document.title
        }
      }
  }

  presence.setActivity(presenceData)
})
