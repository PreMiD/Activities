import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1320791530956652544',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/R/Royal%20Road/assets/logo.png',
}

// Todo - Multilanguage functionality as hard to test atm due to bugs.
async function getStrings() {
  return presence.getStrings({
    home: 'general.viewHome',
    search: 'general.searchFor',
    browse: 'general.browsing',
    buttonViewPage: 'general.buttonViewPage',
    reading: 'general.reading',
    chapter: 'general.chapter',
    buttonViewProfile: 'general.buttonViewProfile',
  })
}

let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null

presence.on('UpdateData', async () => {
  let presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    details: 'Unsupported page',
    smallImageKey: Assets.Viewing,
    smallImageText: 'Browsing on Royal Road',
  }
  const { href, pathname } = document.location
  const [showTimestamp, showButtons, newLang, privacy] = await Promise.all([
    presence.getSetting<boolean>('timestamp'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('privacy'),
  ])

  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }

  if (privacy) {
    presenceData.details = strings.browse
    presence.setActivity(presenceData)
    return
  }

  const pages: Record<string, PresenceData> = {
    '/home': {
      details: 'Viewing home page',
    },
    '/premium': {
      details: 'Viewing Premium Plans',
    },
  }

  for (const [path, data] of Object.entries(pages)) {
    if (pathname.includes(path))
      presenceData = { ...presenceData, ...data } as PresenceData
  }

  const page = `Page ${
    href.includes('?page=') ? href.split('?page=')[1]?.split('&genre')[0] : 1
  }`
  const genre = `${
    href.includes('genre=')
      ? href.split('genre=')[1]?.toLocaleUpperCase()
      : 'ALL'
  } Genre`

  // Read Navbar options - /functions/x
  if (pathname.includes('/fictions/best-rated')) {
    presenceData.details = 'Viewing Best Rated fictions'
    presenceData.state = `${page} · ${genre}`
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = 'Viewing fictions on Royal Road'
    presenceData.buttons = [
      {
        label: 'View Page',
        url: href,
      },
    ]
  }
  else if (pathname.includes('/fictions/trending')) {
    presenceData.details = 'Viewing Trending Fictions'
    presenceData.state = `Top 50 · ${genre}`
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = 'Viewing Trending Fictions on Royal Road'
    presenceData.buttons = [
      {
        label: 'View Page',
        url: href,
      },
    ]
  }
  else if (pathname.includes('/fictions/active-popular')) {
    presenceData.details = 'Viewing Ongoing Fictions'
    presenceData.state = `${page} · ${genre}`
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = 'Viewing Ongoing Fictions on Royal Road'
    presenceData.buttons = [
      {
        label: 'View Page',
        url: href,
      },
    ]
  }
  else if (pathname.includes('/fictions/complete')) {
    presenceData.details = 'Viewing Complete Fictions'
    presenceData.state = `${page} · ${genre}`
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = 'Viewing Complete Fictions on Royal Road'
    presenceData.buttons = [
      {
        label: 'View Page',
        url: href,
      },
    ]
  }
  else if (pathname.includes('/fictions/weekly-popular')) {
    presenceData.details = 'Viewing Popular Fictions'
    presenceData.state = `${page} · ${genre}`
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = 'Viewing Popular Fictions on Royal Road'
    presenceData.buttons = [
      {
        label: 'View Page',
        url: href,
      },
    ]
  }
  else if (pathname.includes('/fictions/latest-updates')) {
    presenceData.details = 'Viewing Updated Fictions'
    presenceData.state = `${page} · ${genre}`
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = 'Viewing Updated Fictions on Royal Road'
    presenceData.buttons = [
      {
        label: 'View Page',
        url: href,
      },
    ]
  }
  else if (pathname.includes('/fictions/new')) {
    presenceData.details = 'Viewing Newest Fictions'
    presenceData.state = `${page} · ${genre}`
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = 'Viewing Newest Fictions on Royal Road'
    presenceData.buttons = [
      {
        label: 'View Page',
        url: href,
      },
    ]
  }
  else if (pathname.includes('/fictions/rising-stars')) {
    presenceData.details = 'Viewing Rising Stars'
    presenceData.state = `Top 50 · ${genre}`
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = 'Viewing Rising Stars on Royal Road'
    presenceData.buttons = [
      {
        label: 'View Page',
        url: href,
      },
    ]
  }
  else if (pathname.includes('/fictions/writathon')) {
    presenceData.details = `Viewing ${
      document.querySelector('div.caption > h1.font-red-sunglo')?.textContent
    }`
    presenceData.state = `${page} · ${genre}`
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = 'Viewing Writathon on Royal Road'
    presenceData.buttons = [
      {
        label: 'View Page',
        url: href,
      },
    ]
  }
  else if (pathname.includes('/fictions/search')) {
    presenceData.details = strings.search
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = 'Searching on Royal Road'

    if (href.includes('?title='))
      presenceData.state = href.split('?title=')[1]
    else presenceData.state = 'Specific search criteria'

    // Fiction pages
  }
  else if (pathname.includes('/chapter')) {
    presenceData.details = `${
      document.querySelector('h2.font-white')?.textContent
    } by ${document.querySelector('h3.font-white')?.textContent}`
    presenceData.state = document.querySelector('h1.font-white')?.textContent
    presenceData.largeImageKey = document
      .querySelector('img.img-offset')
      ?.getAttribute('src')
    presenceData.smallImageText = `Reading ${
      document
        .querySelector('button.btn.btn-primary.col-xs-12')
        ?.getAttribute('disabled')
        ? `${strings.chapter} 1`
        : ''
    }`
    presenceData.smallImageKey = Assets.Reading
    presenceData.buttons = [
      {
        label: 'Read',
        url: href,
      },
    ]
  }
  else if (pathname.includes('/fiction')) {
    presenceData.details = `${
      document.querySelector('h1.font-white')?.textContent
    } ${document.querySelector('h4.font-white')?.textContent}`
    presenceData.state = `${
      document.querySelector('span.label.label-default.pull-right')?.textContent
    } · ${
      document.querySelectorAll('ul.list-unstyled > li.font-red-sunglo')[5]
        ?.textContent
    } Pages`
    presenceData.largeImageKey = document
      .querySelector('img.thumbnail')
      ?.getAttribute('src')
    presenceData.smallImageText = 'Viewing on Royal Road'
    presenceData.smallImageKey = ActivityAssets.Logo
    presenceData.buttons = [
      {
        label: 'Start Reading',
        url: `https://royalroad.com${document
          .querySelector('a.btn.btn-lg.btn-primary')
          ?.getAttribute('href')}`,
      },
      {
        label: 'View Author',
        url: `https://royalroad.com${document
          .querySelector('h4.font-white > span > a.font-white')
          ?.getAttribute('href')}`,
      },
    ]
  }
  else if (pathname.includes('/profile')) {
    const stats = document.querySelectorAll('span.stat-value')

    presenceData.details = document.querySelector('h1')?.textContent
    presenceData.state = `${stats[0]?.textContent} Followers · ${stats[3]?.textContent} Fictions`
    if (
      document
        .querySelector('img.img-circle')
        ?.getAttribute('src')
        ?.includes('anon')
    ) {
      presenceData.largeImageKey = ActivityAssets.Logo
    }
    else {
      presenceData.largeImageKey = document
        .querySelector('img.img-circle')
        ?.getAttribute('src')
    }
    presenceData.smallImageKey = ActivityAssets.Logo
    presenceData.smallImageText = 'Viewing on Royal Road'
    presenceData.buttons = [
      {
        label: 'View Profile',
        url: href,
      },
    ]

    // Forum pages
  }
  else if (pathname.includes('/forums/thread')) {
    presenceData.details = document.querySelector('div > h2')?.textContent
    presenceData.state = page
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = 'Reading forum on Royal Road'
  }
  else if (pathname.includes('/forums')) {
    presenceData.details = strings.browse
    presenceData.state = 'Forum'
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = 'Browsing forums on Royal Road'
  }
  else if (pathname.includes('/ideas')) {
    presenceData.details = document.querySelector(
      'div.ideas > div.image-header > div > h2',
    )?.textContent
    presenceData.state = `Submitted by ${
      document.querySelector('a.username > span')?.textContent
    }`
    presenceData.smallImageKey = document
      .querySelector('span.user > img.avatar')
      ?.getAttribute('src')
  }

  if (!showButtons)
    delete presenceData.buttons
  if (showTimestamp)
    presenceData.startTimestamp = browsingTimestamp

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
