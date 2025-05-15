import { Assets } from 'premid'

const presence = new Presence({
  clientId: '503557087041683458',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.discordapp.com/icons/528327242875535372/a_ff168617165e959a877a5b5f01ccb423.gif?size=512&hack=.gif',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    name: 'RoyaleAPI',
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const strings = await presence.getStrings({
    viewHome: 'general.viewHome',
    viewProfile: 'general.viewProfile',
    buttonViewProfile: 'general.buttonViewProfile',
    buttonViewPlayer: 'royaleapi.buttonViewPlayer',
  })
  const { pathname, href } = document.location
  const pathList = pathname.split('/').filter(Boolean)

  switch (pathList[0] ?? '/') {
    case '/': {
      presenceData.details = strings.viewHome
      break
    }
    case 'player': {
      presenceData.details = strings.viewProfile
      presenceData.state = document.querySelector('h1')
      presenceData.buttons = [
        {
          label: strings.buttonViewProfile,
          url: href,
        },
        {
          label: strings.buttonViewPlayer,
          url: `clashroyale://playerInfo?id=${pathList[1]}`,
        },
      ]
      break
    }
  }

  presence.setActivity(presenceData)
})
