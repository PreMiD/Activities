const presence = new Presence({
  clientId: '1341778656762134538',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://litomore.me/images/doubanread-512.png',
}

function getTitle() {
  return document.title.replace(/ \| 豆瓣阅读$/, '')
}

presence.on('UpdateData', async () => {
  const { href, pathname } = document.location
  const args = pathname.split('/')
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  presenceData.details = 'Exploring Douban Read'

  /**
   * Public Entries
   */
  if (pathname === '/') {
    presenceData.details = 'Viewing Home Page'
  }
  else if (pathname.startsWith('/charts')) {
    presenceData.details = 'Viewing Ranking Charts'
    presenceData.state = getTitle()
  }
  else if (pathname.startsWith('/competitions')) {
    presenceData.details = 'Browsing Competitions'
    presenceData.state = getTitle()
  }
  else if (pathname.startsWith('/columns') && args[2]) {
    presenceData.details = 'Browsing Column'
    presenceData.state = getTitle()
  }
  else if (pathname.startsWith('/reader/column') && args[3]) {
    presenceData.details = 'Reading Column'
    presenceData.state = getTitle()
    presenceData.buttons = [{ label: 'Read Column', url: href }]
  }
  else if (pathname.startsWith('/ebook') && args[2]) {
    presenceData.details = 'Browsing Ebook'
    presenceData.state = getTitle()
  }
  else if (pathname.startsWith('/reader/ebook') && args[3]) {
    presenceData.details = 'Reading Ebook'
    presenceData.state = getTitle()
    presenceData.buttons = [{ label: 'Read Ebook', url: href }]
  }
  else if (pathname.startsWith('/essay') && args[2]) {
    presenceData.details = 'Browsing Essay'
    presenceData.state = getTitle()
  }
  else if (pathname.startsWith('/reader/essay') && args[3]) {
    presenceData.details = 'Reading Essay'
    presenceData.state = getTitle()
    presenceData.buttons = [{ label: 'Read Essay', url: href }]
  }
  else if (pathname.startsWith('/people') && args[2]) {
    presenceData.details = 'Viewing User Profile'
    presenceData.state = getTitle()
  }
  else if (pathname.startsWith('/author') && args[2]) {
    presenceData.details = 'Viewing Author Profile'
    presenceData.state = getTitle()
  }

  /**
   * Private Entries
   */
  else if (pathname.startsWith('/submit/agent')) {
    presenceData.details = 'Viewing Author Center'
  }

  presence.setActivity(presenceData)
})
