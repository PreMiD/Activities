import { Assets } from 'premid'

const presence = new Presence({ clientId: '1080885668248559648' })
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/M/MangaFire/assets/logo.png',
}

interface PageData {
  details?: string
  smallImageKey?: string
  largeImageKey?: string
  state?: string
}

presence.on('UpdateData', async () => {
  const { pathname } = document.location
  const pathArr = pathname.split('/')
  const { details, smallImageKey, largeImageKey, state } = getPageData(
    pathArr[1]!,
    pathArr[2]!,
    document.querySelector('h1')?.textContent ?? '',
  )
  const presenceData: PresenceData = {
    largeImageKey: largeImageKey || ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    details,
  }
  if (smallImageKey)
    presenceData.smallImageKey = smallImageKey
  if (state)
    presenceData.state = state

  if (
    !(await presence.getSetting<boolean>('details'))
    && (pathArr[1] === 'manga' || pathArr[1] === 'read')
  ) {
    presenceData.largeImageKey = ActivityAssets.Logo
    presenceData.details = 'Reading manga...'
    presenceData.state = ''
  }

  if (details)
    presence.setActivity(presenceData)
})
function getPageData(
  page: string,
  pageDetails: string,
  title: string,
): PageData {
  switch (page) {
    case 'home':
      return { details: 'Viewing home...' }
    case 'filter':
      return { details: 'Filtering manga...', smallImageKey: Assets.Search }
    case 'type':
      return {
        details: `Browsing ${pageDetails}...`,
        smallImageKey: Assets.Search,
      }
    case 'genre':
      return {
        details: `Browsing ${pageDetails} genre...`,
        smallImageKey: Assets.Search,
      }
    case 'newest':
      return {
        details: 'Browsing latest releases...',
        smallImageKey: Assets.Search,
      }
    case 'updated':
      return {
        details: 'Browsing recently updated...',
        smallImageKey: Assets.Search,
      }
    case 'added':
      return {
        details: 'Browsing recently added...',
        smallImageKey: Assets.Search,
      }
    case 'az-list':
      return {
        details: 'Browsing AZ-list...',
        smallImageKey: Assets.Search,
      }
    case 'manga':
      return {
        details: `Viewing ${
          document.querySelector('.min-info > a:nth-child(1)')?.textContent // manga type
        }...`,
        state: title,
        largeImageKey: document.querySelector<HTMLImageElement>('div>img')?.src, // manga cover
      }
    case 'read':
      return {
        details: `Reading ${
          document.querySelector('.head > a:nth-child(1)')?.textContent
        } (${
          document.querySelector('.lang-view')?.textContent // language
        })`,
        state: `[${
          document.querySelector('div.viewing:nth-child(6) > span:nth-child(2)')
            ?.textContent // current page number | total page number
        }] ${document.querySelector('li > a.active')?.textContent}`, // Chapter or Volume content details
        smallImageKey: Assets.Reading,
      }
    case 'user':
      return getProfileDetail(pageDetails)
    case 'terms':
      return { details: 'Reading terms and conditions...' }
    case 'contact':
      return { details: 'Filling up the contact form...' }
    default:
      return { details: 'Browsing...', smallImageKey: Assets.Search }
  }
}
function getProfileDetail(pageDetails: string): PageData {
  const pageDetailsMap: { [key: string]: string } = {
    profile: 'Viewing their profile...',
    reading: 'Viewing their list of continue watching...',
    bookmark: 'Viewing their bookmarks...',
    notification: 'Viewing their notifications...',
    list: 'Importing their Anime list...',
    settings: 'Viewing their general settings...',
  }

  return { details: pageDetailsMap[pageDetails] || 'Changing settings...' }
}
