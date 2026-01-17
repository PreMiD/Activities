const presence = new Presence({
  clientId: '1449144774949867661',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const t = await presence.getStrings({
    watching: 'zapping.watching',
    inZapping: 'zapping.inZapping',
    browsing: 'general.browsing',
    home: 'general.viewHome',
    login: 'zapping.login',
    register: 'zapping.register',
    recovery: 'zapping.recovery',
    dashboard: 'zapping.dashboard',
    addons: 'zapping.dddons',
    account: 'zapping.account',
    devices: 'zapping.devices',
    channels: 'zapping.channels',
    browsingZapping: 'zapping.browsingZapping',
  })

  // CORREGIDO: Usamos el tipo anidado para resolver los errores de PMD y ESLint de importación de tipos.
  const presenceData: PresenceData = {
    largeImageKey:
      'https://cdn.rcd.gg/PreMiD/websites/Z/Zapping.com/assets/logo.png',
  }

  const { pathname } = document.location

  // Título tipo "Zapping | Canal"
  const title = document.querySelector('title')?.textContent?.trim() ?? ''
  const canal = title.includes('|')
    ? title.split('|')[1]?.trim() ?? null
    : null

  // ------------------------------
  //          WEBPLAYER
  // ------------------------------
  if (pathname.includes('/webplayer')) {
    if (canal) {
      presenceData.details = t.watching
      presenceData.state = canal
      presenceData.startTimestamp = browsingTimestamp
    }
    else { // CORREGIDO: Estilo de llaves
      presenceData.details = t.inZapping
      presenceData.state = t.browsing
    }

    presence.setActivity(presenceData)
    return
  }

  // ------------------------------
  //          OTRAS PÁGINAS
  // ------------------------------
  switch (true) {
    case pathname === '/':
      presenceData.details = t.home
      break

    case pathname.includes('login'):
      presenceData.details = t.login
      break

    case pathname.includes('register'):
      presenceData.details = t.register
      break

    case pathname.includes('recovery-password'):
      presenceData.details = t.recovery
      break

    case pathname.includes('dashboard/addons'):
      presenceData.details = t.addons
      break

    case pathname.includes('dashboard/my-account'):
      presenceData.details = t.account
      break

    case pathname.includes('dashboard/devices'):
      presenceData.details = t.devices
      break

    case pathname.includes('dashboard/channels'):
      presenceData.details = t.channels
      break

    case pathname.includes('dashboard'):
      presenceData.details = t.dashboard
      break

    default:
      presenceData.details = t.browsingZapping
      break
  }

  presence.setActivity(presenceData)
})
