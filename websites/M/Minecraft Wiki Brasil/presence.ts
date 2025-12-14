const presence = new Presence({
  clientId: '1449558012514795540',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)
let veactionLast: string | null = null

function t(value: string | undefined, fallback: string): string {
  return value && !value.includes(':') ? value : fallback
}

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
  } = await presence.getPageVariable<any>(
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

  presenceData.largeImageKey =
    getComputedStyle(
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
      ? t(strings.editing, 'Editing')
      : t(strings.viewSourceOf, 'Viewing source of:')
    presenceData.state = pageTitle
  }
  else if (searchParams.get('action') === 'history') {
    presenceData.details = t(strings.viewHistory, 'Viewing history:')
    presenceData.state = pageTitle
  }
  else if (
    searchParams.get('action') === 'protect'
    || searchParams.get('action') === 'unprotect'
  ) {
    presenceData.details = hasPermissions()
      ? t(strings.changeProtection, 'Changing protection settings of:')
      : t(strings.viewProtection, 'Viewing protection settings of:')
    presenceData.state = pageTitle
  }
  else if (searchParams.get('search')) {
    presenceData.details = t(strings.search, 'Searching')
    presenceData.state = searchParams.get('search')
  }
  else if (wgNamespaceNumber === 2) {
    presenceData.details = t(strings.viewUser, 'Viewing user')
    presenceData.state = wgTitle
    presenceData.buttons = [
      { label: t(strings.buttonViewProfile, 'View profile'), url: href },
    ]
  }
  else if (wgNamespaceNumber % 2 === 1) {
    presenceData.details = t(strings.viewAThread, 'Viewing discussion')
    presenceData.state = wgNamespaceNumber === 1 ? wgTitle : pageTitle
    presenceData.buttons = [
      { label: t(strings.btnViewThread, 'View thread'), url: href },
    ]
  }
  else if (wgNamespaceNumber === -1) {
    switch (wgCanonicalSpecialPageName) {
      case 'Preferences':
        presenceData.details = t(strings.advancedSettings, 'Configuring settings')
        break
      case 'Watchlist':
        presenceData.details = t(strings.viewWatchlist, 'Viewing watchlist')
        break
      case 'Recentchanges':
        presenceData.details = t(strings.viewRecentChanges, 'Viewing recent changes')
        break
      case 'Recentchangeslinked':
        presenceData.details = t(strings.viewRecentChanges, 'Viewing related changes')
        presenceData.state = wgRelevantPageName.replace(/_/g, ' ')
        break
      case 'Movepage':
        presenceData.details = t(strings.moving, 'Moving page')
        presenceData.state = wgRelevantPageName.replace(/_/g, ' ')
        break
      case 'Userlogin':
      case 'CreateAccount':
        presenceData.details = t(strings.login, 'Logging in')
        break
      case 'Upload':
        presenceData.details = t(strings.upload, 'Uploading file')
        presenceData.state = searchParams.get('wpDestFile')
        break
      case 'Contributions':
        presenceData.details = t(strings.viewContributionsOf, 'Viewing contributions of:')
        presenceData.state = wgRelevantUserName
        break
      default:
        presenceData.details = t(strings.viewAPage, 'Viewing page')
        presenceData.state = pageTitle
    }
  }
  else if (wgNamespaceNumber) {
    presenceData.details = `${t(strings.readingAbout, 'Reading about')} ${pageTitle.split(':')[0]}`
    presenceData.state = wgTitle
    presenceData.buttons = [
      { label: t(strings.buttonViewPage, 'View page'), url: href },
    ]
  }
  else if (wgIsMainPage) {
    presenceData.details = t(strings.viewHome, 'Home page')
  }
  else {
    presenceData.details = t(strings.viewAPage, 'Viewing page')
    presenceData.state = pageTitle
    presenceData.buttons = [
      { label: t(strings.buttonViewPage, 'View page'), url: href },
    ]
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
