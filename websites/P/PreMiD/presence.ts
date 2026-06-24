import { Assets } from 'premid'

const presence = new Presence({
  clientId: '792735245488488458',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/P/PreMiD/assets/logo.png',
}

async function getStrings() {
  return presence.getStrings({
    browsing: 'general.browsing',
    reading: 'general.reading',
    viewPage: 'general.viewPage',
    viewActivity: 'premid.viewActivity',
    docs: 'premid.docs',
    home: 'premid.pageHome',
    contributors: 'premid.pageContributors',
    downloads: 'premid.pageDownloads',
    activityLibrary: 'premid.pageActivityLibrary',
    install: 'premid.pageInstall',
    apiReference: 'premid.pageApiReference',
    view: 'general.view',
    incident: 'general.incidentHistory',
    uptime: 'general.uptimeHistory',
    class: 'premid.pagePresenceClass',
    slideshowClass: 'premid.pageSlideshowClass',
    iframes: 'premid.pageIframes',
    metadata: 'premid.pageMetadata',
    btnViewPage: 'general.buttonViewPage',
    plans: 'premid.pagePlans',
    faq: 'premid.pageFaq',
    dashboard: 'premid.pageDashboard',
    guide: 'premid.pageGuide',
    examples: 'premid.pageExamples',
    firstActivity: 'premid.pageFirstActivity',
    introduction: 'premid.pageIntroduction',
    structure: 'premid.pageStructure',
    settings: 'premid.pageSettings',
    dependencies: 'premid.pageDependencies',
    loadingActivities: 'premid.pageLoadingActivities',
    developerTools: 'premid.pageDeveloperTools',
    slideshows: 'premid.pageSlideshows',
    localization: 'premid.pageLocalization',
    bestPractices: 'premid.pageBestPractices',
    guidelines: 'premid.pageGuidelines',
    activityForwarding: 'premid.pageActivityForwarding',
    presenceData: 'premid.pagePresenceData',
    metadataStructure: 'premid.pageMetadataStructure',
    iframeClass: 'premid.pageIframeClass',
    utilityFunctions: 'premid.pageUtilityFunctions',
    overview: 'premid.pageApiOverview',
    mediaExample: 'premid.pageMediaExample',
    settingsExample: 'premid.pageSettingsExample',
    iframesExample: 'premid.pageIframesExample',
    slideshowsExample: 'premid.pageSlideshowsExample',
    basicExample: 'premid.pageBasicExample',
    status: 'premid.pageStatus',
    feedback: 'premid.pageFeedback',
  })
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
  }
  const [time, showButtons] = await Promise.all([
    presence.getSetting<string>('time'),
    presence.getSetting<string>('showButtons'),
  ])
  const strings = await getStrings()
  const { hostname, pathname } = document.location

  if (showButtons) {
    presenceData.buttons = [
      {
        label: strings.btnViewPage,
        url: window.location.href,
      },
    ]
  }

  if (time)
    presenceData.startTimestamp = browsingTimestamp

  switch (hostname) {
    case 'premid.app':
    case 'beta.premid.app': {
      hostname.includes('beta')
        ? (presenceData.smallImageText = `BETA | ${strings.browsing}`)
        : (presenceData.smallImageText = strings.browsing)
      presenceData.smallImageKey = Assets.Search

      let icon
      let activityName

      switch (true) {
        case pathname.includes('/downloads'):
          presenceData.details = strings.viewPage
          presenceData.state = strings.downloads
          break
        case pathname.includes('/contributors'):
          presenceData.details = strings.viewPage
          presenceData.state = strings.contributors
          break
        case pathname.includes('/plans'):
          presenceData.details = strings.viewPage
          presenceData.state = strings.plans
          break
        case pathname.includes('/faq'):
          presenceData.details = strings.viewPage
          presenceData.state = strings.faq
          break
        case pathname.includes('/dashboard'):
          presenceData.details = strings.viewPage
          presenceData.state = strings.dashboard
          break
        case /\/library\/.+/.test(pathname):
          activityName = pathname.match(/\/library\/(.+)/)?.[1]
          icon = document.querySelector<HTMLMetaElement>('[property="og:image"]')?.content || ActivityAssets.Logo

          presenceData.details = strings.viewActivity
          presenceData.state = document.querySelector('h2')?.textContent?.trim() || activityName || strings.activityLibrary

          if (icon) {
            presenceData.largeImageKey = icon
            presenceData.smallImageKey = ActivityAssets.Logo
          }
          break
        case pathname.includes('/library'):
          presenceData.details = strings.viewPage
          presenceData.state = strings.activityLibrary
          break
        default:
          presenceData.details = strings.viewPage
          presenceData.state = strings.home
      }

      break
    }
    case 'docs.premid.app': {
      presenceData.details = `${strings.docs} | ${strings.viewPage}`
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = strings.reading

      if (pathname.includes('/guide')) {
        presenceData.state = `${strings.guide} - `
      }
      else if (pathname.includes('/api')) {
        presenceData.state = `${strings.apiReference} - `
      }
      else if (pathname.includes('/examples')) {
        presenceData.state = `${strings.examples} - `
      }
      else {
        presenceData.state = ''
      }

      switch (true) {
        case pathname.includes('/guide/installation'):
          presenceData.state += strings.install
          break
        case pathname.includes('/guide/first-activity'):
          presenceData.state += strings.firstActivity
          break
        case pathname.includes('/guide/structure'):
          presenceData.state += strings.structure
          break
        case pathname.includes('/guide/metadata'):
          presenceData.state += strings.metadata
          break
        case pathname.includes('/guide/presence-class'):
          presenceData.state += strings.class
          break
        case pathname.includes('/guide/settings'):
          presenceData.state += strings.settings
          break
        case pathname.includes('/guide/dependencies'):
          presenceData.state += strings.dependencies
          break
        case pathname.includes('/guide/loading-activities'):
          presenceData.state += strings.loadingActivities
          break
        case pathname.includes('/guide/developer-tools'):
          presenceData.state += strings.developerTools
          break
        case pathname.includes('/guide/iframes'):
          presenceData.state += strings.iframes
          break
        case pathname.includes('/guide/slideshows'):
          presenceData.state += strings.slideshows
          break
        case pathname.includes('/guide/localization'):
          presenceData.state += strings.localization
          break
        case pathname.includes('/guide/best-practices'):
          presenceData.state += strings.bestPractices
          break
        case pathname.includes('/guide/guidelines'):
          presenceData.state += strings.guidelines
          break
        case pathname.includes('/guide/activity-forwarding'):
          presenceData.state += strings.activityForwarding
          break
        case pathname.includes('/guide'):
          presenceData.state += strings.introduction
          break
        case pathname.includes('/api/presence-class'):
          presenceData.state += strings.class
          break
        case pathname.includes('/api/presence-data'):
          presenceData.state += strings.presenceData
          break
        case pathname.includes('/api/metadata-json'):
          presenceData.state += strings.metadataStructure
          break
        case pathname.includes('/api/slideshow'):
          presenceData.state += strings.slideshowClass
          break
        case pathname.includes('/api/iframe'):
          presenceData.state += strings.iframeClass
          break
        case pathname.includes('/api/utility-functions'):
          presenceData.state += strings.utilityFunctions
          break
        case pathname.includes('/api'):
          presenceData.state += strings.overview
          break
        case pathname.includes('/examples/media'):
          presenceData.state += strings.mediaExample
          break
        case pathname.includes('/examples/settings'):
          presenceData.state += strings.settingsExample
          break
        case pathname.includes('/examples/iframes'):
          presenceData.state += strings.iframesExample
          break
        case pathname.includes('/examples/slideshow'):
          presenceData.state += strings.slideshowsExample
          break
        case pathname.includes('/examples'):
          presenceData.state += strings.basicExample
          break
        default:
          presenceData.state = strings.home
      }

      break
    }
    case 'status.premid.app': {
      presenceData.details = `${strings.status} | ${strings.viewPage}`
      presenceData.smallImageKey = Assets.Search
      presenceData.smallImageText = strings.browsing

      switch (true) {
        case pathname.includes('/incidents'):
          presenceData.details = `${strings.view} ${document.title.replace(
            'PreMiD Status - ',
            '',
          )}`
          break
        case pathname.includes('/history'):
          presenceData.state = strings.incident
          break
        case pathname.includes('/uptime'):
          presenceData.state = strings.uptime
          break
        default:
          presenceData.state = strings.home
      }

      break
    }
    case 'feedback.premid.app': {
      presenceData.details = `${strings.feedback} | ${strings.viewPage}`
      presenceData.smallImageKey = Assets.Search
      presenceData.smallImageText = strings.browsing

      switch (true) {
        case pathname.includes('/posts'):
          presenceData.details = `${strings.view} ${document.title.split(' · ')[0]?.trim()}`
          break
        default:
          presenceData.state = strings.home
      }
      break
    }
  }
  presence.setActivity(presenceData)
})
