const presence = new Presence({
  clientId: '866604211248824371',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
const staticPages: Record<string, PresenceData> = {
  home: { details: 'Browsing Homepage' },
  list: { details: 'Viewing Followed List' },
  ranking: { details: 'Looking at rankings' },
  commentlist: { details: 'Looking at comment list' },
  settings: { details: 'Settings' },
  languages: { details: 'Languages' },
  privacy: { details: 'Privacy Policy' },
  installapp: { details: 'ComicK App' },
}
enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/C/ComicK/assets/logo.png',
}

presence.on('UpdateData', async () => {
  let presenceData: PresenceData = {
    details: 'Browsing',
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href } = document.location
  const arrPath = pathname.replace('_', '').split('/')
  const [image, buttons] = await Promise.all([
    presence.getSetting<boolean>('image'),
    presence.getSetting<boolean>('buttons'),
  ])

  switch (arrPath[1]) {
    case 'comic': {
      const title = document.querySelector<HTMLHeadingElement>('h1')
      if (title) {
        presenceData.details = 'Reading Description'
        presenceData.state = title.textContent
        presenceData.largeImageKey = document.querySelector<HTMLMetaElement>(
          'meta[property=\'og:image\']',
        )?.content
        presenceData.buttons = [
          {
            label: 'Read Description',
            url: href,
          },
        ]
      }
      else if (document.querySelector('.reader-container')) {
        const img = document.querySelectorAll<HTMLImageElement>(
          '.reader-container img',
        )[1]
        presenceData.details = `Reading ${img?.alt.substring(
          0,
          img.alt.indexOf('chapter'),
        )}`
        presenceData.state = img?.alt.substring(
          img.alt.indexOf('chapter'),
          img.alt.indexOf(','),
        )
        presenceData.largeImageKey = document.querySelector<HTMLMetaElement>(
          'meta[property=\'og:image\']',
        )?.content
        presenceData.buttons = [
          {
            label: 'Read Chapter',
            url: href,
          },
          {
            label: 'Read Description',
            url: href.split(/(.+)[\\/]/)[1]!,
          },
        ]
      }
      break
    }
    case 'group':
      presenceData.details = 'Looking at group'
      presenceData.state = document.querySelector<HTMLHeadingElement>('h1')?.textContent
      break
    case 'search': {
      presenceData.details = 'Searching'
      const research = document.querySelector('div > h1')?.textContent
      if (research)
        presenceData.state = research
      break
    }
    case 'user':
      presenceData.details = 'Viewing their profile'
      if (arrPath.length > 2) {
        presenceData.details = 'Viewing'
        presenceData.state = document.querySelector<HTMLHeadingElement>('h1')?.textContent
        presenceData.largeImageKey = document
          .querySelector<HTMLImageElement>('#__next div > div > img')
          ?.src
          .replace('size=200', 'size=640')
      }
      break
    default:
      if (Object.keys(staticPages).includes(arrPath[1]!))
        presenceData = { ...presenceData, ...staticPages[arrPath[1]!] }
  }

  if (!image && presenceData.largeImageKey !== ActivityAssets.Logo)
    presenceData.largeImageKey = ActivityAssets.Logo
  if (!buttons && presenceData.buttons)
    delete presenceData.buttons
  presence.setActivity(presenceData)
})
