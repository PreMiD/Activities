import { Assets } from 'premid'

const presence = new Presence({
  clientId: '878203434468245545',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

let data: {
  writing: boolean
  details: string
  smallImageKey: string
} | null = null

presence.on(
  'iFrameData',
  async (recievedData: unknown) => {
    data = recievedData as typeof data
  },
)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/T/Toonily/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href, search, hostname } = document.location
  const buttons = await presence.getSetting<boolean>('buttons')

  if (document.querySelector('ul.search-main-menu.active')) {
    const searchBar = document.querySelector<HTMLInputElement>(
      'input.manga-search-field.ui-autocomplete-input',
    )
    presenceData.details = 'Searching'
    if (searchBar && searchBar.value)
      presenceData.state = searchBar.value
    presenceData.smallImageText = presenceData.smallImageKey = Assets.Search
  }
  else if (pathname === '/') {
    if (search) {
      const results = document.querySelector<HTMLHeadingElement>('h1.h4')
      presenceData.details = 'Looking at'
      if (results)
        presenceData.state = results.textContent
      presenceData.smallImageText = presenceData.smallImageKey = Assets.Search
    }
    else {
      presenceData.details = 'At homepage'
    }
  }
  else if (
    pathname === '/manga/'
    || pathname.startsWith('/manga-genre/')
    || pathname === '/webtoons'
    || pathname.startsWith('/webtoon-genre/')
    || pathname.startsWith('/webtoon-tag')
  ) {
    const order = document.querySelector<HTMLLIElement>(
      'div.c-nav-tabs > ul > li.active',
    )
    const category = document.querySelector<HTMLHeadingElement>('h1.item-title.h4')
    presenceData.details = `Looking for ${
      (pathname.startsWith('/manga-genre')
        || pathname.startsWith('/webtoon-genre')
        || pathname.startsWith('/webtoon-tag'))
      && category
        ? category.textContent
        : ''
    } ${hostname.endsWith('.com') ? 'Manhwas' : 'Mangas'}`
    if (order)
      presenceData.state = `Ordered By ${order.textContent}`
    presenceData.smallImageText = presenceData.smallImageKey = Assets.Viewing
  }
  else if (
    pathname.startsWith('/manga/')
    || pathname.startsWith('/webtoon/')
  ) {
    const title = document.querySelector<HTMLHeadingElement>(
      'div.post-title > h1',
    )
    const chapterHeading = document.querySelector<HTMLHeadingElement>('h1#chapter-heading')
    if (chapterHeading) {
      const [title, chapter] = chapterHeading.textContent?.split('-') ?? []
      presenceData.details = `Reading ${title}`
      if (data && data.writing) {
        presenceData.state = data.details
        presenceData.smallImageText = presenceData.smallImageKey = data.smallImageKey
      }
      else {
        presenceData.state = chapter
        presenceData.smallImageText = presenceData.smallImageKey = Assets.Reading
      }
      if (buttons) {
        presenceData.buttons = [
          { label: 'Read Manga', url: href },
          {
            label: 'Read Summary',
            url: href.substring(0, href.lastIndexOf('chapter')),
          },
        ]
      }
    }
    else if (location.hash) {
      presenceData.details = title?.textContent
      if (data && data.writing) {
        presenceData.state = data.details
        presenceData.smallImageText = presenceData.smallImageKey = data.smallImageKey
      }
      else {
        presenceData.state = 'Reading Commments'
        presenceData.smallImageText = presenceData.smallImageKey = Assets.Reading
      }
      if (buttons)
        presenceData.buttons = [{ label: 'See Comments', url: href }]
    }
    else {
      presenceData.details = 'Reading Summary'
      if (title)
        presenceData.state = title.textContent
      if (buttons)
        presenceData.buttons = [{ label: 'Read Summary', url: href }]
    }
  }
  else if (pathname.startsWith('/user-settings')) {
    const tab = document.querySelector<HTMLLIElement>('li.active')
    presenceData.details = 'Viewing User Settings'
    if (tab)
      presenceData.state = tab.textContent
  }
  else if (pathname === '/legal-disclaimer/') {
    presenceData.details = 'Legal Disclaimer'
  }
  else if (pathname.startsWith('/privacy-policy')) {
    presenceData.details = 'Privacy Policy'
  }
  else if (pathname === '/about-us/') {
    presenceData.details = 'About Us'
  }
  else if (pathname.startsWith('/contact')) {
    presenceData.details = 'Contact Us'
  }
  else if (pathname === '/terms') {
    presenceData.details = 'Terms of Service'
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
