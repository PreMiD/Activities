import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1286628372033830934',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.discordapp.com/attachments/1520831922396463185/1520832969139294248/0d15baabd2b461341345a896e3ba64ec.jpg?ex=6a42a193&is=6a415013&hm=2b861b7cc824a9cd7f0499ade399c7cbc9dbe257799f43646f9c9dfe7d3ba3be&',
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
