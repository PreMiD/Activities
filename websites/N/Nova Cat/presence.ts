import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1286628372033830934',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.discordapp.com/avatars/1286628372033830934/0d15baabd2b461341345a896e3ba64ec.webp',
}

const langKeys = {
  details: {
    website: {
      en: 'Browsing',
      hu: 'Böngészik',
    },
  },
  state: {
    home: {
      en: 'Viewing Home Page',
      hu: 'Főoldalt Nézi',
    },
    status: {
      en: 'Viewing Status Page',
      hu: 'Státusz Oldalt Nézi',
    },
    statusV2: {
      en: 'Viewing Beta Status Page',
      hu: 'Béta Státusz Oldalt Nézi',
    },
  },
}

presence.on('UpdateData', async () => {
  const { hostname, pathname } = document.location

  const langSetting = await presence.getSetting<number>('lang')
  const lang = langSetting === 1 ? 'hu' : 'en'

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    smallImageKey: Assets.Play,
    startTimestamp: browsingTimestamp,
    details: langKeys.details.website[lang],
  }

  // Főoldal
  if (hostname === 'novacat.eu' || hostname === 'www.novacat.eu') {
    if (pathname === '/' || pathname.length <= 1) {
      presenceData.state = langKeys.state.home[lang]
    }
  }

  // Státusz oldal
  else if (hostname === 'status.novacat.eu') {
    presenceData.state = langKeys.state.status[lang]
  }


  if (presenceData.state)
    presence.setActivity(presenceData)
  else
    presence.clearActivity()
})
