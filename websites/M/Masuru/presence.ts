const presence = new Presence({
  clientId: '1138055195008454656',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets { // Other default assets can be found at index.d.ts
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/M/Masuru/assets/logo.webp',
  Bot = 'https://cdn.rcd.gg/PreMiD/websites/M/Masuru/assets/0.webp',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    startTimestamp: browsingTimestamp,
  }
  const { pathname, hostname } = document.location
  switch (hostname.replace('www.', '')) {
    case 'masuru.in.th': {
      const title = document.querySelector('title')?.textContent
      if (title) {
        presenceData.largeImageKey = ActivityAssets.Logo
        presenceData.details = title
        if (pathname.replace('/th', '').replace('/en', '').startsWith('/s/')) {
          presenceData.state = document.querySelector(
            'meta[name="description"]',
          )
        }
        presence.setActivity(presenceData)
      }
      break
    }
    case 'bot.masuru.in.th': {
      const title = document.querySelector('title')?.textContent
      if (title) {
        presenceData.details = title
        presenceData.largeImageKey = ActivityAssets.Bot
        const pathname_ = pathname.replace('/th', '').replace('/en', '')
        switch (pathname_) {
          case '/':
            presenceData.details = `Home - ${title}`
            break
          case '/status':
            presenceData.details = `Status - ${title}`
            break
          default:
            if (pathname_.startsWith('/dashboard')) {
              presenceData.details = `Dashboard - ${title}`
              presenceData.state = pathname_.split('/').reverse()[0]
              if (presenceData.state === 'discovery') {
                presenceData.buttons = [
                  {
                    label: 'View Discovery',
                    url: 'https://masuru.in.th/discovery',
                  },
                ]
              }
            }
        }
        presence.setActivity(presenceData)
      }
      break
    }
    case 'cloud.masuru.in.th': {
      const title = document.querySelector('title')?.textContent
      if (title) {
        presenceData.details = title
        presenceData.largeImageKey = ActivityAssets.Logo
        presence.setActivity(presenceData)
      }
      break
    }
  }
})
