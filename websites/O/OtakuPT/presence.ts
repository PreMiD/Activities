const presence = new Presence({
  clientId: '1376189266396450967',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.imgur.com/5DSVuza.png',
}
async function getStrings() {
  return presence.getStrings({
    search: 'general.searchFor',
    viewHome: 'general.viewHome',
    buttonReadArticle: 'general.buttonReadArticle',
    readingArticle: 'general.readingArticle',
    viewUser: 'general.viewUser',
    viewCategory: 'general.viewCategory',
    viewPage: 'general.viewPage',
    privacy: 'general.privacy',
    terms: 'general.terms',
  })
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href, search } = document.location
  const strings = await getStrings()

  switch (pathname.split('/')[1]) {
    case 'page':
      presenceData.details = 'Vendo arquivo'
      presenceData.state = `na página ${pathname.split('/')[2]}`
      break
    case 'author':
      presenceData.details = strings.viewUser
      presenceData.state = document.querySelector('h1')?.textContent
      presenceData.largeImageKey = document.querySelector<HTMLDivElement>('.tdb-author-img')?.style.backgroundImage.slice(4, -1).replaceAll('"', '') ?? ActivityAssets.Logo
      break
    case 'category':
      presenceData.details = strings.viewCategory
      presenceData.state = document.querySelector('h1')?.textContent
      break
    case 'contacto':
      presenceData.details = strings.viewPage
      presenceData.state = 'Contacto'
      break
    case 'privacidade':
      presenceData.details = strings.viewPage
      presenceData.state = strings.privacy
      break
    case 'termos-de-utilizacao':
      presenceData.details = strings.viewPage
      presenceData.state = strings.terms
      break
    case 'estatuto-editorial':
      presenceData.details = strings.viewPage
      presenceData.state = 'Estatuto editorial'
      break
    default: {
      const searching = search?.split('=')[1]?.replaceAll('+', ' ') ?? false
      presenceData.details = decodeURIComponent(
        searching ? strings.search : strings.viewHome,
      )
      if (searching)
        presenceData.state = search?.split('=')[1]?.replaceAll('+', ' ') ?? ''
      if (pathname.split('/')[2]) {
        presenceData.details = strings.readingArticle
        presenceData.state = document.querySelector('.tdb-title-text')?.textContent
        presenceData.largeImageKey = document.querySelector<HTMLMetaElement>('[property="og:image"]')?.content ?? ActivityAssets.Logo
        presenceData.buttons = [
          { label: strings.buttonReadArticle, url: href },
        ]
      }
      break
    }
  }

  presence.setActivity(presenceData)
})
