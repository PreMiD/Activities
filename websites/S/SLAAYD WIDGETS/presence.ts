const presence = new Presence({
  clientId: '1522265954686337255',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/S/SLAAYD%20WIDGETS/assets/logo.png',
}

const siteUrl = 'https://slaayd.xyz/'

function getPageName(): string {
  const heading = document.querySelector('h1')?.textContent?.trim()
  if (heading)
    return heading

  const title = document.title.split(/[|\-–—]/)[0]?.trim()
  return title || 'SLAAYD WIDGETS'
}

presence.on('UpdateData', async () => {
  const { pathname, href } = document.location
  const path = pathname.replace(/\/+$/, '') || '/'
  const pageName = getPageName()

  const data: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    largeImageUrl: siteUrl,
    startTimestamp: browsingTimestamp,
  }

  if (path === '/') {
    // Homepage: no buttons allowed
    data.details = 'Viewing the homepage'
    data.state = 'SLAAYD WIDGETS'
    data.detailsUrl = siteUrl
  }
  else if (path.startsWith('/widgets')) {
    data.details = 'Browsing widgets'
    data.state = pageName
  }
  else if (path.startsWith('/pricing')) {
    data.details = 'Checking out pricing'
    data.state = pageName
  }
  else if (path.startsWith('/dashboard')) {
    data.details = 'Customizing widgets'
    data.state = pageName
  }
  else if (path.startsWith('/blog')) {
    data.details = 'Reading the blog'
    data.state = pageName
  }
  else {
    data.details = 'Browsing SLAAYD WIDGETS'
    data.state = pageName
  }

  // Buttons only on non-homepage pages
  if (path !== '/') {
    data.detailsUrl = href
    data.buttons = [
      {
        label: 'View Page',
        url: href,
      },
    ]
  }

  presence.setActivity(data)
})
