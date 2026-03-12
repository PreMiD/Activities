const presence = new Presence({
  clientId: '965294297048023050',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Smallimagekey = 'https://cdn.rcd.gg/PreMiD/websites/F/Free%20Web%20Novel/assets/0.png',
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/F/Free%20Web%20Novel/assets/logo.png',
  Browsing = 'https://cdn.rcd.gg/PreMiD/websites/F/Free%20Web%20Novel/assets/1.png',
  Closed = 'https://cdn.rcd.gg/PreMiD/websites/F/Free%20Web%20Novel/assets/2.png',
  Open = 'https://cdn.rcd.gg/PreMiD/websites/F/Free%20Web%20Novel/assets/3.png',
  Incognito = 'https://cdn.rcd.gg/PreMiD/websites/F/Free%20Web%20Novel/assets/4.png',
  Nocover = 'https://cdn.rcd.gg/PreMiD/websites/F/Free%20Web%20Novel/assets/5.png',
}

presence.on('UpdateData', async () => {
  let [showCover, showButtons, showBook, showLogo] = await Promise.all([
    presence.getSetting<boolean>('showCover'),
    presence.getSetting<boolean>('showButtons'),
    presence.getSetting<boolean>('showBook'),
    presence.getSetting<boolean>('logoOnly'),
  ])
  const [privacy, showTimestamp, showReading] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('showTimestamp'),
    presence.getSetting<boolean>('showReading'),
  ])
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { pathname } = window.location
  const pathnames = [
    '/',
    '/history/',
    '/latest-release-novel/',
    '/latest-novel/',
    '/completed-novel/',
    '/most-popular-novel/',
    '/search/',
    '/contact.html',
    '/sitemap.xml',
    '/privacy-terms-of-use.html',
    '/genre/',
    '/author/',
  ]
  if (!showReading) {
    showBook = false
    showCover = false
    showLogo = true
    showButtons = false
  }
  else {
    presenceData.smallImageKey = ActivityAssets.Closed
    presenceData.smallImageText = 'Not Reading'
  }
  if (!showBook)
    showCover = false
  switch (true) {
    case pathname === '/': {
      presenceData.details = 'Browsing the homepage'
      break
    }
    case pathname.includes('/history/'): {
      presenceData.details = 'Browsing recently viewed novels'
      break
    }
    case pathname.includes('/latest-release-novel/'): {
      presenceData.details = 'Browsing latest released novels'
      break
    }
    case pathname.includes('/latest-novel/'): {
      presenceData.details = 'Browsing the latest novels'
      break
    }
    case pathname.includes('/completed-novel/'): {
      presenceData.details = 'Browsing fully finished novels'
      break
    }
    case pathname.includes('/most-popular-novel/'): {
      presenceData.details = 'Browsing the most popular novels'
      break
    }
    case pathname.includes('/genre/'): {
      presenceData.details = `Checking out ${document
        .querySelector<HTMLHeadingElement>('[class="tit"]')
        ?.textContent
        ?.toLowerCase()}`
      break
    }
    case pathname.includes('/author/'): {
      presenceData.details = 'Checking out an author'
      presenceData.state = document.querySelector<HTMLAnchorElement>(
        'body > div.header > div.cur > div > a:nth-child(5)',
      )?.title
      presenceData.buttons = [
        {
          label: 'View Author',
          url: location.href,
        },
      ]
      break
    }
    case pathname === '/search/': {
      presenceData.details = 'Searching for a novel'
      presenceData.state = `"${
        document.querySelector('body > div.main > div.wp > div.m-t1 > em.e2')
          ?.textContent
      }"`
      break
    }
    case pathname === '/contact.html': {
      presenceData.details = 'Viewing the contact page'
      break
    }
    case pathname === '/privacy-terms-of-use.html': {
      presenceData.details = 'Reading the terms of use'
      break
    }
    case privacy: {
      presenceData.largeImageKey = ActivityAssets.Incognito
      if (!showReading)
        break
      if (
        pathnames.includes(pathname)
        || document.querySelector<HTMLDivElement>('[class="m-imgtxt"]')
      ) {
        presenceData.details = 'Browsing...'
      }
      else if (
        document.querySelector<HTMLAnchorElement>('[title="Read Next chapter"]')
      ) {
        presenceData.details = 'Reading...'
        presenceData.smallImageKey = ActivityAssets.Open
      }
      break
    }
    case showLogo: {
      presenceData.largeImageKey = ActivityAssets.Logo
      delete presenceData.smallImageKey
      delete presenceData.details
      delete presenceData.state
      delete presenceData.buttons
      break
    }
    default: {
      if (document.querySelector<HTMLDivElement>('[class="m-imgtxt"]')) {
        if (showCover) {
          presenceData.largeImageKey = `${
            document.querySelector<HTMLImageElement>(
              'body > div.main > div > div > div.col-content > div.m-info > div.m-book1 > div.m-imgtxt > div.pic > img',
            )?.src
          }`
        }
        else {
          presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/F/Free%20Web%20Novel/assets/logo.png'
        }
        if (showReading)
          presenceData.details = 'Viewing a novel'
        if (showBook)
          presenceData.state = document.title.split('-')[0]
        presenceData.buttons = [
          {
            label: 'View Novel',
            url: location.href,
          },
        ]
      }
      else if (
        document.querySelector<HTMLAnchorElement>('[title="Read Next chapter"]')
      ) {
        if (showCover) {
          presenceData.largeImageKey = document.querySelector<HTMLMetaElement>(
            'head > meta:nth-child(4)',
          )?.content
        }
        else {
          presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/F/Free%20Web%20Novel/assets/logo.png'
        }
        if (showBook) {
          presenceData.details = `Reading ${document.title.split('-')[0]}`
          presenceData.state = document.querySelector<HTMLSpanElement>(
            '[class="chapter"]',
          )?.textContent
        }
        else {
          presenceData.details = 'Reading a novel'
          delete presenceData.state
        }
        if (showReading) {
          presenceData.smallImageKey = ActivityAssets.Open
          presenceData.smallImageText = 'Reading'
        }
        else {
          delete presenceData.smallImageKey
          delete presenceData.smallImageText
        }
        presenceData.buttons = [
          {
            label: 'Read Novel',
            url: location.href,
          },
        ]
      }
    }
  }
  if (!showButtons)
    delete presenceData.buttons
  if (!showTimestamp)
    delete presenceData.startTimestamp
  presence.setActivity(presenceData)
})
