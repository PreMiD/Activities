import { Assets } from 'premid'

const presence = new Presence({
  clientId: '868465354014359672',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
function setCookie(name: string, value: string, days: number) {
  let expires: string
  if (days) {
    const date = new Date()
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
    expires = `; expires=${date.toUTCString()}`
  }
  else {
    expires = ''
  }

  document.cookie = `${name}=${value}${expires}; path=/`
}
function getCookie(name: string) {
  const nameEQ = `${name}=`
  const ca = document.cookie.split(';')
  for (let c of ca) {
    while (c.charAt(0) === ' ') c = c.substring(1, c.length)

    if (c.indexOf(nameEQ) === 0)
      return c.substring(nameEQ.length, c.length)
  }
  return null
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/R/ReadComicsOnline/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href } = location
  const input = document.querySelector<HTMLInputElement>('input#keyword')
  const buttons = await presence.getSetting<boolean>('buttons')
  const cookies = await presence.getSetting<boolean>('cookies')

  if (cookies && input && input.value)
    setCookie('PMD_searchQuery', input.value, 1)

  switch (pathname) {
    case '/':
      presenceData.details = 'Looking for something to read'
      break
    case '/ComicList':
      presenceData.details = 'Browsing Comic List'
      presenceData.state = 'Sorted By Alphabet'
      break
    case '/ComicList/MostPopular':
      presenceData.details = 'Browsing Comic List'
      presenceData.state = 'Sorted By Popularity'
      break
    case '/ComicList/LatestUpdate':
      presenceData.details = 'Browsing Comic List'
      presenceData.state = 'Sorted By Latest Update'
      break
    case '/Profile':
      presenceData.details = 'Changing Profile Settings'
      break
    case '/BookmarkList':
      presenceData.details = 'Viewing Bookmarks'
      break
    case '/Message/ReportError':
      presenceData.details = 'Reporting Error'
      break
    case '/Search/Comic': {
      if (cookies)
        presenceData.details = `Searching for ${getCookie('PMD_searchQuery')}`
      else presenceData.details = 'Searching'
      break
    }
    case '/AdvanceSearch': {
      const comicName = document.querySelector<HTMLInputElement>('input#comicName')
      const include = document.querySelectorAll<HTMLAnchorElement>('label > a.include')
      const exclude = document.querySelectorAll<HTMLAnchorElement>('label > a.exclude')
      const status = document.querySelector<HTMLSelectElement>('select#status')

      presenceData.details = 'Advanced Search'

      if (cookies) {
        if (comicName && comicName.value) {
          setCookie(
            'PMD_searchQuery',
            `Looking for title: ${comicName.value}`,
            1,
          )
        }
        else if (include.length > 0) {
          setCookie(
            'PMD_searchQuery',
            `Searching for Genre: ${include[0]?.textContent} ${
              include.length > 1 ? `and ${include.length - 1} more` : ''
            }`,
            1,
          )
        }
        else if (exclude.length > 0) {
          setCookie(
            'PMD_searchQuery',
            `Searching for all Genres except: ${exclude[0]?.textContent} ${
              exclude.length > 1 ? `and ${exclude.length - 1} more` : ''
            }`,
            1,
          )
        }
        else if (status) {
          setCookie(
            'PMD_searchQuery',
            `Looking for: ${status.selectedOptions[0]?.textContent} comics`,
            1,
          )
        }
        else {
          [presenceData.details, presenceData.state] = getCookie('PMD_searchQuery')?.split(':') ?? []
        }
      }
      break
    }
    default:
      if (pathname.startsWith('/Genre')) {
        const barTitle = document.querySelector<HTMLDivElement>('.barTitle')
        if (barTitle)
          presenceData.details = `Looking for ${barTitle.textContent}`
        if (pathname.includes('MostPopular'))
          presenceData.state = 'Sorted By Popularity'
        else if (pathname.includes('LatestUpdate'))
          presenceData.state = 'Sorted By Latest Update'
        else presenceData.state = 'Sorted by Alphabet'
      }
      else if (pathname.startsWith('/Comic')) {
        if (document.querySelector('div#divImage')) {
          const title = document.querySelector<HTMLAnchorElement>('#navsubbar > p > a')
          const episode = document.querySelector<HTMLSelectElement>(
            'select#selectEpisode',
          )
          || document.querySelector<HTMLSelectElement>('select.selectEpisode')
          const page = document.querySelector<HTMLSelectElement>('select#selectPage')
          if (title) {
            presenceData.details = title.textContent?.substring(
              6,
              title.textContent.indexOf('information'),
            )
            presenceData.smallImageKey = Assets.Reading
            if (episode) {
              presenceData.state = episode.selectedOptions[0]?.textContent?.trim()
            }
            if (page)
              presenceData.state += `, Page: ${page.selectedOptions[0]?.textContent?.trim()}`
            if (buttons) {
              presenceData.buttons = [
                {
                  label: 'Read Comic',
                  url: href,
                },
                {
                  label: 'Check Description',
                  url: title.href,
                },
              ]
            }
          }
        }
        else {
          const title = document.querySelector<HTMLAnchorElement>('a.bigChar')
          if (title)
            presenceData.details = title.textContent
          presenceData.state = 'Looking for issue to read'
          if (buttons) {
            presenceData.buttons = [
              {
                label: 'Check Description',
                url: href,
              },
            ]
          }
        }
      }
      else if (pathname.startsWith('/Special')) {
        presenceData.details = document.title
      }
      else {
        const barTitle = document.querySelector<HTMLDivElement>('.barTitle')
        if (barTitle)
          presenceData.details = barTitle.textContent
      }
      break
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
