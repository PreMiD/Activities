enum ActivityAssets {
  Cog = 'https://cdn.rcd.gg/PreMiD/websites/V/VtuberWiki/assets/0.png',
  Book = 'https://cdn.rcd.gg/PreMiD/websites/V/VtuberWiki/assets/1.png',
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/V/VtuberWiki/assets/logo.png',
  Log = 'https://cdn.rcd.gg/PreMiD/websites/V/VtuberWiki/assets/2.png',
}

type StaticPagesType = Record<string, PresenceData>

const presence = new Presence({
  clientId: '503557087041683458',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
const staticPages: StaticPagesType = {
  '/': {
    details: 'Viewing the homepage',
  },
  '/faq': {
    details: 'Viewing the FAQ',
    buttons: [{ label: 'View The FAQ', url: 'https://www.vtubers.wiki/faq' }],
  },
  '/api': {
    details: 'Viewing the API',
    buttons: [{ label: 'View the API', url: 'https://www.vtubers.wiki/api' }],
  },
  '/changelog': {
    details: 'Viewing the Changelog',
    largeImageKey: ActivityAssets.Log,
    buttons: [
      {
        label: 'View the Changelog',
        url: 'https://www.vtubers.wiki/changelog',
      },
    ],
  },
  '/about': {
    details: 'Viewing the About Page',
    buttons: [
      { label: 'View the About Page', url: 'https://www.vtubers.wiki/about' },
    ],
  },
  '/donate': {
    details: 'Viewing the Donate Page',
    buttons: [
      {
        label: 'View the Donate Page',
        url: 'https://www.vtubers.wiki/donate',
      },
    ],
  },
  '/search': {
    details: 'Searching the wiki',
    state: 'Searching...',
    buttons: [
      {
        label: 'View the Search Engine',
        url: 'https://www.vtubers.wiki/search',
      },
    ],
  },
}

presence.on('UpdateData', async () => {
  const { pathname, href } = document.location
  const pathSplit = pathname.split('/').slice(1)
  const pageTitle = document.title.split(' | ')[0]?.trim()

  let presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    name: 'Vtuber Wiki',
  }

  for (const [path, data] of Object.entries(staticPages)) {
    if (pathname.startsWith(path))
      presenceData = { ...presenceData, ...data } as PresenceData
  }

  switch (pathSplit[0]) {
    case 'wiki':
      switch (pathSplit[1]) {
        case 'vtubers':
          if (pathSplit[2]) {
            presenceData.largeImageKey = `https://vtubers.wiki/${document
              .querySelector<HTMLImageElement>('#vtuber-image')
              ?.getAttribute('src')}`
            presenceData.details = 'Viewing a Vtuber'
            presenceData.state = `${pageTitle} • ${
              document.querySelector('#vtuber-desc')?.textContent
            }`
            presenceData.smallImageKey = ActivityAssets.Logo
            presenceData.smallImageText = 'Vtuber Wiki'
            presenceData.buttons = [{ label: `View ${pageTitle}`, url: href }]
          }
          else {
            presenceData.details = 'Viewing All The Vtubers'
          }

          break
        case 'software':
          if (pathSplit[2]) {
            presenceData.largeImageKey = ActivityAssets.Cog
            presenceData.smallImageKey = ActivityAssets.Logo
            presenceData.smallImageText = 'Vtuber Wiki'
            presenceData.details = 'Viewing Software'
            presenceData.state = `${pageTitle}`
            presenceData.buttons = [{ label: `View ${pageTitle}`, url: href }]
          }
          else {
            presenceData.details = 'Viewing All The Software'
          }

          break
        case 'guides':
          if (pathSplit[2]) {
            presenceData.largeImageKey = ActivityAssets.Book
            presenceData.smallImageKey = ActivityAssets.Logo
            presenceData.details = 'Viewing Guides'
            presenceData.state = `${pageTitle}`
            presenceData.buttons = [{ label: 'View Guide', url: href }]
          }
          else {
            presenceData.details = 'Viewing All The Guides'
          }
          break
        case 'agencies':
          if (pathSplit[2]) {
            presenceData.largeImageKey = `https://vtubers.wiki/static/agencies/${pathSplit[2]}/logo.png`
            presenceData.smallImageKey = ActivityAssets.Logo
            presenceData.details = 'Viewing a Vtuber Agency'
            presenceData.state = `${document
              .querySelector('.vw-article-title')
              ?.textContent
              ?.replace('Agency •', '')
              .trim()}`
            presenceData.buttons = [{ label: 'View Agency', url: href }]
          }
          else {
            presenceData.details = 'Viewing All The Agencies'
          }
          break
        default:
          presenceData.details = 'Viewing The wiki'
          presenceData.state = pageTitle
          presenceData.buttons = [{ label: 'View Wiki', url: href }]
      }
      break
    case 'blog':
      if (pathSplit[1]) {
        presenceData.largeImageKey = ActivityAssets.Log
        presenceData.details = 'Viewing a Blog Post'
        presenceData.state = pageTitle
        presenceData.buttons = [{ label: 'View Blog Post', url: href }]
      }
      else {
        presenceData.largeImageKey = ActivityAssets.Log
        presenceData.details = 'Viewing The Blog'
        presenceData.buttons = [{ label: 'View Blog', url: href }]
      }
      break
    case 'sdk':
      if (pathSplit[1]) {
        presenceData.smallImageKey = document.querySelector<HTMLImageElement>('#sdk-img')?.src
        presenceData.smallImageText = document.querySelector<HTMLImageElement>('#sdk-img')?.alt
        presenceData.details = `Viewing the ${
          document.querySelector('.vw-article-title')?.textContent
        }`
        presenceData.state = `Made on ${
          document.querySelector('time')?.textContent
        }`
        presenceData.buttons = [
          { label: 'View SDK', url: href },
          {
            label: 'Source Code',
            url: document.querySelector<HTMLDivElement>('#sdk-github')
              ?.textContent ?? '',
          },
        ]
      }
      else {
        presenceData.largeImageKey = ActivityAssets.Cog
        presenceData.details = 'Viewing The SDK\'s'
        presenceData.buttons = [{ label: 'View SDK\'s', url: href }]
      }
      break
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
