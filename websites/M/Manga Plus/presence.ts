const presence = new Presence({
  clientId: '923893773048619008',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

let cacheMangaURL: string | null | undefined, cacheMangaChapter: string | null | undefined

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    details: 'Browsing',
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/M/Manga%20Plus/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const { pathname } = document.location
  const mangaURL = document.querySelector<HTMLAnchorElement>(
    '#app div.Navigation-module_detailContainer_1aDk8 > a',
  )
  const mangaChapter = document.querySelector<HTMLParagraphElement>(
    '#app > div > div > div > div > div > div > p',
  )
  const buttons = await presence.getSetting<boolean>('buttons')

  // So that the script would stop throwing errors when the navigator collapses
  if (mangaURL?.href !== cacheMangaURL)
    cacheMangaURL = mangaURL?.href
  if (mangaChapter?.textContent !== cacheMangaChapter)
    cacheMangaChapter = mangaChapter?.textContent

  if (pathname.startsWith('/updates')) {
    presenceData.details = 'Browsing lastest updates'
  }
  else if (pathname.startsWith('/featured')) {
    presenceData.details = 'Browsing featured mangas'
  }
  else if (pathname.startsWith('/manga_list')) {
    if (pathname.includes('all'))
      presenceData.details = 'Browsing all mangas'
    else if (pathname.includes('hot'))
      presenceData.details = 'Browsing hottest mangas'
    else if (pathname.includes('updated'))
      presenceData.details = 'Browsing updated mangas'
  }
  else if (pathname.startsWith('/favorited')) {
    presenceData.details = 'Viewing favorited mangas'
  }
  else if (pathname.startsWith('/titles')) {
    presenceData.details = `Viewing: ${document.title.substring(
      0,
      document.title.lastIndexOf('-') - 1,
    )}`
    presenceData.state = document.title.substring(
      document.title.lastIndexOf('-') + 1,
      document.title.lastIndexOf('|') - 1,
    )
    presenceData.buttons = [{ label: 'View series', url: document.URL }]
  }
  else if (pathname.startsWith('/viewer')) {
    presenceData.details = `Reading: ${
      document.querySelector<HTMLHeadingElement>('#app a > h1')?.textContent
    }`
    presenceData.state = `Chapter ${cacheMangaChapter}`
    presenceData.buttons = [
      { label: 'Read chapter', url: document.URL },
      {
        label: 'View series',
        url: cacheMangaURL ?? '',
      },
    ]
  }
  if (!buttons)
    delete presenceData.buttons
  presence.setActivity(presenceData)
})
