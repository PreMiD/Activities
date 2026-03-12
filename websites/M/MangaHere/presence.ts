import { Assets } from 'premid'

const presence = new Presence({
  clientId: '831262912815300638',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/M/MangaHere/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const { pathname } = document.location
  const ganres = [
    'martial-arts',
    'action',
    'school-life',
    'sci-fi',
    'yoi',
    'shotacon',
    'mystery',
    'shoujo',
    'ecchi',
    'doujinshi',
    'lolicon',
    'adventure',
    'romance',
    'gender-bender',
    'harem',
    'sports',
    'webtoons',
    'comedy',
    'shounen-ai',
    'josei',
    'shoujo-ai',
    'adult',
    'fantasy',
    'supernatural',
    'psychological',
    'yuri',
    'one-shot',
    'historical',
    'drama',
    'seinen',
    'mature',
    'smut',
    'horror',
    'shounen',
    'slice-of-life',
    'tragedy',
    'mecha',
  ]

  switch (pathname) {
    case '/': {
      presenceData.details = 'Viewing the Homepage'
      break
    }
    case '/latest/': {
      presenceData.details = 'Browsing latest manga'
      break
    }
    case '/ranking/': {
      presenceData.details = 'Browsing by ranking'
      break
    }
    case '/spoilers/': {
      presenceData.details = 'Browsing spoilers and news'
      break
    }
    case '/directory/': {
      presenceData.details = 'Browsing all manga'
      break
    }
    case '/on_going/': {
      presenceData.details = 'Browsing ongoing manga'
      break
    }
    default:
      if (pathname.endsWith('/new/')) {
        const splitUrl = pathname.split('/')
        presenceData.details = splitUrl[1] === 'new'
          ? 'Browsing new manga'
          : `Browsing new ${splitUrl[1]} manga`
      }
      else if (pathname.endsWith('/completed/')) {
        // ganre/completed/
        const splitUrl = pathname.split('/')
        presenceData.details = splitUrl[1] === 'completed'
          ? 'Browsing completed manga'
          : `Browsing completed ${splitUrl[1]} manga`
      }
      else if (pathname.endsWith('/on_going/')) {
        // ganre/on_going/
        const splitUrl = pathname.split('/')
        presenceData.details = splitUrl[1] === 'on_going'
          ? 'Browsing ongoing manga'
          : `Browsing ongoing ${splitUrl[1]} manga`
      }
      else if (pathname.startsWith('/manga') && pathname.endsWith('/')) {
        // Manga Viewing
        presenceData.details = 'Viewing manga:'
        presenceData.state = document.querySelector(
          '.detail-info-right-title-font',
        )?.textContent
        presenceData.buttons = [
          { label: 'View Manga', url: window.location.href },
        ]
        presenceData.smallImageKey = Assets.Viewing
      }
      else if (pathname.startsWith('/manga') && pathname.endsWith('.html')) {
        // Manga Reading
        const chapter = document.querySelector(
          '.reader-header-title-2',
        )?.textContent
        // setting up page progress
        const current = document.querySelector('.pager-list-left span')
        if (!current) {
          presenceData.state = chapter
        }
        else {
          presenceData.state = `${chapter} page ${`${
            document.querySelector('.pager-list-left > span > .active')
              ?.textContent
          }/${current.children[current.children.length - 2]?.textContent}`}`
        }
        presenceData.details = document.querySelector(
          '.reader-header-title-1',
        )?.textContent
        presenceData.smallImageKey = Assets.Reading
      }
      else if (pathname.startsWith('/search')) {
        // Searching
        const urlParams = new URLSearchParams(window.location.search)
        presenceData.details = 'Searching:'
        presenceData.state = urlParams.get('title') === ''
          ? urlParams.get('name')
          : urlParams.get('title')
        presenceData.smallImageKey = Assets.Search
      }
  }
  for (const ganre of ganres) {
    if (pathname.substring(1, pathname.length - 1) === ganre) {
      presenceData.details = 'Browsing:'
      presenceData.state = `${ganre.replace('-', ' ')} manga`
    }
  }
  presence.setActivity(presenceData)
})
