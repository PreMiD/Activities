import { Assets } from 'premid'

const presence = new Presence({
  clientId: '839150832036872213',
})
const time = Math.floor(Date.now() / 1000)

let iframeData: {
  [key: string]: string
} = {}

async function getStrings() {
  return presence.getStrings(
    {
      viewHome: 'general.viewHome',
      viewProduct: 'general.viewProduct',
      view: 'general.view',
      viewProfile: 'general.viewProfile',
      readingArticle: 'general.readingArticle',
      comparing: 'apple.comparing',
      viewService: 'apple.viewService',
      healthcare: 'apple.healthcare',
      productsPlatform: 'apple.productsPlatform',
      healthRecords: 'apple.healthRecords',
      overview: 'apple.overview',
      purchasingAdvice: 'apple.purchasingAdvice',
      storeFinder: 'apple.storeFinder',
      viewEvent: 'apple.viewEvent',
      supplierResp: 'apple.supplierResp',
      contact: 'apple.contact',
      chooseLang: 'apple.chooseLang',
      other: 'apple.other',
      shopBands: 'apple.shopBands',
      shopAccessories: 'apple.shopAccessories',
      shopStudio: 'apple.shopStudio',
      shopFavorites: 'apple.shopFavorites',
      shopGiftCards: 'apple.shopGiftCards',
      shopPlanVisit: 'apple.shopPlanVisit',
      shopRefurbished: 'apple.shopRefurbished',
      shopBag: 'apple.shopBag',
      shopBagSummary: 'apple.shopBagSummary',
      support: 'apple.support',
      supportArticle: 'apple.supportArticle',
      appStoreCon: 'apple.appStoreCon',
      iCloudMail: 'apple.iCloudMail',
      iCloudContacts: 'apple.iCloudContacts',
      iCloudCalendar: 'apple.iCloudCalendar',
      iCloudPhotos: 'apple.iCloudPhotos',
      iCloudNotes: 'apple.iCloudNotes',
      iCloudReminders: 'apple.iCloudReminders',
      iCloudPagesCreate: 'apple.iCloudPagesCreate',
      iCloudKeynoteWait: 'apple.iCloudKeynoteWait',
      devNew: 'apple.devNew',
      devSubmit: 'apple.devSubmit',
      devPhonePad: 'apple.devPhonePad',
      devDistribution: 'apple.devDistribution',
      devDocs: 'apple.devDocs',
      devHIG: 'apple.devHIG',
      devResources: 'apple.devResources',
      devFeatures: 'apple.devFeatures',
      devGames: 'apple.devGames',
      forumTags: 'apple.forumTags',
      forumPreferences: 'apple.forumPreferences',
      forumCreateThread: 'apple.forumCreateThread',
      forumRegister: 'apple.forumRegister',
      devVideos: 'apple.devVideos',
      devVidTopic: 'apple.devVidTopic',
      devNews: 'apple.devNews',
      devReleases: 'apple.devReleases',
      statePaused: 'general.paused',
      statePlaying: 'general.playing',
      btnViewProduct: 'apple.btnViewProduct',
      btnViewService: 'apple.btnViewService',
      btnReadArticle: 'general.buttonReadArticle',
      btnViewEvent: 'apple.btnViewEvent',
      btnViewOS: 'apple.btnViewOS',
      btnViewStudio: 'apple.btnViewStudio',
      btnViewApp: 'apple.btnViewApp',
      btnViewDeveloper: 'apple.btnViewDeveloper',
      btnViewWWDC: 'apple.btnViewWWDC',
      btnViewThread: 'apple.btnViewThread',
      btnViewTags: 'apple.btnViewTags',
      btnViewProfile: 'apple.btnViewProfile',
      btnViewPage: 'general.buttonViewPage',
      btnGViewProfile: 'general.buttonViewProfile',
      btnGWatchVideo: 'general.buttonWatchVideo',
    },

  )
}

let strings: ReturnType<typeof getStrings> extends PromiseLike<infer U>
    ? U
    : unknown,
  oldLang: string

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/A/Apple/assets/logo.png',
  LogoRainbow = 'https://cdn.rcd.gg/PreMiD/websites/A/Apple/assets/0.png',
  AppleStore = 'https://cdn.rcd.gg/PreMiD/websites/A/Apple/assets/1.png',
  AppleSupport = 'https://cdn.rcd.gg/PreMiD/websites/A/Apple/assets/2.png',
  AppStore = 'https://cdn.rcd.gg/PreMiD/websites/A/Apple/assets/3.png',
  ICloud = 'https://cdn.rcd.gg/PreMiD/websites/A/Apple/assets/4.png',
  Keynote = 'https://cdn.rcd.gg/PreMiD/websites/A/Apple/assets/5.png',
  AppleCard = 'https://cdn.rcd.gg/PreMiD/websites/A/Apple/assets/6.png',
  AppleDeveloper = 'https://cdn.rcd.gg/PreMiD/websites/A/Apple/assets/7.png',
}

const assets: Record<string, string> = {
  icloud_calendar: 'https://cdn.rcd.gg/PreMiD/websites/A/Apple/assets/8.png',
  icloud_photos: 'https://cdn.rcd.gg/PreMiD/websites/A/Apple/assets/9.png',
  icloud_mail: 'https://cdn.rcd.gg/PreMiD/websites/A/Apple/assets/10.png',
  icloud_contacts: 'https://cdn.rcd.gg/PreMiD/websites/A/Apple/assets/11.png',
  icloud_notes: 'https://cdn.rcd.gg/PreMiD/websites/A/Apple/assets/12.png',
  icloud_find: 'https://cdn.rcd.gg/PreMiD/websites/A/Apple/assets/13.png',
  icloud_pages: 'https://cdn.rcd.gg/PreMiD/websites/A/Apple/assets/14.png',
  icloud_keynote: 'https://cdn.rcd.gg/PreMiD/websites/A/Apple/assets/5.png',
  icloud_reminders: 'https://cdn.rcd.gg/PreMiD/websites/A/Apple/assets/15.png',
  icloud_numbers: 'https://cdn.rcd.gg/PreMiD/websites/A/Apple/assets/16.png',
}

presence.on('UpdateData', async () => {
  const urlpath = window.location.pathname.toLowerCase().split('/')
  const [
    newLang,
    timeElapsed,
    buttons,
    logo,
    devProfileBtn,
    showICloudMailSender,
    showICloudMailSubject,
  ] = await Promise.all([
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('timeElapsed'),
    presence.getSetting<boolean>('showButtons'),
    presence.getSetting<number>('logo'),
    presence.getSetting<boolean>('devProfileBtn'),
    presence.getSetting<boolean>('iCloudMailSender'),
    presence.getSetting<boolean>('iCloudMailSubject'),
  ])
  const products = [
    'ipad',
    'ipad-air',
    'ipad-pro',
    'ipad-10.2',
    'ipad-mini',
    'apple-pencil',
    'ipad-keyboards',
    'airpods',
    'iphone',
    'iphone-13-pro',
    'iphone-13',
    'iphone-12',
    'iphone-se',
    'airtag',
    'mac',
    'macbook-air',
    'macbook-pro-13',
    'macbook-pro-14-and-16',
    'imac-24',
    'imac-27',
    'mac-pro',
    'mac-mini',
    'pro-display-xdr',
    'watch',
    'apple-watch-series-7',
    'apple-watch-se',
    'apple-watch-series-3',
    'apple-watch-nike',
    'apple-watch-hermes',
    'airpods',
    'airpods-pro',
    'airpods-max',
    'airpods-2nd-generation',
    'airpods-3rd-generation',
    'homepod-mini',
    'ipod-touch',
    'apple-tv-4k',
  ]
  const services = [
    'apple-fitness-plus',
    'tv',
    'apple-tv-plus',
    'airplay',
    'apple-tv-app',
    'apple-arcade',
    'icloud',
    'apple-news',
    'apple-one',
    'apple-card',
    'apple-books',
    'app-store',
    'music',
    'apple-music',
    'maps',
  ]
  const presenceData: PresenceData = {
    largeImageKey: [ActivityAssets.Logo, ActivityAssets.LogoRainbow][logo] || ActivityAssets.Logo,
  }

  if (!oldLang || oldLang !== newLang) {
    oldLang = newLang
    strings = await getStrings()
  }

  function getPSName() {
    return (
      document.querySelector('div.ac-ln-title>a')?.textContent
      || document.title
        .replace(' - Apple - Apple', '')
        .replace(' - Apple', '')
        .replace(/ *\([^)]*\) */g, '')
    )
  }

  if (
    urlpath[1] !== 'shop'
    && urlpath[2] !== 'shop'
    && window.location.hostname === 'www.apple.com'
  ) {
    if (urlpath.length === 2 || urlpath.length === 3) {
      presenceData.details = 'Home'
    }
    else if (products.find(e => urlpath.includes(e))) {
      if (urlpath.includes('compare')) {
        presenceData.details = strings.comparing
        presenceData.state = document.title
          .split('-')[0]
          ?.replace(/ *\([^)]*\) */g, '')
      }
      else {
        presenceData.details = strings.viewProduct
        presenceData.state = getPSName()
      }

      if (buttons) {
        presenceData.buttons = [
          {
            label: strings.btnViewProduct,
            url: window.location.href,
          },
        ]
      }
    }
    else if (services.find(e => urlpath.includes(e))) {
      presenceData.details = strings.viewService
      presenceData.state = getPSName()

      if (buttons) {
        presenceData.buttons = [
          {
            label: strings.btnViewService,
            url: window.location.href,
          },
        ]
      }
    }
    else if (urlpath.includes('newsroom')) {
      presenceData.details = 'Newsroom'

      if (urlpath.includes('topics')) {
        presenceData.state = document
          .querySelector('h1.section-head')
          ?.getAttribute('aria-label')
      }
      else {
        presenceData.state = document.querySelector('.hero-headline')?.textContent

        if (buttons) {
          presenceData.buttons = [
            {
              label: strings.btnReadArticle,
              url: window.location.href,
            },
          ]
        }
      }
    }
    else if (urlpath.includes('today')) {
      presenceData.details = 'Today at Apple'

      if (urlpath.includes('feature')) {
        presenceData.state = document.querySelector('h1.editorial-page__header-headline')
          ?.textContent || 'Unknown'

        if (buttons) {
          presenceData.buttons = [
            {
              label: strings.btnReadArticle,
              url: window.location.href,
            },
          ]
        }
      }
      else if (urlpath.includes('event')) {
        presenceData.state = document.querySelector('h1.typography-headline-elevated')
          ?.textContent
          || document.querySelector('h1.typography-headline-reduced')
            ?.textContent
            || 'Unknown'

        if (buttons) {
          presenceData.buttons = [
            {
              label: strings.btnViewEvent,
              url: window.location.href,
            },
          ]
        }
      }
      else if (document.querySelector('h1.typography-headline-elevated')) {
        presenceData.state = document.querySelector('h1.typography-headline-elevated')
          ?.textContent
          || document.querySelector('h1.typography-headline-reduced')
            ?.textContent
            || 'Unknown'

        if (buttons) {
          presenceData.buttons = [
            {
              label: strings.btnReadArticle,
              url: window.location.href,
            },
          ]
        }
      }
    }
    else if (urlpath.includes('healthcare')) {
      presenceData.details = strings.healthcare

      if (urlpath.includes('apple-watch'))
        presenceData.state = 'Apple Watch'
      else if (urlpath.includes('products-platform'))
        presenceData.state = strings.productsPlatform
      else if (urlpath.includes('health-records'))
        presenceData.state = strings.healthRecords
      else presenceData.state = strings.overview
    }
    else if (urlpath.includes('retail')) {
      if (urlpath.includes('instore-shopping-session'))
        presenceData.details = strings.purchasingAdvice
      else presenceData.details = strings.storeFinder
    }
    else if (
      urlpath.includes('ios')
      || urlpath.includes('watchos')
      || urlpath.includes('ipados')
      || urlpath.includes('macos')
    ) {
      const OS = document.querySelector('div.ac-ln-title>a')
        || document.querySelector(
          'h1.typography-hero-eyebrow.hero-eyebrow.hero-copy-item',
        )

      presenceData.details = strings.view
      presenceData.state = OS?.textContent || 'Unknown'

      if (buttons && OS) {
        presenceData.buttons = [
          {
            label: strings.btnViewOS
              .replace('{0}', OS.textContent?.replace('Preview', '') ?? '')
              .substring(0, 30),
            url: window.location.href,
          },
        ]
      }
    }
    else if (urlpath.includes('apple-events')) {
      const event = document.querySelector('h1.hero-headline.typography-headline')
        || document.querySelector('p.hero-subhead.typography-quote-reduced')

      presenceData.details = event ? `${strings.viewEvent}:` : 'Apple Events'
      if (event)
        presenceData.state = event.textContent

      if (buttons && event) {
        presenceData.buttons = [
          {
            label: strings.btnViewEvent,
            url: window.location.href,
          },
        ]
      }
    }
    else if (urlpath.includes('store-opening-letter')) {
      presenceData.details = 'Covid‑19 store information'
    }
    else if (urlpath.includes('trade-in')) {
      presenceData.details = 'Apple Trade In'
    }
    else if (urlpath.includes('supplier-responsibility')) {
      presenceData.details = strings.supplierResp
    }
    else if (urlpath.includes('contact')) {
      presenceData.details = strings.contact
    }
    else if (urlpath.includes('choose-country-region')) {
      presenceData.details = strings.chooseLang
    }
    else {
      presenceData.details = strings.other
    }
  }
  else if (
    (urlpath[1] === 'shop' || urlpath[2] === 'shop')
    && window.location.hostname === 'www.apple.com'
  ) {
    const num = urlpath[1] === 'shop' ? 2 : 3

    presenceData.largeImageKey = ActivityAssets.AppleStore

    if (!urlpath[num]) {
      presenceData.details = 'Shop'
      presenceData.state = 'Home'
    }
    else if (urlpath[num].startsWith('buy-')) {
      const product = document.querySelector('span.as-chiclets-text')?.textContent
        || document.querySelector('a.localnav-title.localnav-title-image')
          ?.textContent
          || document.querySelector('a.localnav-title')?.textContent

      presenceData.details = strings.viewProduct
      presenceData.state = product

      if (buttons) {
        presenceData.buttons = [
          {
            label: strings.btnViewProduct,
            url: `https://www.apple.com/shop/${urlpath[num]}/${
              urlpath[num + 1]
            }`,
          },
        ]
      }
    }
    else if (urlpath[num] === 'product') {
      presenceData.details = strings.viewProduct
      presenceData.state = document.querySelector('h1.rf-pdp-title')?.textContent

      if (buttons) {
        presenceData.buttons = [
          {
            label: strings.btnViewProduct,
            url: window.location.href,
          },
        ]
      }
    }
    else if (urlpath[num] === 'watch') {
      presenceData.details = 'Shop'

      if (urlpath[num + 1] === 'bands')
        presenceData.state = strings.shopBands
      else if (urlpath[num + 1] === 'accessories')
        presenceData.state = strings.shopAccessories
    }
    else if (urlpath[num + 1] === 'accessories') {
      presenceData.details = 'Shop'
      presenceData.state = document.querySelector('a.localnav-title')?.textContent
    }
    else {
      switch (urlpath[num]) {
        case 'studio': {
          const product = document
            .querySelector('div.as-designstudio-title>a>img')
            ?.getAttribute('alt')

          presenceData.details = strings.shopStudio
          presenceData.state = product

          if (buttons) {
            presenceData.buttons = [
              {
                label: strings.btnViewStudio.replace('{0}', product ?? ''),
                url: `https://www.apple.com/shop/studio/${urlpath[num + 1]}`,
              },
            ]
          }

          break
        }
        case 'favorites': {
          presenceData.details = 'Shop'
          presenceData.state = strings.shopFavorites

          break
        }
        case 'account': {
          presenceData.details = 'Shop'
          presenceData.state = 'Account'

          break
        }
        case 'accessories': {
          presenceData.details = 'Shop'
          presenceData.state = strings.shopAccessories

          break
        }
        case 'gift-cards': {
          presenceData.details = 'Shop'
          presenceData.state = strings.shopGiftCards

          break
        }
        default:
          if (
            urlpath[num] === 'browse'
            && urlpath[num + 2] === 'plan_your_visit'
          ) {
            presenceData.details = 'Shop'
            presenceData.state = strings.shopPlanVisit
          }
          else if (urlpath[num] === 'refurbished') {
            presenceData.details = 'Shop'
            presenceData.state = strings.shopRefurbished
          }
          else if (urlpath[num] === 'bag') {
            let summary = document.querySelector(
              'div.rs-summary-value',
            )?.textContent

            const perMonth = document.querySelector(
              'div.rs-summary-value span.nowrap span.visuallyhidden',
            )

            if (!summary) {
              summary = '$0'
            }
            else {
              summary = summary.replace(
                document.querySelector(
                  'div.rs-summary-value span.nowrap span[aria-hidden=\'true\']',
                )?.textContent ?? '/mo.',
                '',
              )

              if (perMonth) {
                summary = summary.replace(
                  perMonth.textContent ?? '',
                  ` ${perMonth.textContent}`,
                )
              }
            }

            presenceData.details = strings.shopBag
            presenceData.state = strings.shopBagSummary.replace('{0}', summary)
          }
          else {
            presenceData.details = 'Shop'
            presenceData.state = strings.other
          }
      }
    }
  }
  else {
    switch (window.location.hostname) {
      case 'support.apple.com':
      case 'getsupport.apple.com': {
        const sProducts = [
          'iphone',
          'mac',
          'ipad',
          'watch',
          'airpods',
          'music',
          'tv',
          'displays',
        ]

        presenceData.largeImageKey = ActivityAssets.AppleSupport

        if (sProducts.find(e => urlpath.includes(e))) {
          presenceData.details = strings.support
          presenceData.state = document.querySelector('h1.pageTitle-heading')?.textContent
            || document.querySelector('h1#main-title')?.textContent
            || 'Unknown'

          if (buttons) {
            presenceData.buttons = [
              {
                label: strings.btnReadArticle,
                url: window.location.href,
              },
            ]
          }
        }
        else if (document.querySelector('div.mod-date')) {
          presenceData.details = strings.supportArticle
          presenceData.state = document.querySelector('h1#howto-title')?.textContent || 'Unknown'

          if (buttons) {
            presenceData.buttons = [
              {
                label: strings.btnReadArticle,
                url: window.location.href,
              },
            ]
          }
        }
        else if (window.location.hostname === 'getsupport.apple.com') {
          presenceData.details = strings.support
        }
        else {
          presenceData.details = strings.support
          presenceData.state = 'Home'
        }

        break
      }
      case 'apps.apple.com': {
        presenceData.largeImageKey = ActivityAssets.AppStore

        if (urlpath.includes('app')) {
          if (document.querySelector('p.we-connecting__instructions')) {
            presenceData.details = 'App Store'
            presenceData.state = strings.appStoreCon
          }
          else {
            presenceData.details = 'App Store - App:'
            presenceData.state = document
              .querySelector('h1.product-header__title.app-header__title')
              ?.childNodes[1]
              ?.textContent
              ?.trim() ?? 'Unknown'
          }

          if (buttons) {
            presenceData.buttons = [
              {
                label: strings.btnViewApp,
                url: window.location.href,
              },
            ]
          }
        }
        else if (urlpath.includes('developer')) {
          if (document.querySelector('p.we-connecting__instructions')) {
            presenceData.details = 'App Store'
            presenceData.state = strings.appStoreCon
          }
          else {
            presenceData.details = 'App Store - Developer:'
            presenceData.state = document.querySelector(
              'h1.page-header__title',
            )?.textContent
          }

          if (buttons) {
            presenceData.buttons = [
              {
                label: strings.btnViewDeveloper,
                url: window.location.href,
              },
            ]
          }
        }

        break
      }
      case 'www.icloud.com': {
        presenceData.largeImageKey = ActivityAssets.ICloud
        presenceData.details = 'iCloud'

        if (!urlpath[1]) {
          presenceData.state = 'Launchpad'
        }
        else {
          if (urlpath[1] !== 'iclouddrive') {
            presenceData.largeImageKey = assets[`icloud_${urlpath[1]}`]
            presenceData.smallImageKey = ActivityAssets.ICloud
          }

          switch (urlpath[1]) {
            case 'mail': {
              presenceData.state = strings.iCloudMail

              if (iframeData) {
                presenceData.details = `iCloud - ${strings.iCloudMail}`
                presenceData.state = iframeData.currentMailbox

                if (iframeData.currentMailSubject) {
                  presenceData.details = `iCloud - ${strings.iCloudMail} - ${iframeData.currentMailbox}`

                  let state = showICloudMailSubject
                    ? iframeData.currentMailSubject
                    : ''

                  if (iframeData.currentMailSender && showICloudMailSender) {
                    state = `${iframeData.currentMailSender}${
                      state !== '' ? `: ${state}` : ''
                    }`
                  }

                  presenceData.state = state
                }
              }
              break
            }
            case 'contacts': {
              presenceData.state = strings.iCloudContacts
              break
            }
            case 'calendar': {
              presenceData.state = strings.iCloudCalendar
              break
            }
            case 'photos': {
              presenceData.state = strings.iCloudPhotos
              break
            }
            case 'iclouddrive': {
              presenceData.state = 'Drive'
              break
            }
            case 'notes': {
              presenceData.state = strings.iCloudNotes
              break
            }
            case 'reminders': {
              presenceData.state = strings.iCloudReminders
              break
            }
            case 'pages': {
              if (urlpath[2]) {
                presenceData.details = 'iCloud Pages'

                if (urlpath[2] === 'create') {
                  presenceData.state = strings.iCloudPagesCreate
                }
                else {
                  presenceData.state = document.querySelector(
                    'div.sc-view.iw-document-status-name-label.iw-ellipsis.sc-static-layout',
                  )?.textContent
                }
              }
              else {
                presenceData.state = 'Pages'
              }

              break
            }
            case 'numbers': {
              presenceData.state = 'Numbers'
              break
            }
            case 'keynote': {
              if (urlpath[2]) {
                presenceData.details = 'iCloud Keynote'

                if (urlpath[2] === 'create') {
                  presenceData.state = strings.iCloudPagesCreate
                }
                else {
                  presenceData.state = document.querySelector(
                    'div.sc-view.iw-document-status-name-label.iw-ellipsis.sc-static-layout',
                  )?.textContent
                }
              }
              else {
                presenceData.state = 'Keynote'
              }

              break
            }
            default:
              if (urlpath[1] === 'keynote-live' && urlpath[2]) {
                presenceData.details = 'iCloud Keynote Live'
                presenceData.largeImageKey = ActivityAssets.Keynote

                if (document.querySelector('iframe')?.style.display === 'none')
                  presenceData.state = strings.iCloudKeynoteWait
              }
              else if (urlpath[1] === 'fmf') {
                presenceData.state = 'Find My Friends'
              }
              else if (urlpath[1] === 'find') {
                presenceData.state = 'Find My'
              }
          }
        }

        break
      }
      case 'card.apple.com': {
        presenceData.largeImageKey = ActivityAssets.AppleCard
        presenceData.details = 'Apple Card'

        if (!urlpath[1])
          presenceData.state = 'Home'
        else if (urlpath[1] === 'apply')
          presenceData.state = 'Apply'

        break
      }
      case 'developer.apple.com': {
        const dPages = [
          'discover',
          'develop',
          'distribute',
          'support',
          'account',
          'download',
          'bug-reporting',
          'sf-symbols',
          'contact',
          'localization',
          'accessories',
          'licensing-trademarks',
          'system-status',
          'widgets',
        ]
        const cpage = document.querySelector('body')?.id
          || document.querySelector('body')?.classList[0]?.replace('nav-', '')

        presenceData.largeImageKey = ActivityAssets.AppleDeveloper
        presenceData.details = 'Apple Developer'
        presenceData.state = 'Home'

        if (dPages.find(e => urlpath[1] === e)) {
          presenceData.state = document.querySelector(`a.ac-gn-link.ac-gn-link-${cpage}>span`)
            ?.textContent
            || document.querySelector('section.section-hero>h1.section-headline')
              ?.textContent
              || document.querySelector('h2.localnav-title>a')?.textContent
              || 'Unknown'
        }
        else if (urlpath[1] === 'custom-apps') {
          presenceData.state = document.querySelector('h2.localnav-title>a')?.textContent
            || document.querySelector('h1.typography-headline')?.textContent
            || 'Unknown'
        }
        else if (urlpath[1]?.startsWith('wwdc')) {
          const wwdc = document
            .querySelector('a.ac-ln-title-logo>img')
            ?.getAttribute('alt')
          presenceData.state = wwdc || 'Unknown'

          if (urlpath[2]) {
            presenceData.details = wwdc
            presenceData.state = document.querySelector('span.localnav-menu-link.current')
              ?.textContent
              || document.querySelector('h1.typography-headline')?.textContent
              || 'Unknown'
          }

          if (buttons && wwdc) {
            presenceData.buttons = [
              {
                label: strings.btnViewWWDC.replace('{0}', wwdc),
                url: `https://developer.apple.com/${wwdc.toLowerCase()}/`,
              },
            ]
          }
        }
        else {
          switch (urlpath[1]) {
            case 'enroll': {
              presenceData.details = 'Developer Program'
              if (urlpath[2] === 'purchase')
                presenceData.state = 'Enrollment'

              break
            }
            case 'ios':
            case 'ipados':
            case 'tvos':
            case 'watchos':
            case 'macos':
            case 'mac-catalyst':
            case 'xcode':
            case 'swift':
            case 'swift-playgrounds':
            case 'app-clips': {
              presenceData.details = document.querySelector('h2.localnav-title>a')?.textContent
                || 'Apple Developer'

              if (!urlpath[2]) {
                presenceData.state = strings.overview
              }
              else if (urlpath[2] === 'whats-new') {
                presenceData.state = strings.devNew
              }
              else if (urlpath[2] === 'submit') {
                presenceData.state = strings.devSubmit
              }
              else if (
                urlpath[1] === 'macos'
                && urlpath[2] === 'iphone-and-ipad-apps'
              ) {
                presenceData.state = strings.devPhonePad
              }
              else if (urlpath[1] === 'macos' && urlpath[2] === 'distribution') {
                presenceData.state = strings.devDistribution
              }
              else if (urlpath[1] === 'watchos' && urlpath[2] === 'features') {
                presenceData.state = strings.devFeatures
              }
              else {
                presenceData.state = document.querySelector('h1.typography-headline')
                  ?.textContent || 'Other'
              }

              break
            }
            case 'documentation': {
              const page = document.querySelector('span.current.item')

              presenceData.details = strings.devDocs
              presenceData.state = page?.textContent || 'Home'

              if (buttons && page) {
                presenceData.buttons = [
                  {
                    label: strings.btnViewPage,
                    url: window.location.href,
                  },
                ]
              }

              break
            }
            case 'design': {
              presenceData.details = 'Design'

              if (!urlpath[2]) {
                presenceData.state = 'Overview'
              }
              else {
                switch (urlpath[2]) {
                  case 'whats-new': {
                    presenceData.state = strings.devNew
                    break
                  }
                  case 'human-interface-guidelines': {
                    presenceData.state = strings.devHIG
                    break
                  }
                  case 'resources': {
                    presenceData.state = strings.devResources
                    break
                  }
                  default: {
                    presenceData.state = document.querySelector('h1.typography-headline')
                      ?.textContent || 'Other'
                  }
                }
              }

              break
            }
            case 'safari':
            case 'app-store-connect':
            case 'business':
            case 'app-store':
            case 'education':
            case 'classkit':
            case 'programs': {
              presenceData.details = document.querySelector('h2.localnav-title>a')?.textContent
                || 'Apple Developer'
              presenceData.state = document.querySelector(`a.localnav-menu-link.link-${cpage}`)
                ?.textContent
                || document.querySelector('span.localnav-menu-link.current')
                  ?.textContent
                  || document.querySelector('a.localnav-menu-link.current')
                    ?.textContent
                    || 'Other'

              break
            }
            case 'testflight': {
              presenceData.state = 'Testflight'
              break
            }
            case 'games': {
              presenceData.state = strings.devGames
              break
            }
            case 'forums': {
              presenceData.details = 'Forum'

              if (urlpath[2] === 'thread') {
                presenceData.details = 'Forum - Thread'
                presenceData.state = document.querySelector('div.header>h1.title')?.textContent
                  || 'Unknown'

                presenceData.buttons = [
                  {
                    label: strings.btnViewThread,
                    url: window.location.href,
                  },
                ]
              }
              else if (urlpath[2] === 'tags') {
                presenceData.details = strings.forumTags
                presenceData.state = document.querySelector('div.tag-content>h2.tag-title')
                  ?.textContent || 'Unknown'

                presenceData.buttons = [
                  {
                    label: strings.btnViewTags,
                    url: window.location.href,
                  },
                ]
              }
              else if (urlpath[2] === 'profile' && urlpath[3]) {
                const nickname = document.querySelector(
                  'div.user-name>h2.user-nickname',
                )?.textContent

                presenceData.details = strings.viewProfile

                if (urlpath[3] === 'preferences') {
                  presenceData.state = strings.forumPreferences
                }
                else {
                  presenceData.state = nickname || 'Unknown'

                  if (nickname) {
                    presenceData.buttons = [
                      {
                        label: strings.btnViewProfile.replace('{0}', nickname),
                        url: window.location.href,
                      },
                    ]
                  }
                }
              }
              else if (urlpath[2] === 'create') {
                presenceData.state = strings.forumCreateThread
              }
              else if (urlpath[2] === 'register') {
                presenceData.state = strings.forumRegister
              }

              if (
                buttons
                && devProfileBtn
                && document.querySelector<HTMLAnchorElement>(
                  'li.menu-item>a.menu-item-link',
                )?.href !== 'https://developer.apple.com/forums/login'
              ) {
                presenceData.buttons = [
                  {
                    label: strings.btnGViewProfile,
                    url: document.querySelector<HTMLAnchorElement>(
                      'a.view-profile-link',
                    )?.href
                    || `https://developer.apple.com/forums/profile/${
                      document.querySelector('span.user-name')?.textContent
                    }`,
                  },
                ]
              }

              break
            }
            case 'videos': {
              presenceData.details = strings.devVideos

              if (
                urlpath[2] === 'featured'
                || urlpath[2] === 'design'
                || urlpath[2] === 'developer-tools'
                || urlpath[2] === 'frameworks'
                || urlpath[2] === 'graphics-and-games'
                || urlpath[2] === 'media'
                || urlpath[2] === 'app-store-and-distribution'
                || urlpath[2] === 'all-videos'
              ) {
                presenceData.details = strings.devVidTopic
                presenceData.state = document.querySelector(
                  'section.inline-block>h1.collection-title',
                )?.textContent
                || document.title.replace(' - Videos - Apple Developer', '')
                || 'Other'
              }
              else if (urlpath[2] === 'play') {
                const vid = document.querySelector<HTMLVideoElement>('video#video')

                presenceData.state = document.querySelector(
                  'li.supplement.details>h1',
                )?.textContent

                if (vid) {
                  [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(vid.currentTime, vid.duration)

                  if (!vid.paused) {
                    presenceData.smallImageKey = Assets.Play
                    presenceData.smallImageText = strings.statePlaying
                  }
                  else {
                    delete presenceData.endTimestamp
                    presenceData.smallImageKey = Assets.Pause
                    presenceData.smallImageText = strings.statePaused
                  }
                }

                if (buttons) {
                  presenceData.buttons = [
                    {
                      label: strings.btnGWatchVideo,
                      url: window.location.href,
                    },
                  ]
                }
              }
              else {
                presenceData.state = document.querySelector(
                  'section.inline-block>h1.collection-title',
                )?.textContent
                || document.querySelector('span.localnav-menu-link.current')
                  ?.textContent
                  || 'Other'
              }

              break
            }
            case 'news': {
              presenceData.details = strings.devNews

              if (urlpath[2] === 'releases')
                presenceData.state = strings.devReleases

              if (new URLSearchParams(window.location.search).get('id')) {
                presenceData.state = document.querySelector('h2.article-title')?.textContent

                if (buttons) {
                  presenceData.buttons = [
                    {
                      label: strings.btnReadArticle,
                      url: window.location.href,
                    },
                  ]
                }
              }

              break
            }
            case 'shareplay': {
              presenceData.state = 'SharePlay'
              break
            }
          }
        }

        break
      }
    }
  }

  if (
    timeElapsed
    && !window.location.href.startsWith('https://developer.apple.com/videos/play')
  ) {
    presenceData.startTimestamp = time
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})

presence.on('iFrameData', (data: unknown) => {
  iframeData = data as { [key: string]: string }
})
