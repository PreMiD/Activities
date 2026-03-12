const presence = new Presence({
  clientId: '1293341957141303307',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/B/Brave%20Search/assets/logo.png',
}

async function getStrings() {
  return presence.getStrings({
    search: 'general.searchFor',
    searchPrivate: 'general.searchSomething',
    home: 'general.viewHome',
    viewPage: 'general.viewPage',
    settings: 'bravesearch.settings',
    help: 'bravesearch.help',
    searchNews: 'bravesearch.searchNewsFor',
    searchNewsPrivate: 'bravesearch.searchNewsSomething',
    searchVid: 'bravesearch.searchVidFor',
    searchVidPrivate: 'bravesearch.searchVidSomething',
    searchImg: 'bravesearch.searchImgFor',
    searchImgPrivate: 'bravesearch.searchImgSomething',
    searchGoggles: 'bravesearch.searchNewsFor',
    searchGogglesPrivate: 'bravesearch.searchNewsSomething',
  })
}

let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null

presence.on('UpdateData', async () => {
  const newLang = await presence.getSetting<string>('lang').catch(() => 'en')

  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }

  const { pathname } = document.location
  const privacy = await presence.getSetting('privacy')
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    details: strings.home,
    state: privacy
      ? undefined
      : document.querySelector<HTMLInputElement>('#searchbox')?.value,
  }

  switch (pathname.split('/')[1]) {
    case 'settings': {
      presenceData.details = strings.settings
      delete presenceData.state
      break
    }
    case 'help': {
      presenceData.details = strings.viewPage
      presenceData.state = !privacy
        ? document.querySelector('.post-title')?.textContent?.trim()
        : strings.help
      break
    }
    case 'search': {
      presenceData.details = !privacy ? strings.search : strings.searchPrivate
      break
    }
    case 'images': {
      presenceData.details = !privacy
        ? strings.searchImg
        : strings.searchImgPrivate
      break
    }
    case 'news': {
      presenceData.details = !privacy
        ? strings.searchNews
        : strings.searchNewsPrivate
      break
    }
    case 'videos': {
      presenceData.details = !privacy
        ? strings.searchVid
        : strings.searchVidPrivate
      break
    }
    case 'goggles': {
      presenceData.details = !privacy
        ? strings.searchGoggles
        : strings.searchGogglesPrivate
      break
    }
    default: {
      delete presenceData.state
      break
    }
  }

  presence.setActivity(presenceData)
})
