import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1553849998771228793',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/C/CAF/assets/logo.png',
}

async function getStrings() {
  return presence.getStrings({
    browsing: 'general.browsing',
    buttonReadArticle: 'general.buttonReadArticle',
    buttonViewPage: 'general.buttonViewPage',
    readingArticle: 'general.readingArticle',
    search: 'general.search',
    searchFor: 'general.searchFor',
    viewAccount: 'general.viewAccount',
    viewHome: 'general.viewHome',
    viewPage: 'general.viewPage',
    loggingIn: 'caf.loggingIn',
    dashboard: 'caf.dashboard',
    payments: 'caf.payments',
    certificates: 'caf.certificates',
    procedures: 'caf.procedures',
    mail: 'caf.mail',
    resources: 'caf.resources',
    profile: 'caf.profile',
    benefitRequest: 'caf.benefitRequest',
    appointments: 'caf.appointments',
    contact: 'caf.contact',
  })
}

type Strings = Awaited<ReturnType<typeof getStrings>>

const accountSections: Record<string, keyof Strings> = {
  tableaudebord: 'dashboard',
  mespaiementsmesdroits: 'payments',
  mesattestations: 'certificates',
  mesdemarches: 'procedures',
  mescourrierscourriels: 'mail',
  mesressources: 'resources',
  monprofil: 'profile',
  faireunedemandedeprestation: 'benefitRequest',
  monagenda: 'appointments',
  contactermacaf: 'contact',
}

function getPageTitle(): string {
  return document.querySelector('#block-caf-bootstrap5-content h1')?.textContent?.trim()
    || document.title.split(' | ')[0]!.trim()
}

presence.on('UpdateData', async () => {
  const [strings, privacy, buttons] = await Promise.all([
    getStrings(),
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('buttons'),
  ])
  const { hostname, pathname, search, href } = document.location
  const path = pathname.replace(/\/+$/, '')
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  if (hostname === 'connect.caf.fr') {
    presenceData.details = strings.loggingIn
  }
  else if (hostname === 'wwwd.caf.fr') {
    // Personal account area: only the section name is ever shown, never page content.
    presenceData.details = strings.viewAccount
    const section = path.match(/\/moncompte\/([a-z]+)/)?.[1]
    if (!privacy && section && accountSections[section])
      presenceData.state = strings[accountSections[section]]
  }
  else if (['', '/allocataires', '/professionnels'].includes(path)) {
    presenceData.details = strings.viewHome
  }
  else if (path.endsWith('/recherche')) {
    const query = new URLSearchParams(search).get('search')
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = strings.search
    if (privacy || !query) {
      presenceData.details = strings.search
    }
    else {
      presenceData.details = strings.searchFor
      presenceData.state = query
    }
  }
  else if (privacy) {
    presenceData.details = strings.browsing
  }
  else if (/\/actualites\/.+/.test(path)) {
    presenceData.details = strings.readingArticle
    presenceData.state = getPageTitle()
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = strings.readingArticle
    if (buttons)
      presenceData.buttons = [{ label: strings.buttonReadArticle, url: href }]
  }
  else {
    presenceData.details = strings.viewPage
    presenceData.state = getPageTitle()
    if (buttons)
      presenceData.buttons = [{ label: strings.buttonViewPage, url: href }]
  }

  presence.setActivity(presenceData)
})
