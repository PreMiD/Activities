const presence = new Presence({
  clientId: '928142086446923798',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/V/VGMdb/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const cover = await presence.getSetting<boolean>('cover')
  const shortTitle = document.title.match(/(.*) -/)?.[1]
  const { pathname } = document.location

  if (pathname.startsWith('/album')) {
    presenceData.details = document.querySelector<HTMLSpanElement>(
      '#innermain > h1 > span',
    )?.textContent
    presenceData.state = document.querySelector<HTMLDivElement>('#coverart')?.title
    if (cover) {
      if (
        document.querySelector<HTMLMetaElement>('meta[property=\'og:image\']')
      ) {
        presenceData.largeImageKey = document.querySelector<HTMLMetaElement>(
          'meta[property=\'og:image\']',
        )?.content
        presenceData.smallImageKey = ActivityAssets.Logo
      }
      else {
        presenceData.largeImageKey = ActivityAssets.Logo
      }
    }
    presenceData.buttons = [{ label: 'View Album', url: document.URL }]
  }
  else if (pathname.startsWith('/artist')) {
    presenceData.details = 'Viewing an artist:'
    presenceData.state = shortTitle
    if (cover) {
      if (document.querySelector<HTMLAnchorElement>('#leftfloat > div > a')) {
        presenceData.largeImageKey = document.querySelector<HTMLAnchorElement>(
          '#leftfloat > div > a',
        )?.href
        presenceData.smallImageKey = ActivityAssets.Logo
      }
      else if (
        document.querySelector<HTMLAnchorElement>('#innermain > div > a')
      ) {
        presenceData.largeImageKey = document.querySelector<HTMLAnchorElement>(
          '#innermain > div > a',
        )?.href
        presenceData.smallImageKey = ActivityAssets.Logo
      }
      else {
        presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/V/VGMdb/assets/logo.png'
      }
    }
    presenceData.buttons = [{ label: 'View Artist', url: document.URL }]
  }
  else if (pathname.startsWith('/org') || pathname.startsWith('/product')) {
    if (pathname.startsWith('/org')) {
      presenceData.details = 'Viewing a label/organization:'
      presenceData.buttons = [{ label: 'View Label/Org', url: document.URL }]
    }
    else if (pathname.startsWith('/product')) {
      presenceData.details = 'Viewing a product:'
      presenceData.buttons = [{ label: 'View Product', url: document.URL }]
    }
    presenceData.state = shortTitle
    if (cover) {
      if (document.querySelector<HTMLAnchorElement>('#innermain > div > a')) {
        presenceData.largeImageKey = document.querySelector<HTMLAnchorElement>(
          '#innermain > div > a',
        )?.href
        presenceData.smallImageKey = ActivityAssets.Logo
      }
      else {
        presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/V/VGMdb/assets/logo.png'
      }
    }
  }
  else if (pathname.startsWith('/event')) {
    presenceData.details = 'Viewing an event:'
    presenceData.state = shortTitle
  }
  else if (pathname.startsWith('/db')) {
    presenceData.details = 'Searching the database'
    if (pathname.includes('albums'))
      presenceData.state = 'Browsing albums'
    else if (pathname.includes('artists'))
      presenceData.state = 'Browsing artists'
    else if (pathname.includes('org'))
      presenceData.state = 'Browsing labels & organizations'
    else if (pathname.includes('product'))
      presenceData.state = 'Browsing products'
    else if (pathname.includes('marketplace'))
      presenceData.state = 'Browsing the marketplace'
  }
  else if (pathname.startsWith('/search')) {
    presenceData.details = 'Searching...'
  }
  else if (
    pathname.startsWith('/forums')
    && (pathname.includes('forumdisplay') || pathname.includes('showthread'))
  ) {
    if (pathname.includes('forumdisplay'))
      presenceData.details = 'Viewing a forum:'
    else if (pathname.includes('showthread'))
      presenceData.details = 'Viewing a thread:'
    else presenceData.details = 'Browsing the forum'
    presenceData.state = shortTitle
  }
  presence.setActivity(presenceData)
})
