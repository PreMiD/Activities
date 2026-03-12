const presence = new Presence({ clientId: '503557087041683458' })
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/L/League%20of%20Angels%20Pact/assets/logo.jpg',
    startTimestamp: browsingTimestamp,
    name: 'League of Angels Pact',
  }
  const path = location.pathname + location.search
  const showUID: boolean = await presence.getSetting<boolean>('uid')

  if (path.includes('/web/oz/login.php')) {
    const uid = new URL(document.location.href).searchParams.get('uid')

    if (uid && showUID)
      presenceData.details = `[API] UID: ${uid}`
    else presenceData.details = 'From API'
  }

  if (path.includes('/play/?game=719')) {
    const uid = document.querySelector('.server-uid .txt-light')

    if (uid && showUID)
      presenceData.details = `[R2] UID: ${uid.textContent}`
    else presenceData.details = 'From r2games.com'
  }

  if (
    path.includes('/games/loginGameServer.action?gameName=LeagueofAngels_GHG')
  ) {
    const uid = document.querySelector('.headerID span')

    if (uid && showUID)
      presenceData.details = `[GHG] UID: ${uid.textContent}`
    else presenceData.details = 'From gamehollywood.com'
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
