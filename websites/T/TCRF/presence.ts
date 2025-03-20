const presence = new Presence({
  clientId: '631259475038175232',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

let x: string

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/T/TCRF/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  if (document.location.pathname === '/The_Cutting_Room_Floor') {
    presenceData.details = 'browsing TCRF'
    presenceData.state = 'at Homepage'
  }
  else if (
    ['/Help:Contents', '/Category:To_do', '/Special:RecentChanges'].includes(
      document.location.pathname,
    )
  ) {
    const [d, d1] = document.location.pathname.replace('/', '').split(':')
    presenceData.details = `browsing ${d}`
    presenceData.state = `at ${d1}`
  }
  else if (document.location.pathname.startsWith('/Help:Contents/')) {
    const help = document.location.pathname.split('/')
    const d = help[1]!.split(':')
    presenceData.details = `getting ${d[0]}`
    presenceData.state = `${d[1]}: ${help[2]
      ?.replace(/%26/g, '&')
      .split('_')
      .join(' ')}`
  }
  else {
    const name = document
      .querySelector('#firstHeading')
      ?.textContent
      ?.replace(')', '')
      .split('(')
    if (name?.[0]?.startsWith('Prerelease:')) {
      const d = name[0]?.split(':')
      x = `Game: ${d[1]}(${d[0]})`
    }
    else {
      x = `Game: ${name?.[0]}`
    }

    let stated
    if (!name?.[1])
      stated = 'Platform: Multiple'
    else stated = `Platform: ${name[1]} `

    // var year = document.getElementsByClassName("mw-headline")[1].textContent
    presenceData.details = x
    presenceData.state = stated
  }
})
