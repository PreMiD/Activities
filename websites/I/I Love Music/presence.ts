import { Assets } from 'premid'

const presence = new Presence({
  clientId: '477919120789078026',
})
const browsingStamp = Math.floor(Date.now() / 1000)
async function getStrings() {
  return presence.getStrings(
    {
      browse: 'general.browsing',
      buttonViewPage: 'general.buttonViewPage',
      search: 'general.searchFor',
    },
    await presence.getSetting<string>('lang').catch(() => 'de'),
  )
}
let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/I/I%20Love%20Music/assets/logo.png',
}

async function imgPath(path: string, hostname: string) {
  if (path) {
    if (path.includes(hostname))
      return `https://${path.replace('//', '')}`
    else return `https://${hostname}${path}`
  }
  else {
    return ActivityAssets.Logo
  }
}
function capitalizeFirstLetter(string: string) {
  if (string) {
    return (
      string.trim().charAt(0).toUpperCase()
      + string.trim().slice(1).toLowerCase()
    )
  }
}
presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingStamp,
  }
  const { pathname, hostname, href } = document.location
  const playing = document.querySelector('section[class*="playing"]')
  const currently = playing
    ?.querySelector('[class="bottom"]')
    ?.querySelectorAll('h2,h3')
  const search = document.querySelector<HTMLInputElement>('[type="text"]')
  const newLang = await presence.getSetting<string>('lang').catch(() => 'de')
  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }
  if (
    search?.value
    && document.querySelector('[class="toggleMenu search display-menu"]')
  ) {
    presenceData.details = strings.search
    presenceData.state = search?.value
      || document
        .querySelector(
          'body > div.container.main-container.min-vh-100.px-3 > h3',
        )
        ?.textContent
        ?.split('"')[1]
        || 'Niks'
    presenceData.smallImageKey = Assets.Search
    presence.setActivity(presenceData)
    return
  }
  if (document.querySelector('[class="toggleMenu left display-menu"]')) {
    presenceData.details = 'Anzeige des Menüs'
  }
  else if (Number(document.querySelector('#playstop')?.textContent) === 1) {
    presenceData.buttons = [
      {
        label: 'Hören Sie Den Sender',
        url: href,
      },
    ]
    presenceData.details = capitalizeFirstLetter(
      document.querySelector(
        '#content > div.single-outer.channelbgcolor > section.bottom.channelinfo > h2',
      )?.textContent
      ?? currently?.[1]?.textContent
      ?? 'Das Radio hören',
    )
    presenceData.state = capitalizeFirstLetter(
      document.querySelector(
        '#content > div.single-outer.channelbgcolor > section.bottom.channelinfo > h3',
      )?.textContent ?? currently?.[0]?.textContent ?? '',
    )
    presenceData.smallImageKey = Assets.Play
    presenceData.smallImageText = capitalizeFirstLetter(
      document.querySelector('[class="channel-headline big"]')?.textContent
      ?? playing?.querySelector('h1')?.textContent ?? '',
    )
    presenceData.largeImageKey = await imgPath(
      document
        .querySelector('[class="single-outer"]')
        ?.querySelector('img')
        ?.getAttribute('src')
        ?? playing?.querySelector('img')?.getAttribute('src') ?? '',
      hostname,
    )
  }
  else if (pathname !== '/') {
    presenceData.details = `${capitalizeFirstLetter(
      document.querySelector('[class="big "]')?.textContent ?? '',
    )} anschauen`
    presenceData.buttons = [
      {
        label: strings.buttonViewPage,
        url: href,
      },
    ]
  }
  else {
    presenceData.details = strings.browse
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
