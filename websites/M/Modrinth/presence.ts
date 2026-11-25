const presence = new Presence({
  clientId: '1047217921685991462',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/M/Modrinth/assets/logo.png',
}

const stringKeys = {
  // general.json
  browsing: 'general.browsing',
  reading: 'general.reading',
  readingAnArticle: 'general.readingAnArticle',
  readingArticle: 'general.readingArticle',
  viewAProfile: 'general.viewAProfile',
  viewHome: 'general.viewHome',
  viewProfile: 'general.viewProfile',
  buttonViewProfile: 'general.buttonViewProfile',
  legalTerms: 'general.terms',
  legalPrivacy: 'general.privacy',
  // Modrinth.json
  browsingApiDocs: 'modrinth.browsingApiDocs',
  browsingContributingDocs: 'modrinth.browsingContributingDocs',
  browsingGuide: 'modrinth.browsingGuide',
  buttonViewOrganization: 'modrinth.buttonViewOrganization',
  buttonViewProject: 'modrinth.buttonViewProject',
  discoveringContent: 'modrinth.discoveringContent',
  discoveringDataPacks: 'modrinth.discoveringDataPacks',
  discoveringModpacks: 'modrinth.discoveringModpacks',
  discoveringMods: 'modrinth.discoveringMods',
  discoveringPlugins: 'modrinth.discoveringPlugins',
  discoveringResourcePacks: 'modrinth.discoveringResourcePacks',
  discoveringServers: 'modrinth.discoveringServers',
  discoveringShaders: 'modrinth.discoveringShaders',
  editingProject: 'modrinth.editingProject',
  hostingServer: 'modrinth.hostingServer',
  legalCcpa: 'modrinth.legalCcpa',
  legalCopyright: 'modrinth.legalCopyright',
  legalOther: 'modrinth.legalOther',
  legalRewardsInfo: 'modrinth.legalRewardsInfo',
  legalRewardsTerms: 'modrinth.legalRewardsTerms',
  legalRules: 'modrinth.legalRules',
  legalSecurity: 'modrinth.legalSecurity',
  managingCollections: 'modrinth.managingCollections',
  managingOrganization: 'modrinth.managingOrganization',
  managingOrganizations: 'modrinth.managingOrganizations',
  managingProjects: 'modrinth.managingProjects',
  managingReports: 'modrinth.managingReports',
  managingServers: 'modrinth.managingServers',
  modrinthChangelog: 'modrinth.modrinthChangelog',
  readingNews: 'modrinth.readingNews',
  tabAnalytics: 'modrinth.tabAnalytics',
  tabChangelog: 'modrinth.tabChangelog',
  tabDescription: 'modrinth.tabDescription',
  tabDisclosures: 'modrinth.tabDisclosures',
  tabGallery: 'modrinth.tabGallery',
  tabGeneral: 'modrinth.tabGeneral',
  tabLicense: 'modrinth.tabLicense',
  tabLinks: 'modrinth.tabLinks',
  tabMembers: 'modrinth.tabMembers',
  tabModeration: 'modrinth.tabModeration',
  tabProjects: 'modrinth.tabProjects',
  tabTags: 'modrinth.tabTags',
  tabVersions: 'modrinth.tabVersions',
  typeCollection: 'modrinth.typeCollection',
  typeDataPack: 'modrinth.typeDataPack',
  typeMod: 'modrinth.typeMod',
  typeModpack: 'modrinth.typeModpack',
  typePlugin: 'modrinth.typePlugin',
  typeProject: 'modrinth.typeProject',
  typeResourcePack: 'modrinth.typeResourcePack',
  typeServer: 'modrinth.typeServer',
  typeShader: 'modrinth.typeShader',
  viewingAnalytics: 'modrinth.viewingAnalytics',
  viewingDashboard: 'modrinth.viewingDashboard',
  viewingNotifications: 'modrinth.viewingNotifications',
  viewingOrganization: 'modrinth.viewingOrganization',
  viewingProject: 'modrinth.viewingProject',
  viewingRevenue: 'modrinth.viewingRevenue',
  viewingSettings: 'modrinth.viewingSettings',
} as const

type StringKey = keyof typeof stringKeys

const projectTypes = new Map<string, StringKey>([
  ['mod', 'typeMod'],
  ['plugin', 'typePlugin'],
  ['resourcepack', 'typeResourcePack'],
  ['modpack', 'typeModpack'],
  ['datapack', 'typeDataPack'],
  ['shader', 'typeShader'],
  ['server', 'typeServer'],
  ['project', 'typeProject'],
  ['collection', 'typeCollection'],
])

const discoverPages = new Map<string, StringKey>([
  ['mods', 'discoveringMods'],
  ['modpacks', 'discoveringModpacks'],
  ['plugins', 'discoveringPlugins'],
  ['resourcepacks', 'discoveringResourcePacks'],
  ['datapacks', 'discoveringDataPacks'],
  ['shaders', 'discoveringShaders'],
  ['servers', 'discoveringServers'],
])

const dashboardPages = new Map<string, StringKey>([
  ['notifications', 'viewingNotifications'],
  ['reports', 'managingReports'],
  ['collections', 'managingCollections'],
  ['projects', 'managingProjects'],
  ['organizations', 'managingOrganizations'],
  ['analytics', 'viewingAnalytics'],
  ['revenue', 'viewingRevenue'],
])

const legalPages = new Map<string, StringKey>([
  ['terms', 'legalTerms'],
  ['privacy', 'legalPrivacy'],
  ['rules', 'legalRules'],
  ['security', 'legalSecurity'],
  ['copyright', 'legalCopyright'],
  ['cmp', 'legalRewardsTerms'],
  ['cmp-info', 'legalRewardsInfo'],
  ['ccpa', 'legalCcpa'],
])

const docsPages = new Map<string, StringKey>([
  ['contributing', 'browsingContributingDocs'],
  ['guide', 'browsingGuide'],
  ['api', 'browsingApiDocs'],
])

const projectTabs = new Map<string, StringKey>([
  ['gallery', 'tabGallery'],
  ['changelog', 'tabChangelog'],
  ['versions', 'tabVersions'],
  ['version', 'tabVersions'],
  ['moderation', 'tabModeration'],
])

const settingsTabs = new Map<string, StringKey>([
  ['disclosures', 'tabDisclosures'],
  ['tags', 'tabTags'],
  ['description', 'tabDescription'],
  ['versions', 'tabVersions'],
  ['license', 'tabLicense'],
  ['gallery', 'tabGallery'],
  ['links', 'tabLinks'],
  ['projects', 'tabProjects'],
  ['members', 'tabMembers'],
  ['analytics', 'tabAnalytics'],
])

presence.on('UpdateData', async () => {
  const [privacy, buttons, cover, tab, strings] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('cover'),
    presence.getSetting<boolean>('tab'),
    presence.getStrings(stringKeys),
  ])
  // Buttons, cover and tab settings are hidden (and ignored) when privacy mode is enabled
  const showButtons = !privacy && buttons
  const showCover = !privacy && cover
  const showTab = !privacy && tab

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { pathname, hostname, href } = document.location
  const pathSplit = pathname.split('/').filter(x => x)
  const active = document.querySelector('main a[aria-current="page"]') || document.querySelector('main a.router-link-exact-active')
  const mainTitle = document.querySelector<HTMLHeadingElement>('h1')?.textContent?.trim()

  // Privacy mode: no names, titles, avatars or links, everything stays anonymous
  const setState = (state?: string | null) => {
    if (!privacy && state)
      presenceData.state = state
  }
  // Images are lazy getters so that no DOM lookup happens when covers are disabled
  const setImage = (...images: (() => string | undefined)[]) => {
    if (!showCover)
      return
    for (const getImage of images) {
      const image = getImage()
      if (image) {
        presenceData.largeImageKey = image
        return
      }
    }
  }
  const setButton = (label: string) => {
    if (showButtons) {
      presenceData.buttons = [
        { label, url: href },
      ]
    }
  }
  // Compare the alt property instead of building a selector, titles can contain quotes
  const avatar = (alt?: string) => () => alt
    ? Array.from(document.querySelectorAll<HTMLImageElement>('img.avatar')).find(img => img.alt === alt)?.src
    : undefined
  const firstAvatar = () => document.querySelector<HTMLImageElement>('img.avatar')?.src
  const fromMap = (map: Map<string, StringKey>, key: string | undefined, fallback: StringKey) =>
    strings[map.get(key ?? '') ?? fallback]

  switch (hostname) {
    case 'modrinth.com': {
      const projectTypeKey = projectTypes.get(pathSplit[0] ?? '')

      if (projectTypeKey) {
        const typeName = strings[projectTypeKey]
        const isSettings = pathSplit[2] === 'settings'
        presenceData.details = (isSettings ? strings.editingProject : strings.viewingProject).replace('{0}', typeName)
        // On a specific version page, add the version name after the project name
        const versionName = pathSplit[2] === 'version'
          ? document.querySelector('[class*="page"] > [class*="content"] h2')?.textContent?.trim()
          : undefined
        setState([mainTitle, versionName && `(${versionName})`].filter(Boolean).join(' '))
        if (pathSplit[0] === 'collection')
          setImage(firstAvatar)
        else
          setImage(avatar(mainTitle), firstAvatar)
        setButton(strings.buttonViewProject.replace('{0}', typeName))

        // Current tab of the project
        if (showTab) {
          let tabName: string
          if (active?.textContent) {
            tabName = active.textContent
          }
          // Fallback if active selector broke
          else if (isSettings) {
            tabName = fromMap(settingsTabs, pathSplit[3], 'tabGeneral')
          }
          else {
            tabName = fromMap(projectTabs, pathSplit[2], 'tabDescription')
          }
          presenceData.details += ` - ${tabName}`
        }
        break
      }

      switch (pathSplit[0]) {
        case 'discover': {
          presenceData.details = fromMap(discoverPages, pathSplit[1], 'discoveringContent')
          break
        }
        case 'user': {
          presenceData.details = privacy ? strings.viewAProfile : strings.viewProfile
          setState(mainTitle || pathSplit[1])
          setImage(avatar(mainTitle || pathSplit[1]))
          setButton(strings.buttonViewProfile)
          break
        }
        case 'organization': {
          presenceData.details = pathSplit[2] === 'settings'
            ? strings.managingOrganization
            : strings.viewingOrganization
          setState(mainTitle || pathSplit[1])
          setImage(avatar(mainTitle))
          setButton(strings.buttonViewOrganization)
          break
        }
        case 'settings': {
          presenceData.details = strings.viewingSettings
          setState(active?.textContent)
          break
        }
        case 'dashboard': {
          presenceData.details = fromMap(dashboardPages, pathSplit[1], 'viewingDashboard')
          break
        }
        case 'hosting': {
          presenceData.details = pathSplit[1] === 'manage'
            ? strings.managingServers
            : strings.hostingServer
          break
        }
        case 'news': {
          if (pathSplit[1] === 'article') {
            const articleTitle = document.querySelector('h2')?.textContent
            presenceData.details = privacy || !articleTitle
              ? strings.readingAnArticle
              : strings.readingArticle
            setState(articleTitle)
          }
          else if (pathSplit[1] === 'changelog') {
            presenceData.details = strings.readingNews
            presenceData.state = strings.modrinthChangelog
          }
          else {
            presenceData.details = strings.readingNews
          }
          break
        }
        case 'legal': {
          presenceData.details = strings.reading
          presenceData.state = fromMap(legalPages, pathSplit[1], 'legalOther')
          break
        }
        default: {
          presenceData.details = strings.viewHome
        }
      }
      break
    }
    case 'docs.modrinth.com': {
      const docsKey = docsPages.get(pathSplit[0] ?? '')
      presenceData.details = docsKey ? strings[docsKey] : strings.browsing
      if (docsKey)
        setState(mainTitle)
      break
    }
  }

  if (presenceData.largeImageKey !== ActivityAssets.Logo) {
    presenceData.smallImageKey = ActivityAssets.Logo
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.clearActivity()
})
