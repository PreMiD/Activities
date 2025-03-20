const presence = new Presence({
  clientId: '1167164781426380931',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/%23/%E3%83%83%E3%83%84%20Ebook%20Reader/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    details: 'Browsing',
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { pathname } = document.location
  switch (pathname.replace('_', '').split('/')[1]) {
    case 'manage': {
      presenceData.details = 'Managing library'
      break
    }
    case 'settings': {
      presenceData.details = 'Setting things up'
      break
    }
    case 'b': {
      const titleElement = document.querySelector<HTMLTitleElement>('head title')
      const progressElement = document.querySelector<HTMLDivElement>(
        '.writing-horizontal-tb.fixed.bottom-2.right-2',
      )

      let title = ' a book'
      let progress = ''

      if (titleElement)
        title = titleElement.text.split('|')[0]!
      if (progressElement)
        progress = progressElement.textContent!

      presenceData.details = `Reading ${title}`
      presenceData.state = progress
    }
  }

  presence.setActivity(presenceData)
})
