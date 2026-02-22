const presence = new Presence({
  clientId: '1465383098437992448',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum Images {
  home = 'https://cdn.rcd.gg/PreMiD/websites/M/MineHoster/assets/0.png',
  magicPen = 'https://cdn.rcd.gg/PreMiD/websites/M/MineHoster/assets/1.png',
  eye = 'https://cdn.rcd.gg/PreMiD/websites/M/MineHoster/assets/2.png',
  message = 'https://cdn.rcd.gg/PreMiD/websites/M/MineHoster/assets/3.png',
  book = 'https://cdn.rcd.gg/PreMiD/websites/M/MineHoster/assets/4.png',
  greenDot = 'https://cdn.rcd.gg/PreMiD/websites/M/MineHoster/assets/5.png',
  yellowDot = 'https://cdn.rcd.gg/PreMiD/websites/M/MineHoster/assets/6.png',
  redDot = 'https://cdn.rcd.gg/PreMiD/websites/M/MineHoster/assets/7.png',
  pen = 'https://cdn.rcd.gg/PreMiD/websites/M/MineHoster/assets/8.png',
  search = 'https://cdn.rcd.gg/PreMiD/websites/M/MineHoster/assets/9.png',
  settingsBig = 'https://cdn.rcd.gg/PreMiD/websites/M/MineHoster/assets/10.png',
  clock = 'https://cdn.rcd.gg/PreMiD/websites/M/MineHoster/assets/11.png',
  group = 'https://cdn.rcd.gg/PreMiD/websites/M/MineHoster/assets/12.png',
  cloud = 'https://cdn.rcd.gg/PreMiD/websites/M/MineHoster/assets/13.png',
  network = 'https://cdn.rcd.gg/PreMiD/websites/M/MineHoster/assets/14.png',
  settings = 'https://cdn.rcd.gg/PreMiD/websites/M/MineHoster/assets/15.png',
  arrowUpDown = 'https://cdn.rcd.gg/PreMiD/websites/M/MineHoster/assets/16.png',
  user = 'https://cdn.rcd.gg/PreMiD/websites/M/MineHoster/assets/17.png',
}

function getPathFromHash(): string {
  const hash = document.location.hash

  if (!hash || hash === '#/') {
    return '/'
  }
  return hash.substring(1)
}

function formatFilePath(path: string): string {
  const parts = path.split('/').filter(p => p.length > 0)

  if (!path || path === '/') {
    return '/'
  }
  if (parts.length <= 2) {
    return `/ > ${parts.join(' > ')}`
  }
  return `/ > ... > ${parts.slice(-2).join(' > ')}`
}

async function getStrings() {
  return presence.getStrings(
    {
      homepage: 'general.viewHome',
      scrollingOffers: 'minehoster.scrollingOffers',
      rentMinecraftServer: 'minehoster.rentMinecraftServer',
      selectingBase: 'minehoster.selectingBase',
      selectingOptions: 'minehoster.selectingOptions',
      confirmingServer: 'minehoster.confirmingServer',
      customizingServer: 'minehoster.customizingServer',
      onDashboard: 'minehoster.onDashboard',
      onAffiliate: 'minehoster.onAffiliate',
      affiliateId: 'minehoster.affiliateId',
      lookingDomain: 'minehoster.lookingDomain',
      browsingPricing: 'minehoster.browsingPricing',
      lookingCloudServers: 'minehoster.lookingCloudServers',
      lookingTechnology: 'minehoster.lookingTechnology',
      checkingServers: 'minehoster.checkingServers',
      lookingSupport: 'minehoster.lookingSupport',
      checkingSupportCenter: 'minehoster.checkingSupportCenter',
      lookingWebInterface: 'minehoster.lookingWebInterface',
      checkingFeatures: 'minehoster.checkingFeatures',
      redirectedPayment: 'minehoster.redirectedPayment',
      completingPurchase: 'minehoster.completingPurchase',
      lookingCompany: 'minehoster.lookingCompany',
      checkingAbout: 'minehoster.checkingAbout',
      readingParents: 'minehoster.readingParents',
      readingSafety: 'minehoster.readingSafety',
      readingNonProfit: 'minehoster.readingNonProfit',
      readingOffers: 'minehoster.readingOffers',
      lookingJobs: 'minehoster.lookingJobs',
      checkingPositions: 'minehoster.checkingPositions',
      readingPartner: 'minehoster.readingPartner',
      scrollingPartners: 'minehoster.scrollingPartners',
      readingImprint: 'minehoster.readingImprint',
      readingPrivacy: 'minehoster.readingPrivacy',
      readingTerms: 'minehoster.readingTerms',
      readingCancellation: 'minehoster.readingCancellation',
      onMineHoster: 'minehoster.onMineHoster',
      browsingWebsite: 'minehoster.browsingWebsite',
      serverConsole: 'minehoster.serverConsole',
      managingServer: 'minehoster.managingServer',
      managingActiveServer: 'minehoster.managingActiveServer',
      running: 'minehoster.running',
      managingStartingServer: 'minehoster.managingStartingServer',
      starting: 'minehoster.starting',
      managingStoppingServer: 'minehoster.managingStoppingServer',
      stopping: 'minehoster.stopping',
      managingOfflineServer: 'minehoster.managingOfflineServer',
      offline: 'minehoster.offline',
      viewServer: 'minehoster.viewServer',
      editing: 'general.editing',
      creating: 'minehoster.creating',
      fileManagement: 'minehoster.fileManagement',
      databaseManagement: 'minehoster.databaseManagement',
      databases: 'minehoster.databases',
      creatingDatabase: 'minehoster.creatingDatabase',
      viewingSchedules: 'minehoster.viewingSchedules',
      managingSchedules: 'minehoster.managingSchedules',
      creatingSchedule: 'minehoster.creatingSchedule',
      managingSchedule: 'minehoster.managingSchedule',
      managingPlan: 'minehoster.managingPlan',
      userManagement: 'minehoster.userManagement',
      managingUsers: 'minehoster.managingUsers',
      creatingUser: 'minehoster.creatingUser',
      backupManagement: 'minehoster.backupManagement',
      backups: 'minehoster.backups',
      creatingBackup: 'minehoster.creatingBackup',
      networkConfig: 'minehoster.networkConfig',
      configuringNetwork: 'minehoster.configuringNetwork',
      startupConfig: 'minehoster.startupConfig',
      editingStartup: 'minehoster.editingStartup',
      pluginManagement: 'minehoster.pluginManagement',
      browsingPlugins: 'minehoster.browsingPlugins',
      serverProperties: 'minehoster.serverProperties',
      editingProperties: 'minehoster.editingProperties',
      worldManagement: 'minehoster.worldManagement',
      managingWorlds: 'minehoster.managingWorlds',
      versionManagement: 'minehoster.versionManagement',
      selectingVersion: 'minehoster.selectingVersion',
      changingVersion: 'minehoster.changingVersion',
      reinstallingServer: 'minehoster.reinstallingServer',
      serverSettings: 'minehoster.serverSettings',
      configuringServer: 'minehoster.configuringServer',
      activityLogs: 'minehoster.activityLogs',
      edits: 'minehoster.edits',
      page: 'general.page',
      pages: 'minehoster.pages',
      serverOverview: 'minehoster.serverOverview',
      viewing: 'general.view',
      server: 'minehoster.server',
      servers: 'minehoster.servers',
      searchingServer: 'minehoster.searchingServer',
      accountSettings: 'minehoster.accountSettings',
      editingProfile: 'minehoster.editingProfile',
      sshManagement: 'minehoster.sshManagement',
      viewingActivity: 'minehoster.viewingActivity',
      updating2FA: 'minehoster.updating2FA',
      searching: 'general.search',
      searchingThrough: 'general.searchFor',
    },
  )
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/M/MineHoster/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  const { pathname, href, hostname } = document.location

  const [
    showButtons,
    showTimestamp,
    showServerID,
    showSearchActivity,
    showGamepanelName,
    strings,
  ] = await Promise.all([
    presence.getSetting<boolean>('showButtons'),
    presence.getSetting<boolean>('showTimestamp'),
    presence.getSetting<boolean>('showServerID'),
    presence.getSetting<boolean>('showSearchActivity'),
    presence.getSetting<boolean>('showGamepanelName'),
    getStrings(),
  ])

  if (!showTimestamp) {
    delete presenceData.startTimestamp
  }

  if (hostname === 'mine-hoster.de' || hostname === 'www.mine-hoster.de') {
    if (pathname === '/' || pathname === '/home') {
      presenceData.smallImageKey = Images.home
      presenceData.details = strings.homepage
      presenceData.state = strings.scrollingOffers
    }
    else if (pathname.includes('/minecraft-server-mieten')) {
      const activeTab = document.querySelector('.nav-tabs .nav-link.active')

      presenceData.smallImageKey = Images.magicPen
      presenceData.details = strings.rentMinecraftServer

      if (activeTab) {
        const tabText = activeTab.textContent.trim().split('\n')[0]
        if (tabText!.includes('1.')) {
          presenceData.state = strings.selectingBase
        }
        else if (tabText!.includes('2.')) {
          presenceData.state = strings.selectingOptions
        }
        else if (tabText!.includes('3.')) {
          presenceData.state = strings.confirmingServer
        }
        else {
          presenceData.state = strings.customizingServer
        }
      }
    }
    else if (pathname.includes('/dashboard')) {
      presenceData.smallImageKey = Images.home
      presenceData.details = strings.onDashboard
    }
    else if (pathname.includes('/affiliate')) {
      const affiliateLink = document.querySelector<HTMLInputElement>('input[class*="input--grey"]')?.value?.trim() || ''
      const affiliateId = Number(affiliateLink.replace(/\D/g, '') || null)

      presenceData.smallImageKey = Images.eye
      presenceData.details = strings.onAffiliate

      if (affiliateLink !== '') {
        presenceData.state = `${strings.affiliateId}: ${affiliateId}`
      }
    }
    else if (pathname.includes('/domain-mieten')) {
      presenceData.smallImageKey = Images.magicPen
      presenceData.details = strings.lookingDomain
      presenceData.state = strings.browsingPricing
    }
    else if (pathname.includes('/cloudserver')) {
      presenceData.smallImageKey = Images.eye
      presenceData.details = strings.lookingCloudServers
    }
    else if (pathname.includes('/technik')) {
      presenceData.details = strings.lookingTechnology
      presenceData.state = strings.checkingServers
    }
    else if (pathname.includes('/support')) {
      presenceData.smallImageKey = Images.message
      presenceData.details = strings.lookingSupport
      presenceData.state = strings.checkingSupportCenter
    }
    else if (pathname.includes('/unser-webinterface')) {
      presenceData.details = strings.lookingWebInterface
      presenceData.state = strings.checkingFeatures
    }
    else if (pathname.includes('/shop/pay') || pathname.includes('/payment')) {
      presenceData.details = strings.redirectedPayment
      presenceData.state = strings.completingPurchase
    }
    else if (pathname.includes('/ueber-uns')) {
      presenceData.smallImageKey = Images.eye
      presenceData.details = strings.lookingCompany
      presenceData.state = strings.checkingAbout
    }
    else if (pathname.includes('/information-fuer-eltern')) {
      presenceData.smallImageKey = Images.book
      presenceData.details = strings.readingParents
      presenceData.state = strings.readingSafety
    }
    else if (pathname.includes('/non-profit')) {
      presenceData.smallImageKey = Images.book
      presenceData.details = strings.readingNonProfit
      presenceData.state = strings.readingOffers
    }
    else if (pathname.includes('/jobs')) {
      presenceData.smallImageKey = Images.eye
      presenceData.details = strings.lookingJobs
      presenceData.state = strings.checkingPositions
    }
    else if (pathname.includes('/partner')) {
      presenceData.smallImageKey = Images.book
      presenceData.details = strings.readingPartner
      presenceData.state = strings.scrollingPartners
    }
    else if (pathname.includes('/impressum')) {
      presenceData.smallImageKey = Images.book
      presenceData.details = strings.readingImprint
    }
    else if (pathname.includes('/datenschutzerklaerung')) {
      presenceData.smallImageKey = Images.book
      presenceData.details = strings.readingPrivacy
    }
    else if (pathname.includes('/agb')) {
      presenceData.smallImageKey = Images.book
      presenceData.details = strings.readingTerms
    }
    else if (pathname.includes('/widerruf')) {
      presenceData.smallImageKey = Images.book
      presenceData.details = strings.readingCancellation
    }
    else {
      presenceData.smallImageKey = Images.eye
      presenceData.details = strings.onMineHoster
      presenceData.state = strings.browsingWebsite
    }
  }
  else if (hostname === 'gamepanel.mine-hoster.de' || hostname === 'www.gamepanel.mine-hoster.de') {
    const searchModalElement = document.querySelector('[class*=InputSpinner__Container]')
    const serverMatch = pathname.match(/\/server\/([a-f0-9]+)/)
    const serverID = serverMatch ? serverMatch[1] : null
    const shortServerID = serverID ? `#${serverID.substring(0, 8)}` : null

    presenceData.name = showGamepanelName ? 'MineHoster Gamepanel' : 'MineHoster'

    if (serverID && pathname === `/server/${serverID}`) {
      const statusElement = document.querySelector('.ServerConsole___StyledDiv7-sc-1j2y518-11.gnmPZj')
      const serverStatus = statusElement?.textContent?.trim() || 'offline'

      presenceData.details = strings.serverConsole
      presenceData.state = showServerID && shortServerID
        ? `${strings.server}: ${shortServerID}`
        : strings.managingServer

      if (serverStatus === 'running') {
        presenceData.smallImageText = strings.running
        presenceData.smallImageKey = Images.greenDot
        presenceData.state = showServerID && shortServerID
          ? `${strings.server}: ${shortServerID}`
          : strings.managingActiveServer
      }
      else if (serverStatus === 'starting') {
        presenceData.smallImageText = strings.starting
        presenceData.smallImageKey = Images.yellowDot
        presenceData.state = showServerID && shortServerID
          ? `${strings.server}: ${shortServerID}`
          : strings.managingStartingServer
      }
      else if (serverStatus === 'stopping') {
        presenceData.smallImageText = strings.stopping
        presenceData.smallImageKey = Images.yellowDot
        presenceData.state = showServerID && shortServerID
          ? `${strings.server}: ${shortServerID}`
          : strings.managingStoppingServer
      }
      else if (serverStatus === 'offline') {
        presenceData.smallImageText = strings.offline
        presenceData.smallImageKey = Images.redDot
        presenceData.state = showServerID && shortServerID
          ? `${strings.server}: ${shortServerID}`
          : strings.managingOfflineServer
      }

      if (showButtons && serverID) {
        presenceData.buttons = [
          {
            label: strings.viewServer,
            url: href,
          },
        ]
      }
    }
    else if (serverID && pathname.includes('/files')) {
      const isEditing = pathname.includes('/edit')
      const isCreating = pathname.includes('/new')
      const filePath = getPathFromHash()

      if (isEditing) {
        const fileName = filePath.split('/').pop() || 'Datei'
        presenceData.details = `${strings.editing} ${fileName}`
        presenceData.state = showServerID && shortServerID
          ? `${strings.server}: ${shortServerID}`
          : formatFilePath(filePath.substring(0, filePath.lastIndexOf('/')))
        presenceData.smallImageKey = Images.pen
      }
      else if (isCreating) {
        presenceData.details = `${strings.creating}`
        presenceData.state = showServerID && shortServerID
          ? `${strings.server}: ${shortServerID}`
          : formatFilePath(filePath)
        presenceData.smallImageKey = Images.pen
      }
      else {
        presenceData.details = strings.fileManagement
        presenceData.state = showServerID && shortServerID
          ? `${strings.server}: ${shortServerID}`
          : formatFilePath(filePath)
        presenceData.smallImageKey = Images.search
      }
    }
    else if (serverID && pathname.includes('/databases')) {
      const dbText = document.querySelector('.DatabasesContainer___StyledP2-sc-1hfwugg-3')
      const match = dbText!.textContent.match(/(\d+)\s+von\s+(\d+)/)
      const modalElement = document.querySelector('.CreateDatabaseButton___StyledH-sc-ejjof7-1.hNLVdP')
      let totalDatabases
      let currentDatabase

      if (dbText) {
        if (match) {
          currentDatabase = Number.parseInt(match[1]!)
          totalDatabases = Number.parseInt(match[2]!)
        }
      }

      presenceData.smallImageKey = Images.settingsBig
      presenceData.details = strings.databaseManagement
      presenceData.state = showServerID && shortServerID
        ? `${strings.server}: ${shortServerID}`
        : `${currentDatabase}/${totalDatabases} ${strings.databases}`

      if (modalElement) {
        presenceData.details = strings.creatingDatabase
      }
    }
    else if (serverID && pathname.includes('/schedules')) {
      const modalElement = document.querySelector('.EditScheduleModal___StyledH-sc-wh9db9-0.fXkIyt')
      const scheduleMatch = pathname.match(/\/schedules\/(\d+)/)

      presenceData.smallImageKey = Images.clock
      presenceData.details = strings.viewingSchedules
      presenceData.state = showServerID && shortServerID
        ? `${strings.server}: ${shortServerID}`
        : strings.managingSchedules

      if (modalElement) {
        presenceData.details = strings.creatingSchedule
      }

      if (scheduleMatch) {
        presenceData.details = strings.managingSchedule
        presenceData.state = showServerID && shortServerID
          ? `${strings.server}: ${shortServerID}`
          : `${strings.managingPlan} ${scheduleMatch[1]}`
      }
    }
    else if (serverID && pathname.includes('/users')) {
      presenceData.details = strings.userManagement
      presenceData.state = showServerID && shortServerID
        ? `${strings.server}: ${shortServerID}`
        : strings.managingUsers
      presenceData.smallImageKey = Images.group

      const modalElement = document.querySelector('.EditSubuserModal___StyledH-sc-1hon03w-1.josEpU')
      if (modalElement) {
        presenceData.details = strings.creatingUser
      }
    }
    else if (serverID && pathname.includes('/backups')) {
      const dbText = document.querySelector('.BackupContainer___StyledP3-sc-1vjo0fh-5.bMYHez')
      const match = dbText!.textContent.match(/(\d+)\s+von\s+(\d+)/)
      let totalDatabases
      let currentDatabase

      if (dbText) {
        if (match) {
          currentDatabase = Number.parseInt(match[1]!)
          totalDatabases = Number.parseInt(match[2]!)
        }
      }

      presenceData.smallImageKey = Images.cloud
      presenceData.details = strings.backupManagement
      presenceData.state = showServerID && shortServerID
        ? `${strings.server}: ${shortServerID}`
        : `${currentDatabase}/${totalDatabases} ${strings.backups}`

      const modalElement = document.querySelector('.CreateBackupButton___StyledH-sc-da8bqw-1.bpeAku')
      if (modalElement) {
        presenceData.details = strings.creatingBackup
      }
    }
    else if (serverID && pathname.includes('/network')) {
      presenceData.details = strings.networkConfig
      presenceData.state = showServerID && shortServerID
        ? `${strings.server}: ${shortServerID}`
        : strings.configuringNetwork
      presenceData.smallImageKey = Images.network
    }
    else if (serverID && pathname.includes('/startup')) {
      presenceData.details = strings.startupConfig
      presenceData.state = showServerID && shortServerID
        ? `${strings.server}: ${shortServerID}`
        : strings.editingStartup
      presenceData.smallImageKey = Images.pen
    }
    else if (serverID && pathname.includes('/plugins')) {
      const pageNmbr = document.querySelector('.Button__ButtonStyle-sc-1qu1gou-0.dcnbJj.PluginInstallerContainer__Block-sc-1rigcdn-0.bUrjtX > .Button___StyledSpan-sc-1qu1gou-2')?.textContent?.trim() || '1'

      presenceData.details = strings.pluginManagement
      presenceData.state = showServerID && shortServerID
        ? `${strings.server}: ${shortServerID} - ${strings.page} ${pageNmbr}`
        : `${strings.browsingPlugins} - ${strings.page} ${pageNmbr}`
      presenceData.smallImageKey = Images.eye
    }
    else if (serverID && pathname.includes('/properties')) {
      presenceData.details = strings.serverProperties
      presenceData.state = showServerID && shortServerID
        ? `${strings.server}: ${shortServerID}`
        : strings.editingProperties
      presenceData.smallImageKey = Images.pen
    }
    else if (serverID && pathname.includes('/worlds')) {
      presenceData.details = strings.worldManagement
      presenceData.state = showServerID && shortServerID
        ? `${strings.server}: ${shortServerID}`
        : strings.managingWorlds
      presenceData.smallImageKey = Images.settings
    }
    else if (serverID && pathname.includes('/versions')) {
      const modalElement = document.querySelector('.ConfirmationModal___StyledH-sc-1sxt2cr-0.eEwZdf')
      const isInstallingVersion = document.querySelector('.ConfirmationModal___StyledH-sc-1sxt2cr-0.eEwZdf')?.textContent?.trim().replace(/\s+installieren\?.*/, '')

      presenceData.smallImageKey = Images.arrowUpDown
      presenceData.details = strings.versionManagement
      presenceData.state = showServerID && shortServerID
        ? `${strings.server}: ${shortServerID}`
        : strings.selectingVersion

      if (modalElement) {
        presenceData.details = strings.changingVersion
        presenceData.state = showServerID && shortServerID
          ? `${strings.server}: ${shortServerID}`
          : `${strings.selectingVersion}: ${isInstallingVersion}`
      }
    }
    else if (serverID && pathname.includes('/settings')) {
      const modalElement = document.querySelector('.style-module_Lib9Jbcw')

      presenceData.details = strings.serverSettings
      presenceData.state = showServerID && shortServerID
        ? `${strings.server}: ${shortServerID}`
        : strings.configuringServer

      if (modalElement) {
        presenceData.state = presenceData.state = showServerID && shortServerID
          ? `${strings.server}: ${shortServerID}`
          : strings.reinstallingServer
      }
      presenceData.smallImageKey = Images.settingsBig
    }
    else if (serverID && pathname.includes('/activity')) {
      const editCount = document.querySelectorAll('.grid.grid-cols-10').length
      const pageButtons = document.querySelectorAll('button.style-module_tpzh9TL4')
      const pageNumbers = Array.from(pageButtons)
        .map(btn => Number.parseInt(btn.textContent))
        .filter(num => !Number.isNaN(num))
      const totalPages = pageNumbers.length > 0 ? Math.max(...pageNumbers) : 1

      presenceData.details = strings.activityLogs
      presenceData.state = showServerID && shortServerID
        ? `${strings.server}: ${shortServerID}`
        : `${editCount} ${strings.edits} / ${totalPages} ${totalPages !== 1 ? strings.pages : strings.page}`
      presenceData.smallImageKey = Images.book
    }
    else if (pathname.includes('/account')) {
      const modalElement = document.querySelector('.style-module_Lib9Jbcw')

      presenceData.smallImageKey = Images.user
      presenceData.details = strings.accountSettings
      presenceData.state = strings.editingProfile
      if (pathname.includes('/ssh')) {
        presenceData.state = strings.sshManagement
      }
      else if (pathname.includes('/activity')) {
        presenceData.state = strings.viewingActivity
      }
      if (modalElement) {
        presenceData.state = strings.updating2FA
      }
    }
    else if (pathname === '/' || pathname === '/servers') {
      const serverCount = document.querySelectorAll('.ServerRow__StatusIndicatorBox-sc-1ibsw91-2').length
      const container = document.querySelector('.ContentContainer-sc-x3r2dw-0.PageContentBlock___StyledContentContainer-sc-kbxq2g-0.eFAqlT.jjahje')

      presenceData.smallImageKey = Images.eye
      presenceData.details = strings.serverOverview

      if (container) {
        const serverCount = container.querySelectorAll('a').length
        presenceData.state = `${strings.viewing} ${serverCount} ${serverCount !== 1 ? strings.servers : strings.server}`
      }
      else {
        presenceData.state = `${strings.searchingThrough} ${serverCount}  ${serverCount !== 1 ? strings.servers : strings.server}`
      }
    }
    else {
      presenceData.smallImageKey = Images.home
      presenceData.details = strings.managingServer
    }
    if (showSearchActivity && searchModalElement) {
      const currentSearch = document.querySelector<HTMLInputElement>('input[class*="Input-sc"]')?.value || ''
      const serverCount = document.querySelectorAll('.ServerRow__StatusIndicatorBox-sc-1ibsw91-2').length
      const isHomepage = pathname === '/'

      presenceData.details = strings.searchingServer
      presenceData.state = showServerID && shortServerID
        ? `${strings.server}: ${shortServerID}`
        : currentSearch
          ? `${strings.searching}: ${currentSearch}`
          : isHomepage
            ? `${strings.searchingThrough} ${serverCount}  ${serverCount !== 1 ? strings.servers : strings.server}`
            : ''
    }
  }

  else {
    presenceData.details = strings.onMineHoster
    presenceData.state = strings.browsingWebsite
  }

  if (presenceData.details) {
    presence.setActivity(presenceData)
  }
  else {
    presence.clearActivity()
  }
})
