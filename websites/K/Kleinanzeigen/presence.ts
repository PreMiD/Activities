const presence = new Presence({
  clientId: '1454616266567323688',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.imgur.com/ipFHHUi.png',
  Search = 'https://i.imgur.com/CoMlHBn.png',
  Profile = 'https://i.imgur.com/NEbzVK4.png',
  Messages = 'https://i.imgur.com/Ubztl28.png',
  Settings = 'https://i.imgur.com/eSpP3lV.png',
  Bookmark = 'https://i.imgur.com/B34j58z.png',
  Edit = 'https://i.imgur.com/4FvGdEl.png',
  Notifications = 'https://i.imgur.com/OauyVgB.png',
  Home = 'https://i.imgur.com/8Is16wm.png',
  Verified = 'https://i.imgur.com/y3pR1Pz.png ',
}

const categoryMap: Record<string, string> = {
  'anbieter': 'Anbieter',
  'privat': 'Privat',
  'gewerblich': 'Gewerblich',
  'anzeige': 'Typ',
  'angebote': 'Angebote',
  'gesuche': 'Gesuche',
  'versand': 'Versand',
  'ja': 'Ja',
  'nein': 'Nein',
  'global.farbe': 'Farbe',
  'global.zustand': 'Zustand',
  'global.material': 'Material',
  'new': 'Neu',
  'as_new': 'Wie neu',
  'like_new': 'Wie neu',
  'good': 'Gut',
  'acceptable': 'Akzeptabel',
  'schwarz': 'Schwarz',
  'weiss': 'Weiß',
  'gold': 'Gold',
  'silber': 'Silber',
  'blau': 'Blau',
  'rot': 'Rot',
  'gruen': 'Grün',
  'rubber': 'Gummi',
  'plastic': 'Plastik',
  'metal': 'Metall',
  'wood': 'Holz',
}

const strings = {
  de: { viewingAd: 'Anzeige ansehen', seller: 'Verkäufer', unknown: 'Unbekannt', topSatisfaction: 'TOP Zufriedenheit', veryFriendly: 'Sehr freundlich', reliable: 'Zuverlässig', viewAd: 'Anzeige ansehen', viewSeller: 'Verkäufer ansehen', searchingFor: 'Sucht nach', page: 'Seite', of: 'von', more: 'weitere', noFilters: 'Keine Filter', viewSearch: 'Suche ansehen', managingAds: 'Anzeigen verwalten', myAds: 'Meine Anzeigen', readingMessages: 'Nachrichten lesen', inbox: 'Posteingang', inSettings: 'In den Einstellungen', managingProfileInfo: 'Profilinformationen verwalten', managingAccountSettings: 'Kontoeinstellungen verwalten', managingPaymentMethods: 'Zahlungsmethoden verwalten', managingPur: 'Kleinanzeigen Pur verwalten', activePur: 'Aktives Kleinanzeigen Pur Abo', inactivePur: 'Inaktives Kleinanzeigen Pur Abo', managingDataProtection: 'Datenschutzeinstellungen verwalten', managingEmailSettings: 'E-Mail-Einstellungen verwalten', viewingAbout: 'Informationen über Kleinanzeigen ansehen', viewingHelp: 'Hilfe- und Feedbackseite ansehen', managingAccount: 'Konto verwalten', browsingWatchlist: 'Merkliste durchsuchen', savedAds: 'Gespeicherte Anzeigen', managingUsers: 'Nutzer verwalten', followedSellers: 'Gefolgte Verkäufer', managingSearches: 'Suchen verwalten', savedSearches: 'Gespeicherte Suchen', posting: 'Erstellt Anzeige', in: 'in', creatingAd: 'Anzeige erstellen', chooseCategory: 'Kategorie wählen', viewingSellerProfile: 'Verkäuferprofil ansehen:', sellerProfile: 'Verkäuferprofil', viewProfile: 'Profil ansehen', managingNotifications: 'Benachrichtigungen verwalten', onHomepage: 'Auf der Startseite', browsingOffers: 'Angebote durchsuchen', browsingCategory: 'Kategorie durchsuchen', browsingAds: 'Anzeigen durchsuchen', unknownSearch: 'Unbekannte Suche' },
  en: { viewingAd: 'Viewing an ad', seller: 'Seller', unknown: 'Unknown', topSatisfaction: 'TOP Satisfaction', veryFriendly: 'Very Friendly', reliable: 'Reliable', viewAd: 'View Ad', viewSeller: 'View Seller', searchingFor: 'Searching for', page: 'Page', of: 'of', more: 'more', noFilters: 'No Filters', viewSearch: 'View Search', managingAds: 'Managing ads', myAds: 'My Ads', readingMessages: 'Reading messages', inbox: 'Inbox', inSettings: 'In settings', managingProfileInfo: 'Managing profile information', managingAccountSettings: 'Managing account settings', managingPaymentMethods: 'Managing payment methods', managingPur: 'Managing Kleinanzeigen Pur', activePur: 'Active Kleinanzeigen Pur membership', inactivePur: 'Inactive Kleinanzeigen Pur membership', managingDataProtection: 'Managing data protection settings', managingEmailSettings: 'Managing email settings', viewingAbout: 'Viewing information about Kleinanzeigen', viewingHelp: 'Viewing the help and feedback page', managingAccount: 'Managing account', browsingWatchlist: 'Browsing watchlist', savedAds: 'Saved Ads', managingUsers: 'Managing users', followedSellers: 'Followed Sellers', managingSearches: 'Managing searches', savedSearches: 'Saved Searches', posting: 'Posting', in: 'in', creatingAd: 'Creating ad', chooseCategory: 'Choose your category', viewingSellerProfile: 'Viewing a seller:', sellerProfile: 'Seller Profile', viewProfile: 'View Profile', managingNotifications: 'Managing notifications', onHomepage: 'On the homepage', browsingOffers: 'Browsing offers', browsingCategory: 'Browsing category', browsingAds: 'Browsing ads', unknownSearch: 'Unknown search' },
}

presence.on('UpdateData', async () => {
  const lang = (await presence.getSetting<string>('lang')) || 'en'
  const t = strings[lang as keyof typeof strings] || strings.de

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  const path = window.location.pathname

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

    const sellerName = document.querySelector('.text-force-linebreak.userprofile-vip a')?.textContent?.trim()

    const badges: string[] = []
    const satisfactionBadge = document.querySelector('.userbadge-tag .icon-rating-tag-2')
    const friendlinessBadge = document.querySelector('.userbadge-tag .icon-friendliness-tag')
    const reliabilityBadge = document.querySelector('.userbadge-tag .icon-reliability-tag')

    if (satisfactionBadge) {
      badges.push(t.topSatisfaction)
    }
    if (friendlinessBadge) {
      badges.push(t.veryFriendly)
    }
    if (reliabilityBadge) {
      badges.push(t.reliable)
    }

    presenceData.details = title || t.viewingAd
    presenceData.state = price ? `${price} | ${t.seller}: ${sellerName || t.unknown}` : `${t.seller}: ${sellerName || t.unknown}`

    if (badges.length > 0) {
      presenceData.smallImageKey = ActivityAssets.Verified
      presenceData.smallImageText = badges.join(' • ')
    }

    const sellerLink = document.querySelector('.text-force-linebreak.userprofile-vip a')?.getAttribute('href')
    presenceData.buttons = [
      {
        label: t.viewAd,
        url: window.location.href,
      },
    ]

    if (sellerLink) {
      presenceData.buttons.push({
        label: t.viewSeller,
        url: `https://www.kleinanzeigen.de${sellerLink}`,
      })
    }
  }

  else if (path.includes('/s-') && !path.includes('/s-anzeige/') && !path.includes('/s-bestandsliste')) {
    const searchQuery = (document.getElementById('site-search-query') as HTMLInputElement)?.value || t.unknownSearch

    const categories: string[] = []

    const urlSegments = path.split('/')
    const filterSegment = urlSegments.find(seg => seg.includes(':')) || ''

    const filters = filterSegment.split('/').filter(f => f.includes(':') && !f.startsWith('s-'))
    filters.forEach((filter) => {
      const [key, value] = filter.split(':')
      const keyTranslated = categoryMap[key!] || key!.replace('global.', '').replace(/_/g, ' ')
      const valueTranslated = categoryMap[value!] || value!.replace(/_/g, ' ')
      categories.push(`${keyTranslated}: ${valueTranslated}`)
    })

    const lastSegment = urlSegments[urlSegments.length - 1]
    if (lastSegment && lastSegment.includes('+')) {
      const additionalFilters = lastSegment.split('+').filter(f => f.includes('.') && !f.startsWith('k'))
      additionalFilters.forEach((filter) => {
        const [key, value] = filter.split(':')
        const cleanKey = key!.replace('global.', '')
        const keyTranslated = categoryMap[key!] || categoryMap[cleanKey!] || cleanKey!.replace(/_/g, ' ')
        const valueTranslated = categoryMap[value!] || value!.replace(/_/g, ' ')

        const filterStr = `${keyTranslated}: ${valueTranslated}`
        if (!categories.includes(filterStr)) {
          categories.push(filterStr)
        }
      })
    }

    const displayCategories = categories.slice(0, 3)
    if (categories.length > 3) {
      displayCategories.push(`+${categories.length - 3} ${t.more}`)
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

    presenceData.details = displayCategories.length > 0
      ? `${t.searchingFor}: '${searchQuery}' | ${displayCategories.join(', ')} | ${t.page} ${currentPage} ${t.of} ${totalPages}`
      : `${t.searchingFor}: '${searchQuery}'`
    presenceData.state = displayCategories.length > 0
      ? `${displayCategories.join(', ')}`
      : `${t.page} ${currentPage} ${t.of} ${totalPages}`
    presenceData.smallImageKey = ActivityAssets.Search
    presenceData.buttons = [
      {
        label: t.viewSearch,
        url: window.location.href,
      },
    ]
  }

  else if (path.includes('/m-meine-anzeigen.html')) {
    presenceData.details = t.managingAds
    presenceData.state = t.myAds
    presenceData.smallImageKey = ActivityAssets.Profile
  }
  else if (path.includes('/m-nachrichten.html')) {
    presenceData.details = t.readingMessages
    presenceData.state = t.inbox
    presenceData.smallImageKey = ActivityAssets.Messages
  }
  else if (path.includes('/m-einstellungen.html')) {
    presenceData.details = t.inSettings
    presenceData.smallImageKey = ActivityAssets.Settings
    if (window.location.hash.includes('personal-info')) {
      presenceData.state = t.managingProfileInfo
    }
    else if (window.location.hash.includes('account-settings')) {
      presenceData.state = t.managingAccountSettings
    }
    else if (window.location.hash.includes('payment-settings')) {
      presenceData.state = t.managingPaymentMethods
    }
    else if (window.location.hash.includes('pur-settings')) {
      const subscriberStatus = document.querySelector('.w-full .inline-flex.flex-nowrap span')?.textContent?.trim() || t.unknown
      if (subscriberStatus === 'Aktiv') {
        presenceData.state = t.activePur
      }
      else if (subscriberStatus === 'Inaktiv') {
        presenceData.state = t.inactivePur
      }
      else {
        presenceData.state = `${t.managingPur} ${subscriberStatus}`
      }
    }
    else if (window.location.hash.includes('data-protection')) {
      presenceData.state = t.managingDataProtection
    }
    else if (window.location.hash.includes('notifications')) {
      presenceData.state = t.managingEmailSettings
    }
    else if (window.location.hash.includes('about')) {
      presenceData.state = t.viewingAbout
    }
    else if (window.location.hash.includes('help-and-feedback')) {
      presenceData.state = t.viewingHelp
    }
    else {
      presenceData.state = t.managingAccount
    }
  }
  else if (path.includes('/m-merkliste.html')) {
    const savedArticles = document.querySelectorAll('#wtchlst-msg ~ ul li').length || 0
    presenceData.details = t.browsingWatchlist
    presenceData.state = `${savedArticles} ${t.savedAds}`
    presenceData.smallImageKey = ActivityAssets.Bookmark
  }
  else if (path.includes('/m-meine-nutzer.html')) {
    presenceData.details = t.managingUsers
    presenceData.state = t.followedSellers
    presenceData.smallImageKey = ActivityAssets.Profile
  }
  else if (path.includes('/m-meine-suchen.html')) {
    presenceData.details = t.managingSearches
    presenceData.state = t.savedSearches
    presenceData.smallImageKey = ActivityAssets.Search
  }
  else if (path.includes('/p-anzeige-aufgeben') || path.includes('/p-anzeige-abschicken')) {
    const category = document.querySelector('#postad-category-path')?.textContent?.trim()
    const price = (document.querySelector('#pstad-price') as HTMLInputElement)?.value?.trim()
    const priceType = (document.querySelector('#priceType') as HTMLSelectElement)?.selectedOptions[0]?.textContent?.trim()

    const statusText = t.creatingAd

    let details = t.posting
    if (category && category !== t.chooseCategory) {
      details += ` ${t.in} ${category}`
    }

    presenceData.details = details
    presenceData.state = statusText

    if (price && priceType) {
      presenceData.smallImageText = `${price} EUR ${priceType}`
    }

    presenceData.smallImageKey = ActivityAssets.Edit
  }

  else if (path.includes('/s-bestandsliste.html')) {
    const sellerNameElement = document.querySelector('.userprofile--name')
    let sellerName = ''
    if (sellerNameElement) {
      const clone = sellerNameElement.cloneNode(true) as HTMLElement
      clone.querySelectorAll('.sr-only').forEach(el => el.remove())
      sellerName = clone.textContent?.trim() || ''
    }
    presenceData.details = t.viewingSellerProfile
    presenceData.state = sellerName || t.sellerProfile
    presenceData.smallImageKey = ActivityAssets.Profile
    presenceData.buttons = [
      {
        label: t.viewProfile,
        url: window.location.href,
      },
    ]
  }
  else if (path.includes('/m-benachrichtigungen.html')) {
    presenceData.details = t.managingNotifications
    presenceData.smallImageKey = ActivityAssets.Notifications
  }
  else if (path === '/' || path === '/index.html') {
    presenceData.details = t.onHomepage
    presenceData.state = t.browsingOffers
    presenceData.smallImageKey = ActivityAssets.Home
  }
  else if (path.match(/^\/s-[^/]+\/c\d+$/)) {
    const categoryName = document.querySelector('h1')?.textContent?.trim()
    presenceData.details = t.browsingCategory
    presenceData.state = categoryName || t.browsingAds
    presenceData.smallImageKey = 'category'
  }
  if (presenceData.details) {
    presence.setActivity(presenceData)
  }
  else {
    presence.setActivity()
  }
})
