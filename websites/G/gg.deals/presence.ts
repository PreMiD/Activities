const presence = new Presence({
  clientId: '1496546727749226606',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.imgur.com/pXWjFbw.jpeg',
}

const platformHomepages: Record<string, string> = {
  '/all/': 'Browsing all platforms',
  '/pc/': 'Browsing PC homepage',
  '/xbox/': 'Browsing Xbox homepage',
  '/playstation/': 'Browsing PlayStation homepage',
  '/nintendo/': 'Browsing Nintendo homepage',
}

const newsArticleRoutes = [
  '/deal/',
  '/bundle/',
  '/freebie/',
  '/blog/',
  '/subscription-news/',
  '/new-game/',
  '/pre-order/',
  '/giveaway/',
  '/announcement/',
  '/gaming-news/',
]

function getLargestGameImage(): string | undefined {
  const gameImage = document.querySelector<HTMLImageElement>('img.image-game')
  return gameImage ? getLargestImageSource(gameImage) : undefined
}

function getLargestGiftCardImage(): string | undefined {
  const giftCardImages = Array.from(
    document.querySelectorAll<HTMLImageElement>('.game-info img, .game-header img, .game-heading img, img')
  )

  const giftCardImage = giftCardImages.find((image) => {
    const source = image.getAttribute('src')?.trim() || image.src
    const alt = image.alt?.trim() || ''
    const className = typeof image.className === 'string' ? image.className : ''

    if (!source) {
      return false
    }

    if (!alt) {
      return false
    }

    if (/loading|spinner|progress|placeholder|logo|avatar|author/i.test(`${source} ${className} ${alt}`)) {
      return false
    }

    return /gift card|wallet|steam|xbox|playstation|nintendo/i.test(alt)
  })

  if (!giftCardImage) {
    return undefined
  }

  return giftCardImage.getAttribute('src')?.trim() || giftCardImage.src || undefined
}

function getLargestImageSource(image: HTMLImageElement): string | undefined {
  const srcset = image.getAttribute('srcset')?.trim()

  if (srcset) {
    const largestCandidate = srcset
      .split(',')
      .map((candidate) => candidate.trim())
      .map((candidate) => {
        const [url, descriptor] = candidate.split(/\s+/)
        const size = Number.parseFloat(descriptor?.replace(/[wx]/, '') || '0')
        const priority = descriptor?.endsWith('x')
          ? size * 1000
          : size

        return { url, priority: Number.isNaN(priority) ? 0 : priority }
      })
      .filter((candidate) => candidate.url)
      .sort((left, right) => right.priority - left.priority)[0]

    if (largestCandidate?.url) {
      return largestCandidate.url
    }
  }

  return image.currentSrc || image.src || undefined
}

function getLargestNewsImage(): string | undefined {
  const articleImages = Array.from(
    document.querySelectorAll<HTMLImageElement>(
      '.news-heading-title img, article img, .text article img, .text img, img.img, main img'
    )
  )

  const eligibleImages = articleImages
    .filter((image, index, images) => images.indexOf(image) === index)
    .filter((image) => {
      if (image.closest('[class*="avatar"]')) {
        return false
      }

      const source = getLargestImageSource(image)
      if (!source) {
        return false
      }

      return !/logo|avatar|author/i.test(source)
    })
    .sort((left, right) => {
      const leftWidth = Math.max(left.naturalWidth, left.width, 0)
      const rightWidth = Math.max(right.naturalWidth, right.width, 0)
      return rightWidth - leftWidth
    })

  return eligibleImages[0] ? getLargestImageSource(eligibleImages[0]) : undefined
}

function getResultsCount(): string | undefined {
  const countText = document.querySelector('.search-results-counter .value')?.textContent?.trim()
  return countText?.match(/\d[\d,.]*/)?.[0]
}

function getPlatformLabel(pathname: string): string | undefined {
  if (pathname.includes('/pc/')) {
    return 'PC'
  }

  if (pathname.includes('/xbox/')) {
    return 'Xbox'
  }

  if (pathname.includes('/playstation/')) {
    return 'PlayStation'
  }

  if (pathname.includes('/nintendo/')) {
    return 'Nintendo'
  }

  return undefined
}

function getActiveCollectionFilters(): Record<string, string> {
  const selectors = {
    platform: '.content .filter.badge.with-icon.active.remove-filter.platform-filter .value',
    drm: '.content .filter.badge.with-icon.active.remove-filter.drm-filter .value',
    publisher: '.content .filter.badge.with-icon.active.remove-filter.publisher-filter .value',
    developer: '.content .filter.badge.with-icon.active.remove-filter.developer-filter .value',
    genre: '.content .filter.badge.with-icon.active.remove-filter.genre-filter .value',
    ageRating: '.content .filter.badge.with-icon.active.remove-filter.ageRating-filter .value',
    releaseDate: '.content .filter.badge.with-icon.active.remove-filter.releaseDate-filter .value',
    type: '.content .filter.badge.with-icon.active.remove-filter.type-filter .value',
  }

  const filters: Record<string, string> = {}

  for (const [type, selector] of Object.entries(selectors)) {
    const value = document.querySelector(selector)?.textContent?.trim()

    if (value) {
      filters[type] = value
    }
  }

  return filters
}

function getPluralType(type: string): string {
  switch (type.toLowerCase()) {
    case 'game':
      return 'games'
    case 'dlc':
      return 'DLC'
    case 'pack':
      return 'packs'
    case 'application':
      return 'applications'
    case 'subscription':
      return 'subscriptions'
    case 'ingame currency':
      return 'in-game currency'
    case 'gift card':
      return 'gift cards'
    default:
      return 'items'
  }
}

function extractTitleAndPlatform(rawTitle: string): { title: string, platform?: string } {
  const suffixes = [
    'Xbox Series & PC',
    'Nintendo Switch 2',
    'Nintendo Switch',
    'Xbox Series',
    'Xbox One',
    'PC key',
    'PS5',
    'PS4',
    'Xbox',
    'PC',
  ]

  for (const suffix of suffixes) {
    const suffixRegex = new RegExp(`\\s+(${suffix})(?:\\s+.*)?$`, 'i')
    const match = rawTitle.match(suffixRegex)

    if (match?.[1]) {
      const platform = match[1].replace(/\s+key$/i, '').trim()

      return {
        title: rawTitle.replace(suffixRegex, '').trim(),
        platform,
      }
    }
  }

  return { title: rawTitle.trim() }
}

function addPageButton(presenceData: PresenceData, label: string) {
  presenceData.buttons = [
    {
      label,
      url: window.location.href,
    },
  ]
}

function updatePresence() {
  const { pathname } = window.location
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  if (pathname.match(/\/game\/|\/gift-cards-group\/|\/gift-card\/|\/pack\/|\/dlc\/|\/franchise\//)) {
    const gameHeading = document.querySelector('.game-heading h1')
    if (gameHeading) {
      let title = gameHeading.textContent?.trim() || ''

      // Remove "Buy" from the beginning
      title = title.replace(/^Buy\s+/i, '')

      if (!pathname.includes('/franchise/')) {
        const parsedTitle = extractTitleAndPlatform(title)
        title = parsedTitle.title

        if (
          parsedTitle.platform &&
          (pathname.includes('/game/') || pathname.includes('/pack/') || pathname.includes('/dlc/'))
        ) {
          presenceData.state = `${title} on ${parsedTitle.platform}`
        }
      }

      if (pathname.includes('/game/')) {
        presenceData.details = 'Viewing game:'
      } else if (pathname.includes('/franchise/')) {
        presenceData.details = 'Viewing franchise:'
      } else if (pathname.includes('/pack/')) {
        presenceData.details = 'Viewing pack:'
      } else if (pathname.includes('/dlc/')) {
        presenceData.details = 'Viewing DLC:'
      } else if (pathname.includes('/gift-card/') || pathname.includes('/gift-cards-group/')) {
        presenceData.details = 'Viewing gift card:'
      } else {
        presenceData.details = 'Viewing:'
      }

      if (!presenceData.state) {
        presenceData.state = title
      }

      const largeGameImage = pathname.includes('/gift-card/')
        ? getLargestGiftCardImage()
        : getLargestGameImage()

      if (largeGameImage) {
        presenceData.largeImageKey = largeGameImage
        presenceData.smallImageKey = ActivityAssets.Logo
      }

      if (pathname.includes('/game/')) {
        addPageButton(presenceData, 'View Game')
      } else if (pathname.includes('/franchise/')) {
        addPageButton(presenceData, 'View Franchise')
      } else if (pathname.includes('/pack/')) {
        addPageButton(presenceData, 'View Pack')
      } else if (pathname.includes('/dlc/')) {
        addPageButton(presenceData, 'View DLC')
      } else if (pathname.includes('/gift-card/')) {
        addPageButton(presenceData, 'View Gift Card')
      } else if (pathname.includes('/gift-cards-group/')) {
        addPageButton(presenceData, 'View Gift Cards')
      }
    } else {
      presenceData.details = 'Browsing deals'
    }
  } else if (newsArticleRoutes.some((route) => pathname.includes(route))) {
    const articleHeading = document.querySelector('.news-heading-title h1')

    presenceData.details = 'Reading article:'

    if (articleHeading?.textContent?.trim()) {
      presenceData.state = articleHeading.textContent.trim()
    }

    const largeNewsImage = getLargestNewsImage()
    if (largeNewsImage) {
      presenceData.largeImageKey = largeNewsImage
      presenceData.smallImageKey = ActivityAssets.Logo
    }

    addPageButton(presenceData, 'Read Article')
  } else if (pathname.match(/\/ranking\/((pc|xbox|playstation|nintendo)\/)?[^/]+(\/[^/]+)?\/?$/)) {
    const rankingTitle = document.querySelector('h1.sm-side-padding.main-title')

    presenceData.details = 'Viewing ranking:'

    if (rankingTitle?.textContent?.trim()) {
      presenceData.state = rankingTitle.textContent.trim()
    }

    addPageButton(presenceData, 'View Ranking')
  } else if (platformHomepages[pathname]) {
    presenceData.details = platformHomepages[pathname]
  } else if (pathname.includes('/games/pc/')) {
    presenceData.details = 'Browsing PC games'
  } else if (pathname.includes('/games/xbox/')) {
    presenceData.details = 'Browsing Xbox games'
  } else if (pathname.includes('/games/playstation/')) {
    presenceData.details = 'Browsing PSN games'
  } else if (pathname.includes('/games/nintendo/')) {
    presenceData.details = 'Browsing Nintendo games'
  } else if (pathname.match(/\/games\/?$/)) {
    presenceData.details = 'Browsing all platforms'
  } else if (pathname.includes('/franchises/pc/')) {
    presenceData.details = 'Browsing PC franchises'
  } else if (pathname.includes('/franchises/xbox/')) {
    presenceData.details = 'Browsing Xbox franchises'
  } else if (pathname.includes('/franchises/playstation/')) {
    presenceData.details = 'Browsing PSN franchises'
  } else if (pathname.includes('/franchises/nintendo/')) {
    presenceData.details = 'Browsing Nintendo franchises'
  } else if (pathname.match(/\/franchises\/?$/)) {
    presenceData.details = 'Browsing all franchises'
  } else if (pathname.includes('/settings/')) {
    presenceData.details = 'Viewing user settings'
  } else if (pathname.includes('/wishlist/')) {
    presenceData.details = 'Viewing my wishlist'

    const wishlistCount = getResultsCount()
    if (wishlistCount) {
      presenceData.state = `${wishlistCount} wishlisted`
    }
  } else if (pathname.includes('/alerts/')) {
    presenceData.details = 'Viewing my alerts'

    const alertsCount = getResultsCount()
    if (alertsCount) {
      presenceData.state = `${alertsCount} alerts`
    }
  } else if (pathname.includes('/collection/')) {
    const filters = getActiveCollectionFilters()
    const platform = filters.platform || getPlatformLabel(pathname)
    const typeLabel = filters.type ? getPluralType(filters.type) : 'items'

    const primaryFilterType = ['releaseDate', 'genre', 'developer', 'publisher', 'drm', 'ageRating'].find(
      (type) => filters[type]
    )

    if (primaryFilterType) {
      const value = filters[primaryFilterType]

      if (primaryFilterType === 'releaseDate') {
        presenceData.details = platform
          ? `Viewing my ${platform} ${typeLabel} from ${value}`
          : `Viewing my ${typeLabel} from ${value}`
      } else {
        presenceData.details = platform
          ? `Viewing my ${value} ${typeLabel} on ${platform}`
          : `Viewing my ${value} ${typeLabel}`
      }
    } else {
      presenceData.details = platform ? `Viewing my ${platform} collection` : 'Viewing my collection'
    }

    const collectionCount = getResultsCount()
    if (collectionCount) {
      presenceData.state = `${collectionCount} ${typeLabel} in my collection`
    }
  } else if (pathname.includes('/news/pc/')) {
    presenceData.details = 'Browsing PC news'
  } else if (pathname.includes('/news/xbox/')) {
    presenceData.details = 'Browsing Xbox news'
  } else if (pathname.includes('/news/playstation/')) {
    presenceData.details = 'Browsing PSN news'
  } else if (pathname.includes('/news/nintendo/')) {
    presenceData.details = 'Browsing Nintendo news'
  } else if (pathname.includes('/news/')) {
    presenceData.details = 'Browsing all news'
  } else if (pathname.includes('/vouchers/pc/')) {
    presenceData.details = 'Browsing PC vouchers'
  } else if (pathname.includes('/vouchers/xbox/')) {
    presenceData.details = 'Browsing Xbox vouchers'
  } else if (pathname.includes('/vouchers/playstation/')) {
    presenceData.details = 'Browsing PSN vouchers'
  } else if (pathname.includes('/vouchers/nintendo/')) {
    presenceData.details = 'Browsing Nintendo vouchers'
  } else if (pathname.includes('/vouchers/')) {
    presenceData.details = 'Browsing all vouchers'
  } else if (pathname.includes('/rankings/pc/')) {
    presenceData.details = 'Browsing PC rankings'
  } else if (pathname.includes('/rankings/xbox/')) {
    presenceData.details = 'Browsing Xbox rankings'
  } else if (pathname.includes('/rankings/playstation/')) {
    presenceData.details = 'Browsing PSN rankings'
  } else if (pathname.includes('/rankings/nintendo/')) {
    presenceData.details = 'Browsing Nintendo rankings'
  } else if (pathname.includes('/rankings/')) {
    presenceData.details = 'Browsing all rankings'
  } else if (pathname.includes('/deals/pc/')) {
    presenceData.details = 'Browsing PC deals'
  } else if (pathname.includes('/deals/xbox/')) {
    presenceData.details = 'Browsing Xbox deals'
  } else if (pathname.includes('/deals/playstation/')) {
    presenceData.details = 'Browsing PSN deals'
  } else if (pathname.includes('/deals/nintendo/')) {
    presenceData.details = 'Browsing Nintendo deals'
  } else if (pathname.includes('/deals/')) {
    presenceData.details = 'Browsing all deals'
  } else if (pathname.includes('/prepaids/pc/')) {
    presenceData.details = 'Browsing PC prepaid cards'
  } else if (pathname.includes('/prepaids/xbox/')) {
    presenceData.details = 'Browsing Xbox prepaid cards'
  } else if (pathname.includes('/prepaids/playstation/')) {
    presenceData.details = 'Browsing PSN prepaid cards'
  } else if (pathname.includes('/prepaids/nintendo/')) {
    presenceData.details = 'Browsing Nintendo prepaid cards'
  } else if (pathname.includes('/prepaids/')) {
    presenceData.details = 'Browsing all prepaid cards'
  } else {
    presenceData.details = 'Browsing deals'
  }

  presence.setActivity(presenceData)
}

presence.on('UpdateData', async () => {
  updatePresence()
})
