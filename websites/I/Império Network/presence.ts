const presence = new Presence({
  clientId: '503557087041683458',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/I/Imp%C3%A9rio%20Network/assets/logo.png',
}

async function getStrings() {
  return presence.getStrings({
    search: 'general.searchFor',
    viewHome: 'general.viewHome',
    buttonViewPage: 'general.buttonViewPage',
    read: 'general.readingArticle',
    viewCategory: 'general.viewCategory',
    browsing: 'general.browsing',
    readingAbout: 'general.readingAbout',
  })
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    name: 'Império Network',
  }
  const strings = await getStrings()
  const { pathname, href, search } = document.location

  switch (pathname.split('/')[1]) {
    case 'categoria': {
      presenceData.details = strings.viewCategory
      presenceData.state = document.querySelector('#posts-grid > li > a > article > div > div > a')
      break
    }
    case 'post': {
      presenceData.details = strings.read
      presenceData.state = document.querySelector('h1.flex')
      presenceData.largeImageKey = document.querySelector<HTMLImageElement>('.object-cover') ?? ActivityAssets.Logo
      presenceData.buttons = [
        {
          label: strings.buttonViewPage,
          url: href,
        },
      ]
      break
    }
    case 'review-policy':
    case 'privacy':
    case 'sobre':
    case 'contato': {
      presenceData.details = strings.readingAbout
      presenceData.state = document.querySelector('h1.text-2xl')
      break
    }
    case 'search': {
      presenceData.details = strings.search
      presenceData.state = decodeURIComponent(
        search?.split('=')[1] ?? '',
      )
      break
    }
    default: {
      presenceData.details = strings.viewHome
      if (pathname.split('/')[1])
        presenceData.details = strings.browsing
      break
    }
  }

  presence.setActivity(presenceData)
})
