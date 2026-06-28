import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1375761784060772432', // Mr. Monkey ID
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.postimg.cc/wvR8Sw7F/9979fc9e1916697c0105b7385e76adb2-(Egyeni).jpg',
}

presence.on('UpdateData', async () => {
  const { hostname, pathname } = document.location

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    smallImageKey: Assets.Play,
    details: 'Böngészik',
  }

  // mrmonkey.netlify.app
  if (hostname.includes('mrmonkey.netlify.app')) {
    // Itt fogod megadni a pathname-eket
    if (pathname === '/' || pathname === '') {
      presenceData.state = 'Főoldalt Nézi'
    }
    else if (pathname.includes('privacy')) {
      presenceData.state = 'Az Adatvédelemi Szabályzatot Olvassa.'
    }
    else if (pathname.includes('terms')) {
      presenceData.state = 'A Szerzőfési Feltételeket Olvassa.'
    }
  }

  // digifan.betteruptime.com
  else if (hostname.includes('digifan.betteruptime.com')) {
    presenceData.state = 'Státusz Oldalt Nézi'
  }

  // mrmonkey.upbot.app
  else if (hostname.includes('mrmonkey.upbot.app')) {
    presenceData.state = 'Bot Státuszát Nézi'
  }

  if (presenceData.state)
    presence.setActivity(presenceData)
  else
    presence.clearActivity()
})
