const presence = new Presence({
  clientId: '1498333732174827611',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.discordapp.com/attachments/1520831922396463185/1520832971093835856/b07191c9a033296655b5409f1c10962c.jpg?ex=6a42a194&is=6a415014&hm=01fc9e07ace50796a0a64d1fbe67d2d65a3fde9366465991c7b165da3eca76f9&',
}

presence.on('UpdateData', async () => {
  const { hostname, pathname } = document.location

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    details: 'Böngészik',
    startTimestamp: browsingTimestamp,
  }

  // lumex.hu
  if (hostname.includes('lumex.hu')) {
    if (pathname === '/' || pathname === '') {
      presenceData.state = 'Főoldalt Nézi'
    }
    else if (pathname.includes('/partnereink')) {
      presenceData.state = 'Partnerek Oldalt Nézi'
    }
    else if (pathname.includes('/tamogatas')) {
      presenceData.state = 'Kapcsolat Oldalt Nézi'
    }
    else if (pathname.includes('/aszf')) {
      presenceData.state = 'Az Áltanlános Szerződési Feltételeket Nézi'
    }
    else if (pathname.includes('/privacypolicy')) {
      presenceData.state = 'Az Adatvédelemi Szabályzatot Nézi'
    }
    else if (pathname.includes('/404')) {
      presenceData.state = '404 Oldalt Nézi'
    }
  }

  // status.lumex.hu
  if (hostname.includes('status.lumex.hu')) {
    presenceData.state = 'Státusz Oldal Megtekintése'
  }

  if (presenceData.state)
    presence.setActivity(presenceData)
  else presence.clearActivity()
})
