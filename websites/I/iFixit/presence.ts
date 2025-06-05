import { Assets } from 'premid'
import {
  fetchGuideMetadata,
  guideMetadata,
} from './functions/fetchGuideMetadata.js'
import { getClosestStep } from './functions/getClosestStep.js'

const presence = new Presence({
  clientId: '1323729326696566835',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum PresenceImages {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/I/iFixit/assets/logo.png',
}

enum Icons {
  very_easy = 'https://cdn.rcd.gg/PreMiD/websites/I/iFixit/assets/0.png',
  easy = 'https://cdn.rcd.gg/PreMiD/websites/I/iFixit/assets/1.png',
  moderate = 'https://cdn.rcd.gg/PreMiD/websites/I/iFixit/assets/2.png',
  difficult = 'https://cdn.rcd.gg/PreMiD/websites/I/iFixit/assets/3.png',
  Time = 'https://cdn.rcd.gg/PreMiD/websites/I/iFixit/assets/4.png',
  Answered = 'https://cdn.rcd.gg/PreMiD/websites/I/iFixit/assets/5.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    startTimestamp: browsingTimestamp,
  }
  const [thumbnailType, iconType, showStepTitle, privacy] = await Promise.all([
    presence.getSetting<number>('thumbnailType'),
    presence.getSetting<number>('iconType'),
    presence.getSetting<boolean>('showStepTitle'),
    presence.getSetting<boolean>('privacy'),
  ])
  const { pathname, search, href } = document.location
  const searchParams = new URLSearchParams(search)
  const path = pathname.split('/').filter(x => x)
  const strings = await presence.getStrings({
    viewHome: 'general.viewHome',
    search: 'general.search',
    searchFor: 'general.searchFor',
    followGuide: 'ifixit.followGuide',
    aOutOfB: 'ifixit.aOutOfB',
    buttonViewGuide: 'ifixit.buttonViewGuide',
    buttonViewDevice: 'ifixit.buttonViewDevice',
    browsingGuides: 'ifixit.browsingGuides',
    browsing: 'general.browsing',
    troubleshooting: 'ifixit.troubleshooting',
    buttonViewTroubleshooting: 'ifixit.buttonViewTroubleshooting',
    viewQuestion: 'ifixit.viewQuestion',
    viewQuestionAuthor: 'ifixit.viewQuestionAuthor',
    noAnswers: 'ifixit.noAnswers',
    answered: 'ifixit.answered',
    notAnswered: 'ifixitt.notAnswered',
    buttonViewQuestion: 'ifixit.buttonViewQuestion',
    askQuestion: 'ifixit.askQuestion',
    forums: 'general.forums',
    store: 'general.store',
    viewProduct: 'general.viewProduct',
    viewAProduct: 'general.viewAProduct',
    buttonViewProduct: 'general.viewProduct',
    devices: 'ifixit.devices',
    editWikiArticle: 'ifixit.editWiki',
    reviewWikiHistory: 'ifixit.reviewWikiHistory',
    readWikiArticle: 'ifixit.readWikiArticle',
    buttonReadArticle: 'general.buttonReadArticle',
    browseNews: 'ifixit.browseNews',
    browseNewsCategories: 'ifixit.browseNewsCategories',
    browseNewsCategory: 'ifixit.browseNewsCategory',
    readAnArticle: 'general.readingAnArticle',
    viewProfile: 'general.viewProfile',
    buttonViewProfile: 'general.buttonViewProfile',
    viewTeam: 'ifixit.viewTeam',
    buttonViewTeam: 'ifixit.buttonViewTeam',
  })

  if (/^[a-z]{2}-[a-z]{2}$/.test(path[0] ?? '')) {
    path.shift()
  }

  switch (path[0]) {
    case '': {
      presenceData.details = strings.viewHome
      break
    }
    case 'Search': {
      presenceData.details = privacy ? strings.search : strings.searchFor
      if (!privacy) {
        presenceData.state = searchParams.get('query')
        presenceData.smallImageKey = Assets.Search
        presenceData.smallImageText = strings.search
      }
      break
    }
    case 'Teardown':
    case 'Guide': {
      if (path[2]) {
        await fetchGuideMetadata(path[2])

        if (guideMetadata?.data) {
          const { data } = guideMetadata
          const { title, category: device, steps, image } = data
          const closestStep = getClosestStep()

          presenceData.details = privacy ? strings.followGuide : device
          if (!privacy) {
            if (closestStep) {
              const { stepLink, stepImage, stepNumber, stepTitle } = closestStep

              presenceData.state = `${title.replaceAll(device, '')} - ${
                showStepTitle
                  ? `${stepTitle} (${stepNumber?.replace(/\D/g, '')}/${
                    steps.length
                  }) `
                  : strings.aOutOfB
                      .replace('{0}', `${stepNumber}`)
                      .replace('{1}', `${steps.length}`)
              }`
              presenceData.largeImageKey
              = thumbnailType === 1 ? image.standard : stepImage
              presenceData.smallImageKey
              = iconType === 1
                  ? Icons.Time
                  : Icons[
                    `${document
                      .querySelector('.guide-difficulty')
                      ?.textContent
                      ?.replaceAll(' ', '')
                      .toLowerCase()}` as keyof typeof Icons
                  ]
              presenceData.smallImageText
              = iconType === 1
                  ? document.querySelector('.guide-time-required')?.textContent
                  : document.querySelector('.guide-difficulty')?.textContent
              presenceData.buttons = [
                {
                  label: strings.buttonViewGuide,
                  url: stepLink,
                },
                {
                  label: strings.buttonViewDevice,
                  url: document.querySelector<HTMLAnchorElement>(
                    'nav[itemprop=breadcrumb] li:first-child a',
                  ),
                },
              ]
            }
            else {
              presenceData.state = title.replaceAll(device, '')
            }
          }
          break
        }
      }
      presenceData.details = strings.browsingGuides
      break
    }
    case 'Device': {
      const deviceDetails = privacy
        ? strings.devices
        : decodeURIComponent(
            pathname.replace('/Device/', '').replaceAll('_', ' '),
          )
      presenceData.details = strings.browsing
      presenceData.state = deviceDetails
      if (!privacy) {
        presenceData.largeImageKey = thumbnailType
          ? document.querySelector<HTMLImageElement>('.banner-small-photo img')
          : PresenceImages.Logo
        presenceData.buttons = [
          {
            label: strings.buttonViewDevice,
            url: href,
          },
        ]
      }
      break
    }
    case 'Troubleshooting': {
      if (path[2]) {
        presenceData.state = path[2].replaceAll('+', ' ')
        presenceData.details = privacy
          ? strings.troubleshooting
          : `${strings.troubleshooting}: ${path[1]?.replaceAll('_', ' ')}`
        if (!privacy) {
          const steps = document.querySelectorAll<HTMLAnchorElement>(
            '.summary nav a[href^="#Section"]',
          )
          const activeStepClasses = new Set<string>()
          let activeStep: HTMLAnchorElement | null = null
          for (const step of steps) {
            if (activeStepClasses.has(step.className)) {
              continue
            }
            activeStepClasses.add(step.className)
            activeStep = step
          }
          if (showStepTitle) {
            presenceData.state += ` - ${
              activeStep?.querySelector('span')?.textContent
                ? `${activeStep?.querySelector('span')?.textContent} ${strings.aOutOfB
                  .replace(
                    '{0}',
                    `${activeStep.querySelector('div')?.textContent ?? 1}`,
                  )
                  .replace('{1}', `${steps.length || 1}`)}`
                : strings.aOutOfB
                    .replace(
                      '{0}',
                      `${activeStep?.querySelector('div')?.textContent ?? 1}`,
                    )
                    .replace('{1}', `${steps.length || 1}`)
            }`
          }
          if (thumbnailType) {
            presenceData.largeImageKey
              = document.querySelector<HTMLImageElement>(
                '[data-testid*=\'troubleshooting-header\'] img',
              )
          }
          presenceData.buttons = [
            {
              label: strings.buttonViewTroubleshooting,
              url: `${activeStep?.href ?? href}`,
            },
          ]
        }
      }
      break
    }

    case 'Wiki': {
      switch (path[1]) {
        case 'Edit': {
          presenceData.details = strings.editWikiArticle
          if (!privacy) {
            presenceData.state = document.querySelector('h2')
          }
          break
        }
        case 'History': {
          presenceData.details = strings.reviewWikiHistory
          if (!privacy) {
            presenceData.state = document.querySelector(
              'nav[itemprop=breadcrumb] li:nth-child(2)',
            )
          }
          break
        }
        default: {
          presenceData.details = strings.readWikiArticle
          if (!privacy) {
            const mainTitle = document.querySelector('h1')?.textContent
            const activeSection = document.querySelector(
              '.toc > ul > li > a.scrolled',
            )
            const activeSubSection
              = activeSection?.parentElement?.querySelector('ul li a.scrolled')
            if (activeSection && activeSubSection) {
              presenceData.state = `${mainTitle}: ${activeSection.textContent} - ${activeSubSection.textContent}`
            }
            else {
              presenceData.state = mainTitle
            }
            if (thumbnailType) {
              presenceData.largeImageKey
                = document.querySelector<HTMLImageElement>(
                  '.banner-small-photo img',
                )
            }
            presenceData.buttons = [
              {
                label: strings.buttonReadArticle,
                url: href,
              },
            ]
          }
        }
      }
      break
    }
    case 'Stories':
    case 'Story':
    case 'News': {
      switch (path[1] ?? '/') {
        case 'all-posts':
        case '/': {
          presenceData.details = strings.browseNews
          break
        }
        case 'all-categories': {
          presenceData.details = strings.browseNewsCategories
          break
        }
        case 'category': {
          presenceData.details = strings.browseNewsCategory
          if (!privacy) {
            presenceData.state = document.querySelector('h1')
          }
          break
        }
        default: {
          if (path[2]) {
            presenceData.details = strings.readAnArticle
            if (!privacy) {
              presenceData.state = document.querySelector('h1')
              if (thumbnailType) {
                presenceData.largeImageKey
                  = document.querySelector<HTMLImageElement>('.header-image img')
              }
              presenceData.buttons = [
                { label: strings.buttonReadArticle, url: href },
              ]
            }
          }
        }
      }
      break
    }
    case 'User': {
      presenceData.details = strings.viewProfile
      if (!privacy) {
        const data = JSON.parse(
          document.querySelector<HTMLDivElement>('#content .react-component')
            ?.dataset
            .props ?? 'null',
        )
        presenceData.state = data?.sidebarData.userCardData.summaryData.name
        presenceData.buttons = [{ label: strings.buttonViewProfile, url: href }]
      }
      break
    }
    case 'Business':
    case 'Team': {
      presenceData.details = strings.viewTeam
      if (!privacy) {
        presenceData.state = document.querySelector('h1')
        if (thumbnailType) {
          presenceData.largeImageKey = document.querySelector<HTMLImageElement>(
            '.profile-avatar img',
          )
        }
        presenceData.buttons = [{ label: strings.buttonViewTeam, url: href }]
      }
      break
    }
    case 'Answers':
      switch (path[1]) {
        case 'View': {
          presenceData.details = privacy
            ? strings.viewQuestion
            : strings.viewQuestionAuthor.replace(
                '{0}',
                `${document.querySelector('.post-author-username')?.textContent}`,
              )
          if (!privacy) {
            presenceData.state = `${document.querySelector('.post-title')?.textContent} - ${
              document.querySelector('.post-answers-header h2')?.textContent
              ?? strings.noAnswers
            }`
            presenceData.largeImageKey = thumbnailType
              ? document.querySelector('.device-image')?.getAttribute('src')
              : PresenceImages.Logo
            presenceData.smallImageKey = document.querySelector('.fa-check')
              ? Icons.Answered
              : Assets.Question
            presenceData.smallImageText = document.querySelector('.fa-check')
              ? strings.answered
              : strings.notAnswered
            presenceData.buttons = [
              {
                label: strings.buttonViewQuestion,
                url: href,
              },
            ]
          }
          break
        }
        case 'Ask': {
          presenceData.details = strings.askQuestion
          if (!privacy) {
            presenceData.state = document.querySelector<HTMLInputElement>(
              '#questionTitle input',
            )?.value
          }
          if (thumbnailType) {
            presenceData.largeImageKey
              = document.querySelector<HTMLImageElement>('.css-fzd5vm img')
            presenceData.smallImageKey = Assets.Question
            presenceData.smallImageText = strings.askQuestion
          }
          break
        }
        default: {
          presenceData.details = strings.browsing
        }
      }
      break
    case 'Community': {
      presenceData.details = strings.browsing
      presenceData.state = strings.forums
      break
    }
    case 'Store': {
      presenceData.details = strings.browsing
      presenceData.state = strings.store
      break
    }
    case 'Parts':
    case 'Tools': {
      presenceData.details = privacy
        ? strings.viewAProduct
        : strings.viewProduct
      if (!privacy) {
        presenceData.state = `${path[1]?.replaceAll('_', ' ') ?? ''} ${path[0]}`
      }
      break
    }
    case 'products': {
      const image = document.querySelector(
        'div[data-testid*=\'product-gallery-desktop\'] img',
      )

      presenceData.details = privacy
        ? strings.viewAProduct
        : strings.viewProduct
      if (!privacy) {
        presenceData.state = image?.getAttribute('alt')
        presenceData.largeImageKey = thumbnailType
          ? image?.getAttribute('src')
          : PresenceImages.Logo
        presenceData.buttons = [
          {
            label: strings.buttonViewProduct,
            url: href,
          },
        ]
      }
      break
    }
    default: {
      presenceData.details = strings.browsing
    }
  }
  presence.setActivity(presenceData)
})
