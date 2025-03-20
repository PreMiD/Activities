const presence = new Presence({
  clientId: '840759396103749633',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

async function getTranslation(name: string): Promise<string> {
  const language = (await presence.getSetting<0 | 1>('lang')) === 0 ? 'en' : 'de'

  switch (name) {
    case 'home':
      switch (language) {
        case 'de':
          return 'Durchsucht die Startseite'
        default:
          return 'Browsing home page'
      }
    case 'search':
      switch (language) {
        case 'de':
          return 'Sucht nach etwas'
        default:
          return 'Searching for something'
      }
    case 'faq':
      switch (language) {
        case 'de':
          return 'Durchsucht das FAQ'
        default:
          return 'Browsing FAQ page'
      }
    case 'activity':
      switch (language) {
        case 'de':
          return 'Schaut sich Aktivität an'
        default:
          return 'Viewing activity'
      }
    case 'user':
      switch (language) {
        case 'de':
          return 'Schaut sich Benutzer an'
        default:
          return 'Viewing user'
      }
    case 'settings':
      switch (language) {
        case 'de':
          return 'Durchsucht die Einstellungen'
        default:
          return 'Browsing settings page'
      }
    case 'viewUser':
      switch (language) {
        case 'de':
          return 'Benutzer anzeigen'
        default:
          return 'View user'
      }
    case 'viewActivity':
      switch (language) {
        case 'de':
          return 'Aktivität anzeigen'
        default:
          return 'View activity'
      }
  }
  return 'Unknown'
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/P/PresenceDB/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  switch (window.location.pathname) {
    case '/': {
      presenceData.details = await getTranslation('home')
      break
    }
    case '/search': {
      presenceData.details = await getTranslation('search')
      break
    }
    case '/faq': {
      presenceData.details = await getTranslation('faq')
      break
    }
    default:
      if (window.location.pathname.includes('/activity/')) {
        if (!document.querySelector('#activityName'))
          return
        presenceData.details = await getTranslation('activity')
        presenceData.state = document.querySelector('#activityName')?.textContent
        presenceData.buttons = [
          {
            label: await getTranslation('viewActivity'),
            url: window.location.href,
          },
        ]
      }
      else if (window.location.pathname.includes('/user/')) {
        if (!document.querySelector('#userName'))
          return
        presenceData.details = await getTranslation('user')
        presenceData.state = document.querySelector('#userName')?.textContent
        presenceData.buttons = [
          {
            label: await getTranslation('viewUser'),
            url: window.location.href,
          },
        ]
      }
      else if (window.location.pathname === '/settings') {
        presenceData.details = await getTranslation('settings')
      }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
