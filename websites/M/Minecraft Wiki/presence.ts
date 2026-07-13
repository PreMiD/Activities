const presence = new Presence({
  clientId: '1232903356025143297',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
let veactionLast: string | null = null

function hasPermissions(): boolean {
  return !document.querySelector('.permissions-errors')
}

async function prepare(): Promise<PresenceData> {
  const presenceData: PresenceData = {
    startTimestamp: browsingTimestamp,
  }
  const { href, search } = document.location
  const searchParams = new URLSearchParams(search)
  const strings = await presence.getStrings({
    viewHome: 'general.viewHome',
    viewUser: 'general.viewUser',
    viewAThread: 'general.viewAThread',
    buttonViewProfile: 'general.buttonViewProfile',
    editing: 'general.editing',
    advancedSettings: 'minecraft wiki.settings',
    viewAPage: 'general.viewAPage',
    buttonViewPage: 'general.buttonViewPage',
    readingAbout: 'general.readingAbout',
    moving: 'minecraft wiki.moving',
    viewSourceOf: 'minecraft wiki.viewSourceOf',
    viewHistory: 'minecraft wiki.viewHistory',
    changeProtection: 'minecraft wiki.changeProtection',
    viewProtection: 'minecraft wiki.viewProtection',
    search: 'general.search',
    upload: 'minecraft wiki.upload',
    viewContributionsOf: 'minecraft wiki.viewContributionsOf',
    viewRecentChanges: 'minecraft wiki.viewRecentChanges',
    login: 'minecraft wiki.login',
    btnViewThread: 'minecraft wiki.btnViewThread',
    viewWatchlist: 'minecraft wiki.viewWatchlist',
  })
  const {
    'mw.config.values.wgPageName': wgPageName,
    'mw.config.values.wgNamespaceNumber': wgNamespaceNumber,
    'mw.config.values.wgTitle': wgTitle,
    'mw.config.values.wgCanonicalSpecialPageName': wgCanonicalSpecialPageName,
    'mw.config.values.wgRelevantPageName': wgRelevantPageName,
    'mw.config.values.wgRelevantUserName': wgRelevantUserName,
    'mw.config.values.wgIsMainPage': wgIsMainPage,
  } = await presence.getPageVariable<{
    'mw.config.values.wgPageName': string
    'mw.config.values.wgNamespaceNumber': number
    'mw.config.values.wgTitle': string
    'mw.config.values.wgCanonicalSpecialPageName': string | false
    'mw.config.values.wgRelevantPageName': string
    'mw.config.values.wgRelevantUserName': string | null
    'mw.config.values.wgIsMainPage': boolean | null
  }>(
    'mw.config.values.wgPageName',
    'mw.config.values.wgNamespaceNumber',
    'mw.config.values.wgTitle',
    'mw.config.values.wgCanonicalSpecialPageName',
    'mw.config.values.wgRelevantPageName',
    'mw.config.values.wgRelevantUserName',
    'mw.config.values.wgIsMainPage',
  )
  const pageTitle = wgPageName.replace(/_/g, ' ')

  veactionLast = searchParams.get('veaction')

  presenceData.largeImageKey = getComputedStyle(
    document.querySelector<HTMLAnchorElement>('.mw-wiki-logo')!,
  ).backgroundImage.match(/url\("(.+)"\)/)?.[1]
  ?? 'https://cdn.rcd.gg/PreMiD/websites/M/Minecraft%20Wiki/assets/logo.png'

  if (
    searchParams.get('action') === 'edit'
    || searchParams.get('action') === 'submit'
    || searchParams.get('veaction') === 'edit'
    || searchParams.get('veaction') === 'editsource'
  ) {
    presenceData.details = hasPermissions()
      ? strings.editing
      : strings.viewSourceOf
    presenceData.state = pageTitle
  }
  else if (searchParams.get('action') === 'history') {
    presenceData.details = strings.viewHistory
    presenceData.state = pageTitle
  }
  else if (
    searchParams.get('action') === 'protect'
    || searchParams.get('action') === 'unprotect'
  ) {
    presenceData.details = hasPermissions()
      ? strings.changeProtection
      : strings.viewProtection
    presenceData.state = pageTitle
  }
  else if (searchParams.get('search')) {
    presenceData.details = strings.search
    presenceData.state = searchParams.get('search')
  }
  else if (wgNamespaceNumber === 2) {
    // User namespace
    presenceData.details = strings.viewUser
    presenceData.state = wgTitle
    presenceData.buttons = [{ label: strings.buttonViewProfile, url: href }]
  }
  else if (wgNamespaceNumber % 2 === 1) {
    // All talk namespaces
    presenceData.details = strings.viewAThread
    presenceData.state = wgNamespaceNumber === 1 ? wgTitle : pageTitle
    presenceData.buttons = [{ label: strings.btnViewThread, url: href }]
  }
  else if (wgNamespaceNumber === -1) {
    // Special namespace
    switch (wgCanonicalSpecialPageName) {
      case 'Preferences':
        // Preferences (Special:Preferences)
        presenceData.details = strings.advancedSettings
        break
      case 'Watchlist':
        // Subscriptions (Special:Watchlist)
        presenceData.details = strings.viewWatchlist
        break
      case 'Recentchanges':
        // Recent changes (Special:RecentChanges)
        presenceData.details = strings.viewRecentChanges
        break
      case 'Recentchangeslinked':
        // Related changes (Special:RecentChangesLinked)
        presenceData.details = strings.viewRecentChanges
        presenceData.state = wgRelevantPageName.replace(/_/g, ' ')
        break
      case 'Movepage':
        // Moving a page (Special:MovePage)
        presenceData.details = strings.moving
        presenceData.state = wgRelevantPageName.replace(/_/g, ' ')
        break
      case 'Userlogin':
      case 'CreateAccount':
        // Logging in (Special:UserLogin, Special:CreateAccount)
        presenceData.details = strings.login
        break
      case 'Upload':
        // Upload a file (Special:Upload)
        presenceData.details = strings.upload
        presenceData.state = searchParams.get('wpDestFile')
        break
      case 'Contributions':
        // Contributions (Special:Contributions)
        presenceData.details = strings.viewContributionsOf
        presenceData.state = wgRelevantUserName
        break
      default:
        presenceData.details = strings.viewAPage
        presenceData.state = pageTitle
    }
  }
  else if (wgNamespaceNumber) {
    // Not main namespace
    presenceData.details = `${strings.readingAbout} ${pageTitle.split(':')[0]}`
    presenceData.state = wgTitle
    presenceData.buttons = [{ label: strings.buttonViewPage, url: href }]
  }
  else if (wgIsMainPage) {
    presenceData.details = strings.viewHome
  }
  else {
    presenceData.details = strings.viewAPage
    presenceData.state = pageTitle
    presenceData.buttons = [{ label: strings.buttonViewPage, url: href }]
  }
  return presenceData
}

(async (): Promise<void> => {
  let presenceData = await prepare()
  presence.on('UpdateData', async () => {
    if (
      veactionLast
      !== new URLSearchParams(document.location.search).get('veaction')
    ) {
      presenceData = await prepare()
    }
    else {
      presence.setActivity(presenceData)
    }
  })
})()
