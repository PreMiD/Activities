const presence = new Presence({
  clientId: '1341778656762134538',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/B/Bun/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const { href, pathname } = document.location
  const args = pathname.split('/')
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  presenceData.details = 'Exploring Bun'

  if (pathname === '/') {
    presenceData.details = 'Viewing Home Page'
  }
  else if (pathname.startsWith('/docs')) {
    presenceData.details = 'Reading Bun Docs'
    presenceData.state = document.title.replace(/ \| Bun Docs$/, '')
    presenceData.buttons = [{ label: 'View Documentation', url: href }]
  }
  else if (pathname.startsWith('/guides')) {
    presenceData.details = 'Reading Bun Guides'
    presenceData.state = document.title
    presenceData.buttons = [{ label: 'View Guide', url: href }]
  }
  else if (pathname.startsWith('/blog')) {
    presenceData.details = 'Browsing Bun Blog'
    if (args[2]) {
      presenceData.details = 'Reading Bun Blog'
      presenceData.state = document.title
      presenceData.buttons = [{ label: 'View Blog Post', url: href }]
    }
  }

  presence.setActivity(presenceData)
})
