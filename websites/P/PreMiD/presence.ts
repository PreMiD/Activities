import { Assets } from 'premid'

const presence = new Presence({
  clientId: '792735245488488458',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

// checkmate javascript
function pathIncludes(string: string): boolean {
  return document.location.pathname.toLowerCase().includes(string)
}

async function getStrings() {
  return presence.getStrings(
    {
      browsing: 'general.browsing',
      reading: 'general.reading',
      viewPage: 'general.viewPage',
      viewUser: 'general.viewUser',
      viewPresence: 'premid.viewPresence',
      docs: 'premid.docs',
      home: 'premid.pageHome',
      contributors: 'premid.pageContributors',
      downloads: 'premid.pageDownloads',
      store: 'premid.pageStore',
      cookies: 'general.cookie',
      privacy: 'general.privacy',
      terms: 'general.terms',
      about: 'premid.pageAbout',
      sysreq: 'premid.pageSysReq',
      install: 'premid.pageInstall',
      installFor: 'premid.pageInstallFor',
      yikes: 'premid.pageTroubleshooting',
      start: 'premid.pageStart',
      api: 'premid.pageApi',
      apiPage: 'premid.pageApiVersion',
      presenceDev: 'premid.pagePresenceDev',
      presenceGuide: 'premid.pagePresenceGuide',
      partners: 'premid.partners',
      view: 'general.view',
      incident: 'general.incidentHistory',
      uptime: 'general.uptimeHistory',
      class: 'premid.pagePresenceClass',
      slideshow: 'premid.pageSlideshowClass',
      iframe: 'premid.pageIframe',
      metadata: 'premid.pageMetadata',
      ts: 'premid.pageTs',
      btnViewPage: 'general.buttonViewPage',
    },

  )
}

let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null
let host: string

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/P/PreMiD/assets/logo.png',
  }
  const [newLang, time, showButtons] = await Promise.all([
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<string>('time'),
    presence.getSetting<string>('showButtons'),
  ])

  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }

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

  host = document.location.hostname

  switch (host) {
    case 'premid.app':
    case 'beta.premid.app': {
      host.includes('beta')
        ? (presenceData.smallImageText = `BETA | ${strings.browsing}`)
        : (presenceData.smallImageText = strings.browsing)
      presenceData.smallImageKey = Assets.Search

      let icon

      switch (true) {
        case pathIncludes('/downloads'):
          presenceData.details = strings.viewPage
          presenceData.state = strings.downloads
          break
        case pathIncludes('/contributors'):
          presenceData.details = strings.viewPage
          presenceData.state = strings.contributors
          break
        case pathIncludes('/beta'):
          presenceData.details = strings.viewPage
          presenceData.state = 'BETA'
          break
        case pathIncludes('/partner'):
          presenceData.details = strings.viewPage
          presenceData.state = strings.partners
          break
        case pathIncludes('/cookies'):
          presenceData.details = strings.viewPage
          presenceData.state = strings.cookies
          break
        case pathIncludes('/privacy'):
          presenceData.details = strings.viewPage
          presenceData.state = strings.privacy
          break
        case pathIncludes('/tos'):
          presenceData.details = strings.viewPage
          presenceData.state = strings.terms
          break
        case pathIncludes('/users/'):
          icon = document.querySelector<HTMLImageElement>(
            'div.user-avatar img',
          )?.src

          presenceData.details = strings.viewUser
          presenceData.state = document.querySelector('div.user-data p')
            ? document
              .querySelector('div.user-data p')
              ?.textContent
              ?.replace(/\s+/g, '')
            : 'USER NOT FOUND...'

          if (icon) {
            presenceData.largeImageKey = icon
            presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/P/PreMiD/assets/logo.png'
          }
          break
        case pathIncludes('/store/presences/'):
          icon = document.querySelector<HTMLImageElement>(
            'div.header__title div.section img',
          )?.src

          presenceData.details = strings.viewPresence
          presenceData.state = document.querySelector(
            '.header__title > div > h1',
          )
            ? document
              .querySelector('.header__title > div > h1')
              ?.textContent
              ?.replace(/^\s+|\s+$/g, '')
            : strings.store

          if (icon) {
            presenceData.largeImageKey = icon
            presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/P/PreMiD/assets/logo.png'
          }
          break
        case pathIncludes('/store'):
          presenceData.details = strings.viewPage
          presenceData.state = strings.store
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

      switch (true) {
        case pathIncludes('/troubleshooting'):
          presenceData.state = strings.yikes
          break
        case pathIncludes('/install/requirements'):
          presenceData.state = strings.sysreq
          break
        case pathIncludes('/install/windows'):
          presenceData.state = strings.installFor.replace('{0}', 'Windows')
          break
        case pathIncludes('/install/macos'):
          presenceData.state = strings.installFor.replace('{0}', 'MacOS')
          break
        case pathIncludes('/install/linux'):
          presenceData.state = strings.installFor.replace('{0}', 'Linux')
          break
        case pathIncludes('/install/firefox'):
          presenceData.state = strings.installFor.replace('{0}', 'Firefox')
          break
        case pathIncludes('/install/chromium'):
          presenceData.state = strings.installFor.replace(
            '{0}',
            'Chromium-based browsers',
          )
          break
        case pathIncludes('/install'):
          presenceData.state = strings.install
          break
        case pathIncludes('/dev/presence/guidelines'):
          presenceData.state = strings.presenceGuide
          break
        case pathIncludes('/dev/presence/tsconfig'):
          presenceData.state = strings.ts
          break
        case pathIncludes('/dev/presence/metadata'):
          presenceData.state = strings.metadata
          break
        case pathIncludes('/dev/presence/iframe'):
          presenceData.state = strings.iframe
          break
        case pathIncludes('/dev/presence/class'):
          presenceData.state = strings.class
          break
        case pathIncludes('/dev/presence/slideshow'):
          presenceData.state = strings.slideshow
          break
        case pathIncludes('/dev/presence'):
          presenceData.state = strings.presenceDev
          break
        case pathIncludes('/dev/api/v3'):
          presenceData.state = strings.apiPage.replace('{0}', '3')
          break
        case pathIncludes('/dev/api/v2'):
          presenceData.state = strings.apiPage.replace('{0}', '2')
          break
        case pathIncludes('/dev/api/v1'):
          presenceData.state = strings.apiPage.replace('{0}', '1')
          break
        case pathIncludes('/dev/api'):
          presenceData.state = strings.api
          break
        case pathIncludes('/dev'):
          presenceData.state = strings.start
          break
        case pathIncludes('/about'):
          presenceData.state = strings.about
          break
        case pathIncludes('/home'):
        default:
          presenceData.state = strings.home
      }

      break
    }
    case 'status.premid.app': {
      presenceData.details = `Status page | ${strings.view}`
      presenceData.smallImageKey = Assets.Search
      presenceData.smallImageText = strings.browsing

      switch (true) {
        case pathIncludes('/incidents'):
          presenceData.details = `${strings.view} ${document.title.replace(
            'PreMiD Status - ',
            '',
          )}`
          break
        case pathIncludes('/history'):
          presenceData.state = strings.incident
          break
        case pathIncludes('/uptime'):
          presenceData.state = strings.uptime
          break
        default:
          presenceData.state = strings.home
      }

      break
    }
  }
  presence.setActivity(presenceData)
})
