import { Assets } from 'premid'

const presence = new Presence({
  clientId: '503557087041683458',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/W/Wiki.gg/assets/logo.png',
}
let title: string

async function getStrings() {
  return presence.getStrings(
    {
      browse: 'general.browsing',
      search: 'general.searchFor',
      viewHome: 'general.viewHome',
      buttonViewPage: 'general.buttonViewPage',
      buttonViewProfile: 'general.buttonViewProfile',
    },

  )
}

function capitalizeFirstLetter(string: string) {
  if (!string)
    return 'Undefined'
  return (
    string.trim().charAt(0).toUpperCase() + string.trim().slice(1).toLowerCase()
  )
}
let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    name: 'Wiki.gg',
  }
  const { pathname, hostname, href } = document.location
  const [newLang, privacy, buttons] = await Promise.all([
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('buttons'),
  ])
  const main = document
    .querySelector('[id="ca-nstab-main"]')
    ?.textContent
    ?.toLowerCase() ?? ''
  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }
  if (privacy) {
    presenceData.details = strings.browse
    presence.setActivity(presenceData)
    return
  }
  if (hostname === 'wiki.gg') {
    if (pathname === '/') {
      presenceData.details = strings.viewHome
    }
    else {
      presenceData.details = document
        .querySelector('head > title')
        ?.textContent
        ?.slice(0, -10)
    }
  }
  else {
    title = capitalizeFirstLetter(
      document
        .querySelector('[property="og:site_name"]')
        ?.getAttribute('content')
        ?.toLowerCase()
        ?? document
          .querySelector('[property="og:title"]')
          ?.getAttribute('content')
          ?.toLowerCase()
          ?? document
            .querySelector('[id="footer-places-about"]')
            ?.textContent
            ?.replace(/About /g, '')
            ?.toLowerCase() ?? '',
    )
    let search: HTMLInputElement | NodeListOf<HTMLInputElement> = document.querySelectorAll<HTMLInputElement>('input[id=\'searchInput\']')
      ?? document.querySelectorAll<HTMLInputElement>('input[name=\'search\']')
    if (search.length === 1)
      search = search[0]!
    else search = search[1]!
    presenceData.largeImageKey = `https://${hostname}/images/e/e6/Site-logo.png`
    if (search?.value) {
      presenceData.state = search.value
      title = `${title} | ${strings.search?.toLowerCase()}`
      presenceData.details = title
      presenceData.smallImageKey = Assets.Search
    }
    else if (pathname.includes('wiki') && main !== 'main page') {
      presenceData.smallImageKey = Assets.Reading
      const firstHeading = document
        .querySelector('#firstHeading')
        ?.textContent
        ?.toLowerCase()
      presenceData.details = title
      if (firstHeading?.includes(':')) {
        presenceData.state = `${capitalizeFirstLetter(
          document
            .querySelector('#firstHeading')
            ?.textContent
            ?.toLowerCase()
            .split(':')[0] ?? '',
        )} | ${
          document
            .querySelector('#firstHeading')
            ?.textContent
            ?.toLowerCase()
            .split(':')[1]
        }`
      }
      else {
        presenceData.state = capitalizeFirstLetter(firstHeading ?? '')
      }
      presenceData.buttons = [
        {
          label: strings.buttonViewPage,
          url: href,
        },
      ]
    }
    else if (pathname === '/' || main === 'main' || main === 'main page') {
      presenceData.state = strings.viewHome
      presenceData.details = title
    }
  }
  if (!buttons && presenceData.buttons)
    delete presenceData.buttons
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
