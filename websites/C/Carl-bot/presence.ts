import { Assets } from 'premid'

const presence = new Presence({
  clientId: '653372675166568481',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/C/Carl-bot/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  if (document.location.hostname === 'carl.gg') {
    if (document.location.pathname.startsWith('/dashboard/')) {
      presenceData.details = 'Managing the settings of:'
      presenceData.state = document
        .querySelector(
          'body > div.app > header > ul.navbar-nav.ml-auto.d-none.d-sm-inline-block > div > div',
        )
        ?.textContent
        ?.split('Jump to')[0]
        ?.trim()
    }
    else if (document.location.pathname.startsWith('/servers')) {
      presenceData.details = 'Browsing through'
      presenceData.state = 'servers'
    }
    else if (document.location.pathname.startsWith('/status')) {
      presenceData.details = 'Viewing a page:'
      presenceData.state = 'Carl-bot Status'
    }
  }

  if (document.location.hostname === 'docs.carl.gg') {
    presenceData.smallImageKey = Assets.Reading
    presenceData.details = 'Documentation'

    presenceData.state = document.querySelector('h1')?.textContent
  }

  presence.setActivity(presenceData)
})
