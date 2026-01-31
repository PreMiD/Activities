const presence = new Presence({
  clientId: '1465383098437992448',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const strings = await presence.getStrings({
    viewingAd: 'kleinanzeigen.viewingAd',
    seller: 'kleinanzeigen.seller',
    unknown: 'kleinanzeigen.unknown',
    topSatisfaction: 'kleinanzeigen.topSatisfaction',
    veryFriendly: 'kleinanzeigen.veryFriendly',
    reliable: 'kleinanzeigen.reliable',
    viewAd: 'kleinanzeigen.viewAd',
    viewSeller: 'kleinanzeigen.viewSeller',
    searchingFor: 'kleinanzeigen.searchingFor',
    page: 'kleinanzeigen.page',
    of: 'kleinanzeigen.of',
    more: 'kleinanzeigen.more',
    noFilters: 'kleinanzeigen.noFilters',
    viewSearch: 'kleinanzeigen.viewSearch',
    managingAds: 'kleinanzeigen.managingAds',
    myAds: 'kleinanzeigen.myAds',
    readingMessages: 'kleinanzeigen.readingMessages',
    inbox: 'kleinanzeigen.inbox',
    inSettings: 'kleinanzeigen.inSettings',
    managingProfileInfo: 'kleinanzeigen.managingProfileInfo',
    managingAccountSettings: 'kleinanzeigen.managingAccountSettings',
    managingPaymentMethods: 'kleinanzeigen.managingPaymentMethods',
    managingPur: 'kleinanzeigen.managingPur',
    activePur: 'kleinanzeigen.activePur',
    inactivePur: 'kleinanzeigen.inactivePur',
    managingDataProtection: 'kleinanzeigen.managingDataProtection',
    managingEmailSettings: 'kleinanzeigen.managingEmailSettings',
    viewingAbout: 'kleinanzeigen.viewingAbout',
    viewingHelp: 'kleinanzeigen.viewingHelp',
    managingAccount: 'kleinanzeigen.managingAccount',
    browsingWatchlist: 'kleinanzeigen.browsingWatchlist',
    savedAds: 'kleinanzeigen.savedAds',
    managingUsers: 'kleinanzeigen.managingUsers',
    followedSellers: 'kleinanzeigen.followedSellers',
    managingSearches: 'kleinanzeigen.managingSearches',
    savedSearches: 'kleinanzeigen.savedSearches',
    posting: 'kleinanzeigen.posting',
    in: 'kleinanzeigen.in',
    creatingAd: 'kleinanzeigen.creatingAd',
    chooseCategory: 'kleinanzeigen.chooseCategory',
    viewingSellerProfile: 'kleinanzeigen.viewingSellerProfile',
    sellerProfile: 'kleinanzeigen.sellerProfile',
    viewProfile: 'kleinanzeigen.viewProfile',
    managingNotifications: 'kleinanzeigen.managingNotifications',
    onHomepage: 'kleinanzeigen.onHomepage',
    loggedOut: 'kleinanzeigen.loggedOut',
    browsingOffers: 'kleinanzeigen.browsingOffers',
    browsingCategory: 'kleinanzeigen.browsingCategory',
    browsingAds: 'kleinanzeigen.browsingAds',
    unknownSearch: 'kleinanzeigen.unknownSearch',
    vendor: 'kleinanzeigen.vendor',
    privat: 'kleinanzeigen.privat',
    commercial: 'kleinanzeigen.commercial',
    adType: 'kleinanzeigen.adType',
    offers: 'kleinanzeigen.offers',
    requests: 'kleinanzeigen.requests',
    shipping: 'kleinanzeigen.shipping',
    yes: 'kleinanzeigen.yes',
    no: 'kleinanzeigen.no',
    globalColor: 'kleinanzeigen.globalColor',
    globalCondition: 'kleinanzeigen.globalCondition',
    globalMaterial: 'kleinanzeigen.globalMaterial',
    new: 'kleinanzeigen.new',
    asNew: 'kleinanzeigen.asNew',
    likeNew: 'kleinanzeigen.likeNew',
    good: 'kleinanzeigen.good',
    acceptable: 'kleinanzeigen.acceptable',
    black: 'kleinanzeigen.black',
    white: 'kleinanzeigen.white',
    gold: 'kleinanzeigen.gold',
    silver: 'kleinanzeigen.silver',
    blue: 'kleinanzeigen.blue',
    red: 'kleinanzeigen.red',
    green: 'kleinanzeigen.green',
    rubber: 'kleinanzeigen.rubber',
    plastic: 'kleinanzeigen.plastic',
    metal: 'kleinanzeigen.metal',
    wood: 'kleinanzeigen.wood',
  })

  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/K/Kleinanzeigen/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  const path = document.location.pathname

  if (path.includes('/s-anzeige/')) {
    const titleElement = document.querySelector('#viewad-title')
    let title = ''
    if (titleElement) {
      const clone = titleElement.cloneNode(true) as HTMLElement
      clone.querySelectorAll('.is-hidden').forEach(el => el.remove())
      title = clone.textContent?.trim() || ''
    }

    const priceElement = document.querySelector('#viewad-price')
    const price = priceElement?.textContent?.trim()

    let sellerName = document.querySelector('.text-force-linebreak.userprofile-vip a')?.textContent?.trim()
    if (!sellerName) {
      sellerName = document.querySelector('.text-body-regular-strong.text-force-linebreak.userprofile-vip')?.textContent?.trim()
    }

    const badges: string[] = []
    const satisfactionBadge = document.querySelector('.userbadge-tag .icon-rating-tag-2')
    const friendlinessBadge = document.querySelector('.userbadge-tag .icon-friendliness-tag')
    const reliabilityBadge = document.querySelector('.userbadge-tag .icon-reliability-tag')

    if (satisfactionBadge) {
      badges.push(strings.topSatisfaction)
    }
    if (friendlinessBadge) {
      badges.push(strings.veryFriendly)
    }
    if (reliabilityBadge) {
      badges.push(strings.reliable)
    }

    presenceData.details = title || strings.viewingAd
    presenceData.state = price ? `${price} | ${strings.seller}: ${sellerName || strings.unknown}` : `${strings.seller}: ${sellerName || strings.unknown}`

    if (badges.length > 0) {
      presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/K/Kleinanzeigen/assets/0.png'
      presenceData.smallImageText = badges.join(' • ')
    }

    const sellerLink = document.querySelector('.text-force-linebreak.userprofile-vip a')?.getAttribute('href')
    presenceData.buttons = [
      {
        label: strings.viewAd,
        url: window.location.href,
      },
    ]

    if (sellerLink) {
      presenceData.buttons.push({
        label: strings.viewSeller,
        url: `https://www.kleinanzeigen.de${sellerLink}`,
      })
    }
  }

  else if (path.includes('/s-') && !path.includes('/s-anzeige/') && !path.includes('/s-bestandsliste')) {
    const searchInput = document.getElementById('site-search-query') as HTMLInputElement
    let searchQuery = searchInput?.value || strings.unknownSearch

    const categories: string[] = []
    const seenFilters = new Set<string>()

    const urlSegments = path.split('/').filter(seg => seg)

    let area = ''
    let region = ''

    const sIndex = urlSegments.findIndex(seg => seg.startsWith('s-'))
    if (sIndex !== -1) {
      const sSegment = urlSegments[sIndex]
      const sContent = sSegment!.replace('s-', '')

      if (!sSegment!.includes(':')) {
        if (sIndex + 1 < urlSegments.length) {
          const nextSegment = urlSegments[sIndex + 1]
          if (nextSegment && !nextSegment.includes(':') && !nextSegment.includes('+') && !nextSegment.startsWith('k0')) {
            area = sContent.replace(/-/g, ' ').charAt(0).toUpperCase() + sContent.replace(/-/g, ' ').slice(1)
            searchQuery = nextSegment.replace(/-/g, ' ')

            if (sIndex + 2 < urlSegments.length) {
              const regionSegment = urlSegments[sIndex + 2]
              if (regionSegment && !regionSegment.includes(':') && !regionSegment.includes('+') && !regionSegment.startsWith('k0')) {
                region = regionSegment.replace(/-/g, ' ').charAt(0).toUpperCase() + regionSegment.replace(/-/g, ' ').slice(1)
              }
            }
          }
          else {
            searchQuery = sContent.replace(/-/g, ' ')
          }
        }
        else {
          searchQuery = sContent.replace(/-/g, ' ')
        }
      }
      else if (searchQuery === strings.unknownSearch && sIndex + 1 < urlSegments.length) {
        const nextSegment = urlSegments[sIndex + 1]
        if (nextSegment && !nextSegment.includes(':') && !nextSegment.includes('+') && !nextSegment.startsWith('k0')) {
          searchQuery = nextSegment.replace(/-/g, ' ')
        }
      }
    }

    const categoryMap: Record<string, string> = {
      's-anbieter': strings.vendor,
      'privat': strings.privat,
      'gewerblich': strings.commercial,
      'anzeige': strings.adType,
      'angebote': strings.offers,
      'gesuche': strings.requests,
      'versand': strings.shipping,
      'ja': strings.yes,
      'nein': strings.no,
      'global.farbe': strings.globalColor,
      'global.zustand': strings.globalCondition,
      'global.material': strings.globalMaterial,
      'new': strings.new,
      'as_new': strings.asNew,
      'like_new': strings.likeNew,
      'good': strings.good,
      'acceptable': strings.acceptable,
      'schwarz': strings.black,
      'weiss': strings.white,
      'gold': strings.gold,
      'silber': strings.silver,
      'blau': strings.blue,
      'rot': strings.red,
      'gruen': strings.green,
      'rubber': strings.rubber,
      'plastic': strings.plastic,
      'metal': strings.metal,
      'wood': strings.wood,
    }

    urlSegments.forEach((segment) => {
      if (segment.includes(':')) {
        const filterParts = segment.split('+')

        filterParts.forEach((part) => {
          if (!part.includes(':')) {
            return
          }

          const [key, value] = part.split(':')
          if (!key || !value || key === 'k0') {
            return
          }

          const decodedValue = decodeURIComponent(value)

          const cleanKey = key
            .replace('k0', '')
            .replace('global.', '')
            .replace(/_/g, ' ')
            .trim()

          if (!cleanKey || cleanKey === 'k0') {
            return
          }

          const keyTranslated = categoryMap[cleanKey]
            || categoryMap[key]
            || cleanKey.charAt(0).toUpperCase() + cleanKey.slice(1)

          let valueTranslated = ''
          if (decodedValue.includes(',')) {
            const values = decodedValue.split(',').map(v => v.trim())
            const translatedValues = values.map((v) => {
              return categoryMap[v]
                || v.replace(/_/g, ' ').charAt(0).toUpperCase()
                + v.replace(/_/g, ' ').slice(1)
            })
            valueTranslated = translatedValues.join(', ')
          }
          else {
            valueTranslated = categoryMap[decodedValue]
              || decodedValue.replace(/_/g, ' ').charAt(0).toUpperCase()
              + decodedValue.replace(/_/g, ' ').slice(1)
          }

          const filterStr = `${keyTranslated}: ${valueTranslated}`
          const filterStrLower = filterStr.toLowerCase()

          if (!seenFilters.has(filterStrLower)) {
            seenFilters.add(filterStrLower)
            categories.push(filterStr)
          }
        })
      }
    })

    const displayCategories = categories.slice(0, 3)
    if (categories.length > 3) {
      displayCategories.push(`+${categories.length - 3} ${strings.more}`)
    }

    const currentPage = document.querySelector('.pagination-current')?.textContent?.trim() || '1'
    const lastPageLink = document.querySelectorAll('.pagination-page')
    let totalPages = currentPage

    if (lastPageLink.length > 0) {
      const lastVisible = Array.from(lastPageLink).pop()
      totalPages = lastVisible?.textContent?.trim() || currentPage

      if (document.querySelector('.pagination-pages span:not([class])')) {
        totalPages += '+'
      }
    }

    const stateParts = []

    if (area && (region || displayCategories.length > 0 || categories.length > 0)) {
      stateParts.push(area)
    }
    if (region && (displayCategories.length > 0 || categories.length > 0)) {
      stateParts.push(region)
    }

    if (displayCategories.length > 0) {
      stateParts.push(...displayCategories)
    }

    presenceData.details = `${strings.searchingFor}: '${searchQuery}'`

    if (stateParts.length > 0) {
      presenceData.state = `${stateParts.join(' | ')} | ${strings.page} ${currentPage} ${strings.of} ${totalPages}`
    }
    else {
      presenceData.state = `${strings.page} ${currentPage} ${strings.of} ${totalPages}`
    }

    presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/K/Kleinanzeigen/assets/1.png'
    presenceData.buttons = [
      {
        label: strings.viewSearch,
        url: window.location.href,
      },
    ]
  }
  else if (path.includes('/m-meine-anzeigen.html')) {
    presenceData.details = strings.managingAds
    presenceData.state = strings.myAds
    presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/K/Kleinanzeigen/assets/2.png'
  }
  else if (path.includes('/m-nachrichten.html')) {
    presenceData.details = strings.readingMessages
    presenceData.state = strings.inbox
    presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/K/Kleinanzeigen/assets/3.png'
  }
  else if (path.includes('/m-einstellungen.html')) {
    presenceData.details = strings.inSettings
    presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/K/Kleinanzeigen/assets/4.png'
    if (window.location.hash.includes('personal-info')) {
      presenceData.state = strings.managingProfileInfo
    }
    else if (window.location.hash.includes('account-settings')) {
      presenceData.state = strings.managingAccountSettings
    }
    else if (window.location.hash.includes('payment-settings')) {
      presenceData.state = strings.managingPaymentMethods
    }
    else if (window.location.hash.includes('pur-settings')) {
      const subscriberStatus = document.querySelector('.w-full .inline-flex.flex-nowrap span')?.textContent?.trim() || strings.unknown
      if (subscriberStatus === 'Aktiv') {
        presenceData.state = strings.activePur
      }
      else if (subscriberStatus === 'Inaktiv') {
        presenceData.state = strings.inactivePur
      }
      else {
        presenceData.state = `${strings.managingPur} ${subscriberStatus}`
      }
    }
    else if (window.location.hash.includes('data-protection')) {
      presenceData.state = strings.managingDataProtection
    }
    else if (window.location.hash.includes('notifications')) {
      presenceData.state = strings.managingEmailSettings
    }
    else if (window.location.hash.includes('about')) {
      presenceData.state = strings.viewingAbout
    }
    else if (window.location.hash.includes('help-and-feedback')) {
      presenceData.state = strings.viewingHelp
    }
    else {
      presenceData.state = strings.managingAccount
    }
  }
  else if (path.includes('/m-merkliste.html')) {
    const savedArticles = document.querySelectorAll('#wtchlst-msg ~ ul li').length || 0
    presenceData.details = strings.browsingWatchlist
    presenceData.state = `${savedArticles} ${strings.savedAds}`
    presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/K/Kleinanzeigen/assets/5.png'
  }
  else if (path.includes('/m-meine-nutzer.html')) {
    presenceData.details = strings.managingUsers
    presenceData.state = strings.followedSellers
    presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/K/Kleinanzeigen/assets/2.png'
  }
  else if (path.includes('/m-meine-suchen.html')) {
    presenceData.details = strings.managingSearches
    presenceData.state = strings.savedSearches
    presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/K/Kleinanzeigen/assets/1.png'
  }
  else if (path.includes('/p-anzeige-aufgeben') || path.includes('/p-anzeige-abschicken')) {
    const category = document.querySelector('#postad-category-path')?.textContent?.trim()
    const price = document.querySelector<HTMLInputElement>('#pstad-price')?.value?.trim()
    const priceType = document.querySelector<HTMLSelectElement>('#priceType')?.selectedOptions[0]?.textContent?.trim()

    const statusText = strings.creatingAd

    let details = strings.posting
    if (category && category !== strings.chooseCategory) {
      details += ` ${strings.in} ${category}`
    }

    presenceData.details = details
    presenceData.state = statusText

    if (price && priceType) {
      presenceData.smallImageText = `${price} EUR ${priceType}`
    }

    presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/K/Kleinanzeigen/assets/6.png'
  }

  else if (path.includes('/s-bestandsliste.html')) {
    const sellerNameElement = document.querySelector('.userprofile--name')
    let sellerName = ''
    if (sellerNameElement) {
      const clone = sellerNameElement.cloneNode(true) as HTMLElement
      clone.querySelectorAll('.sr-only').forEach(el => el.remove())
      sellerName = clone.textContent?.trim() || ''
    }
    presenceData.details = strings.viewingSellerProfile
    presenceData.state = sellerName || strings.sellerProfile
    presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/K/Kleinanzeigen/assets/2.png'
    presenceData.buttons = [
      {
        label: strings.viewProfile,
        url: window.location.href,
      },
    ]
  }
  else if (path.includes('/m-benachrichtigungen.html')) {
    presenceData.details = strings.managingNotifications
    presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/K/Kleinanzeigen/assets/7.png'
  }
  else if (path === '/' || path === '/index.html') {
    presenceData.details = strings.onHomepage
    presenceData.state = strings.browsingOffers
    presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/K/Kleinanzeigen/assets/8.png'
  }
  else if (path.includes('/m-abgemeldet.html')) {
    presenceData.details = strings.loggedOut
    presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/K/Kleinanzeigen/assets/9.png'
  }
  else if (path.match(/^\/s-[^/]+\/c\d+$/)) {
    const categoryName = document.querySelector('h1')?.textContent?.trim()
    presenceData.details = strings.browsingCategory
    presenceData.state = categoryName || strings.browsingAds
    presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/K/Kleinanzeigen/assets/1.png'
  }

  if (presenceData.details) {
    presence.setActivity(presenceData)
  }
  else {
    presence.clearActivity()
  }
})
