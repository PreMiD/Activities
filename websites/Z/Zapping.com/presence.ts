import * as Premid from 'premid' // Usamos wildcard para forzar el acceso a los miembros

const presence = new Premid.Presence({ // Usamos Premid.Presence
  clientId: '1449144774949867661',
} )

const browsingTimestamp = Math.floor(Date.now() / 1000)

// ------------------------------
//        DICCIONARIO
// ------------------------------
const strings = {
  es: {
    watching: 'Viendo Zapping',
    inZapping: 'En Zapping',
    browsing: 'Navegando',
    home: 'En la página principal',
    login: 'Iniciando sesión',
    register: 'Creando una cuenta',
    recovery: 'Recuperando contraseña',
    dashboard: 'Panel de control',
    addons: 'Addons',
    account: 'Mi cuenta',
    devices: 'Dispositivos',
    channels: 'Canales',
    browsingZapping: 'Navegando por Zapping',
  },
  en: {
    watching: 'Watching Zapping',
    inZapping: 'In Zapping',
    browsing: 'Browsing',
    home: 'Home',
    login: 'Logging in',
    register: 'Creating an account',
    recovery: 'Recovering password',
    dashboard: 'Dashboard',
    addons: 'Add-ons',
    account: 'My account',
    devices: 'Devices',
    channels: 'Channels',
    browsingZapping: 'Browsing Zapping',
  },
  pt: {
    watching: 'Assistindo Zapping',
    inZapping: 'No Zapping',
    browsing: 'Navegando',
    home: 'Página inicial',
    login: 'Entrando',
    register: 'Criando conta',
    recovery: 'Recuperar senha',
    dashboard: 'Painel',
    addons: 'Add-ons',
    account: 'Minha conta',
    devices: 'Dispositivos',
    channels: 'Canais',
    browsingZapping: 'Navegando no Zapping',
  },
}

// Selección del idioma
const lang
  = navigator.language.startsWith('pt')
    ? 'pt'
    : navigator.language.startsWith('en')
      ? 'en'
      : 'es'

presence.on('UpdateData', async () => {
  const t = strings[lang]

  const presenceData: Premid.PresenceData = { // Usamos Premid.PresenceData
    largeImageKey:
      'https://us-east-1.tixte.net/uploads/memilio-cdn.tixte.co/zapping.png',
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
    else { // Corregido: Estilo de llaves
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
