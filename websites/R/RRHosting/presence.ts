import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1164842027951849492',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.discordapp.com/avatars/1248748513769296034/79d084ccc1ea926d2aacb6b5fe300e96.webp',
}

/* -----------------------------------------
   LANGUAGE KEYS (en + de + hu)
----------------------------------------- */
const LANG = {
  en: {
    site: 'Browsing Website',
    home: 'Viewing Home Page',
    about: 'Reading About',
    team: 'Viewing Our Team',
    privacypolicy: 'Reading Privacy Policy',
    termsofservice: 'Reading Terms Of Service',
    acceptableuse: 'Reading Acceptable Use',
    panel: 'Viewing Panel (Managing Servers)',
    status: 'Viewing Status Page',
  },

  de: {
    site: 'Website Durchstöbern',
    home: 'Startseite Ansehen',
    about: 'Lesestoff Zu',
    team: 'Unser Team Ansehen',
    privacypolicy: 'Datenschutzerklärung Lesen',
    termsofservice: 'Nutzungsbedingungen Lesen',
    acceptableuse: 'Nutzungsbedingungen Lesen',
    panel: 'Panel Ansehen (Serververwaltung)',
    status: 'Statusseite Ansehen',
  },

  hu: {
    site: 'Weboldalt Böngészik',
    home: 'Főoldalt Nézi',
    about: 'Rólunk Olvas',
    team: 'A Csapatunkat Nézi',
    privacypolicy: 'Az Adatvédelmi Szabályzatot Olvassa',
    termsofservice: 'A Szerződési Feltételeket Olvassa',
    acceptableuse: 'A Használati Feltételeket Olvassa',
    panel: 'Panelt Nézi (Szerverek Kezelése)',
    status: 'Státusz Oldalt Nézi',
  },
} as const

type LangCode = keyof typeof LANG
let currentLang: LangCode = 'hu'

async function loadLanguage() {
  const langSetting = await presence.getSetting<number>('lang')

  if (langSetting === 0) {
    currentLang = 'en'
  }
  else if (langSetting === 1) {
    currentLang = 'hu'
  }
  else if (langSetting === 2) {
    currentLang = 'de'
  }
  else {
    currentLang = 'en'
  }
}

presence.on('UpdateData', async () => {
  await loadLanguage()

  const { hostname, pathname } = document.location

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    smallImageKey: Assets.Play,
    details: LANG[currentLang].site,
    startTimestamp: browsingTimestamp,
  }

  // rrhosting.eu
  if (hostname.includes('rrhosting.eu')) {
    if (pathname === '/' || pathname === '') {
      presenceData.state = LANG[currentLang].home
    }
    else if (pathname.includes('status')) {
      presenceData.state = LANG[currentLang].status
    }
    else if (pathname.includes('about')) {
      presenceData.state = LANG[currentLang].about
    }
    else if (pathname.includes('team')) {
      presenceData.state = LANG[currentLang].team
    }
    else if (pathname.includes('pp')) {
      presenceData.state = LANG[currentLang].privacypolicy
    }
    else if (pathname.includes('tos')) {
      presenceData.state = LANG[currentLang].termsofservice
    }
    else if (pathname.includes('aup')) {
      presenceData.state = LANG[currentLang].acceptableuse
    }
  }

  // panel.rrhosting.eu
  else if (hostname.includes('panel.rrhosting.eu')) {
    presenceData.state = LANG[currentLang].panel
  }

  if (presenceData.state)
    presence.setActivity(presenceData)
  else
    presence.clearActivity()
})
