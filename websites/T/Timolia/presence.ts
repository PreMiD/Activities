const presence = new Presence({
  clientId: '872421983554502717',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/T/Timolia/assets/logo.png',
  Minecraft = 'https://cdn.rcd.gg/PreMiD/websites/T/Timolia/assets/0.png',
  Gitlab = 'https://cdn.rcd.gg/PreMiD/websites/T/Timolia/assets/1.png',
}

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  switch (document.location.hostname) {
    case 'www.timolia.de': {
      if (document.location.pathname === '/') {
        presenceData.details = 'Viewing home page'
        presenceData.smallImageKey = ActivityAssets.Minecraft
        presenceData.smallImageText = `${
          document.querySelector('#liveplayercount')?.textContent
        } online players`
      }
      else if (document.location.pathname.startsWith('/stats')) {
        presenceData.details = 'Viewing stats from:'
        presenceData.state = document.querySelector('#playername')?.textContent
      }
      else if (document.location.pathname.includes('/games')) {
        presenceData.details = 'Viewing gamemodes'
      }
      else if (document.location.pathname.includes('/account')) {
        presenceData.details = 'Viewing account settings'
      }

      break
    }
    case 'howto.timolia.de': {
      presenceData.details = 'HowTo - Reading:'
      presenceData.state = document.querySelector(
        'body > div.md-container > main > div > div.md-content > article > h1',
      )?.textContent

      break
    }
    case 'shop.timolia.de': {
      presenceData.details = 'Shop - Viewing store page'
      if (document.location.pathname.startsWith('/checkout')) {
        presenceData.details = 'Shop - Viewing shopping cart:'
        presenceData.state = document.querySelector(
          'body > div.sections-wrapper > section > div > div > div.jumbotron > div > div.packages > form > table > tbody > tr > td.col-md-6',
        )?.textContent
      }

      break
    }
    case 'forum.timolia.de': {
      presenceData.details = 'Viewing forum start page'
      if (document.location.pathname.startsWith('/members')) {
        presenceData.details = 'Viewing forum profile of:'
        presenceData.state = document.querySelector(
          '#content > div.pageWidth > div > div > div.mainProfileColumn > div > div > h1 > span',
        )?.textContent
      }
      else if (document.location.pathname.startsWith('/threads')) {
        presenceData.details = 'Viewing thread:'
        presenceData.state = document.querySelector(
          '#content > div.pageWidth > div > div.titleBar > h1',
        )?.textContent
      }
      else if (document.location.pathname.startsWith('/forums')) {
        presenceData.details = 'Viewing forum:'
        presenceData.state = document.querySelector(
          '#content > div.pageWidth > div > div.titleBar > h1',
        )?.textContent
      }

      break
    }
    default:
      if (document.location.hostname.includes('wi.timolia.de')) {
        presenceData.details = 'Viewing Webinterface'
      }
      else if (document.location.hostname.includes('gitlab.timolia.de')) {
        presenceData.details = 'Viewing GitLab Server'
        presenceData.smallImageKey = ActivityAssets.Gitlab
      }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
