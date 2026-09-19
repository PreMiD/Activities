import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1543722675699196045',
})

const TRUCKY_LOGO = 'https://screen-mp.com/uploads/images/f138ec30-1dcc-4ac1-a320-56343d8ead64.png'
const browsingTimestamp = Math.floor(Date.now() / 1000)

function cleanText(text: string | null | undefined): string {
  if (!text)
    return ''
  return text
    .replace(/\s*[-|–—]\s*(?:Trucky|TruckyApp|TruckyMods|VTC Hub|The Virtual Trucker Companion).*$/i, '')
    .trim()
}

/**
 * Finds the driver name from the viewed profile page
 */
function findUserName(): string {
  // Strategy 1: Look near the "Steam Profile" button or level container
  const steamLink = document.querySelector('a[href*="steamcommunity.com"], a[href*="steam"], [class*="steam"]')
  if (steamLink) {
    const parent = steamLink.closest('.card, div')
    if (parent) {
      const headings = Array.from(parent.querySelectorAll<HTMLElement>('h1, h2, h3, h4, h5, [class*="title"], [class*="name"]'))
      for (const h of headings) {
        if (h.closest('.breadcrumb, .badge, [class*="company"], nav, header'))
          continue
        const text = h.textContent?.trim() || ''
        if (text && text.length <= 35 && !text.toLowerCase().includes('level') && !text.toLowerCase().includes('steam') && !text.toLowerCase().includes('points')) {
          return text
        }
      }
    }
  }

  // Strategy 2: Find the element containing "Level " text
  const allElements = Array.from(document.querySelectorAll('*'))
  const levelEl = allElements.find(
    el => el.children.length === 0 && (el.textContent?.includes('Level ') || el.textContent?.includes('Nivel ')),
  )
  if (levelEl) {
    const card = levelEl.closest('.card, [class*="profile"], div')
    if (card) {
      const headings = Array.from(card.querySelectorAll<HTMLElement>('h1, h2, h3, h4, h5, strong, [class*="name"]'))
      for (const h of headings) {
        if (h.closest('.breadcrumb, .badge, [class*="company"], nav, header'))
          continue
        const text = h.textContent?.trim() || ''
        if (!text || text.length > 35)
          continue
        const lower = text.toLowerCase()
        if (lower.includes('level') || lower.includes('nivel') || lower.includes('points') || lower.includes('steam') || lower.includes('trucky') || lower.includes('details'))
          continue
        return text
      }
    }
  }

  // Strategy 3: Search in the main profile card
  const profileCard = document.querySelector('.card, [class*="profile-header"], [class*="user-header"], main')
  if (profileCard) {
    const candidates = Array.from(profileCard.querySelectorAll<HTMLElement>(
      'h1, h2, h3, h4, h5, .card-title, [class*="name" i], [class*="username" i]',
    ))

    const blacklist = [
      'trucky',
      'status',
      'company',
      'highlights',
      'statistics',
      'jobs',
      'awards',
      'events',
      'level',
      'points',
      'dashboard',
      'directory',
      'servers',
      'traffic',
      'hosting',
      'leaderboard',
      'details',
      'monthly',
      'steam profile',
      'steam',
      'twitch',
      'wotr',
      'discord',
    ]

    for (const el of candidates) {
      if (el.closest('.breadcrumb, [class*="breadcrumb"], nav, header, .navbar, .badge, [class*="company"]'))
        continue

      const text = el.textContent?.trim()
      if (!text)
        continue

      const lower = text.toLowerCase()
      if (text.length > 35)
        continue
      if (blacklist.some(b => lower.startsWith(b) || lower === b))
        continue
      if (text.includes('km') || text.includes('mins') || text.includes('%'))
        continue

      return text
    }
  }

  return ''
}

presence.on('UpdateData', async () => {
  const [buttons, timestamp, privacy] = await Promise.all([
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('timestamp'),
    presence.getSetting<boolean>('privacy'),
  ])

  // Always keep the official Trucky logo as the large image
  const presenceData: PresenceData = {
    largeImageKey: TRUCKY_LOGO,
    smallImageKey: Assets.Viewing,
    smallImageText: 'Trucky Hub',
  }

  if (privacy) {
    presenceData.details = 'Browsing Trucky'
    presence.setActivity(presenceData)
    return
  }

  if (timestamp) {
    presenceData.startTimestamp = browsingTimestamp
  }

  const { hostname, pathname, href } = document.location

  // =========================================================================
  // 1. TRUCKYMODS (truckymods.io)
  // =========================================================================
  if (hostname.includes('truckymods.io')) {
    if (pathname.includes('/mods/') || pathname.includes('/mod/')) {
      const modTitle = document.querySelector<HTMLHeadingElement>('h1')?.textContent
        || cleanText(document.title)
      const modCategory = document.querySelector('.mod-category, .badge')?.textContent?.trim() || 'Mod'

      presenceData.details = `Viewing Mod: ${modTitle.slice(0, 50)}`
      presenceData.state = `Category: ${modCategory.slice(0, 40)}`
      presenceData.smallImageKey = Assets.Downloading
      presenceData.smallImageText = 'TruckyMods'
    }
    else if (pathname.includes('/user/') || pathname.includes('/author/') || pathname.includes('/creator/')) {
      const authorName = document.querySelector<HTMLHeadingElement>('h1')?.textContent
        || cleanText(document.title)
      presenceData.details = 'Modder Profile'
      presenceData.state = authorName ? authorName.slice(0, 45) : 'Mod Creator'
      presenceData.smallImageKey = Assets.Viewing
      presenceData.smallImageText = 'Modder Profile'
    }
    else if (pathname.includes('/search') || pathname.includes('/category/') || pathname.includes('/categories')) {
      const searchCat = document.querySelector<HTMLHeadingElement>('h1')?.textContent || 'Browsing mods'
      presenceData.details = 'Searching Mods'
      presenceData.state = searchCat.slice(0, 60)
      presenceData.smallImageKey = Assets.Search
      presenceData.smallImageText = 'Searching'
    }
    else {
      presenceData.details = 'Browsing TruckyMods'
      presenceData.state = 'Mod platform for ETS2 & ATS'
      presenceData.smallImageKey = Assets.Viewing
    }

    if (buttons) {
      presenceData.buttons = [
        { label: 'View on TruckyMods', url: href },
        { label: 'Get Trucky', url: 'https://truckyapp.com/' },
      ]
    }

    presence.setActivity(presenceData)
    return
  }

  // =========================================================================
  // 2. TRUCKY VTC HUB (hub.truckyapp.com, vtc.truckyapp.com)
  // =========================================================================
  if (hostname.includes('hub.truckyapp.com') || hostname.includes('vtc.truckyapp.com') || pathname.startsWith('/hub') || pathname.startsWith('/vtc')) {
    // --- EDIT PROFILE ---
    if (pathname.includes('/profile/edit') || pathname.includes('/profile/settings') || pathname.includes('/settings')) {
      presenceData.details = 'Editing Profile'
      presenceData.state = 'Customizing driver profile'
      presenceData.smallImageKey = Assets.Writing
      presenceData.smallImageText = 'Edit Profile'
    }
    // --- LIVE MAP ---
    else if (pathname.includes('/map')) {
      presenceData.details = 'Trucky Live Map'
      presenceData.state = 'Monitoring routes and traffic'
      presenceData.smallImageKey = Assets.Live
      presenceData.smallImageText = 'Live Map'
    }
    // --- VTC DIRECTORY ---
    else if (pathname.includes('/directory')) {
      presenceData.details = 'VTC Directory'
      presenceData.state = 'Browsing virtual companies'
      presenceData.smallImageKey = Assets.Search
      presenceData.smallImageText = 'Directory'
    }
    // --- REGISTER COMPANY ---
    else if (pathname.includes('/register-your-company')) {
      presenceData.details = 'Register a Company (VTC)'
      presenceData.state = 'Creating a new virtual company'
      presenceData.smallImageKey = Assets.Writing
      presenceData.smallImageText = 'Register VTC'
    }
    // --- EVENTS ---
    else if (pathname.includes('/events') || pathname.includes('/event/')) {
      const eventTitle = document.querySelector<HTMLHeadingElement>('h1, h2, .event-title')?.textContent?.trim()
      if (eventTitle && !eventTitle.toLowerCase().includes('events')) {
        presenceData.details = `Event: ${eventTitle.slice(0, 50)}`
        presenceData.state = 'Viewing event details'
      }
      else {
        presenceData.details = 'Events & Convoys'
        presenceData.state = 'Browsing community events'
      }
      presenceData.smallImageKey = Assets.Viewing
      presenceData.smallImageText = 'Events'
    }
    // --- PREMIUM ---
    else if (pathname.includes('/premium')) {
      presenceData.details = 'Trucky Premium'
      presenceData.state = 'Viewing exclusive benefits'
      presenceData.smallImageKey = Assets.Viewing
      presenceData.smallImageText = 'Premium'
    }
    // --- DASHBOARDS ---
    else if (pathname.includes('/dashboards') || pathname.includes('/dashboard')) {
      presenceData.details = 'Dashboard Gallery'
      presenceData.state = 'Browsing telemetry dashboards'
      presenceData.smallImageKey = Assets.Live
      presenceData.smallImageText = 'Dashboards'
    }
    // --- SERVERS ---
    else if (pathname.includes('/servers')) {
      presenceData.details = 'TruckersMP Servers'
      presenceData.state = 'Monitoring server status & players'
      presenceData.smallImageKey = Assets.Live
      presenceData.smallImageText = 'Servers'
    }
    // --- TRAFFIC ---
    else if (pathname.includes('/traffic')) {
      presenceData.details = 'Traffic Reports'
      presenceData.state = 'Checking real-time traffic'
      presenceData.smallImageKey = Assets.Live
      presenceData.smallImageText = 'Traffic'
    }
    // --- HOSTING ---
    else if (pathname.includes('/hosting')) {
      presenceData.details = 'Dedicated Servers'
      presenceData.state = 'Game server hosting'
      presenceData.smallImageKey = Assets.Viewing
      presenceData.smallImageText = 'Game Server Hosting'
    }
    // --- LEADERBOARDS ---
    else if (pathname.includes('/leaderboards/companies/distance')) {
      presenceData.details = 'Company Leaderboard'
      presenceData.state = 'Top VTCs by Distance'
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = 'Leaderboard'
    }
    else if (pathname.includes('/leaderboards/companies/hardcore')) {
      presenceData.details = 'Company Leaderboard'
      presenceData.state = 'Top VTCs - Hardcore Mode'
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = 'Hardcore Leaderboard'
    }
    else if (pathname.includes('/leaderboards/users/distance')) {
      presenceData.details = 'Driver Leaderboard'
      presenceData.state = 'Top Users by Distance'
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = 'Leaderboard'
    }
    else if (pathname.includes('/leaderboards/users/hardcore')) {
      presenceData.details = 'Driver Leaderboard'
      presenceData.state = 'Top Users - Hardcore Mode'
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = 'Hardcore Leaderboard'
    }
    else if (pathname.includes('/leaderboard') || pathname.includes('/leaderboards')) {
      presenceData.details = 'VTC Hub - Leaderboards'
      presenceData.state = 'Viewing top companies & drivers'
      presenceData.smallImageKey = Assets.Reading
    }
    // --- USER / DRIVER PROFILE (e.g. /user/175669) ---
    else if (pathname.includes('/user/')) {
      const userIdMatch = pathname.match(/\/user\/([\w-]+)/i)
      const userId = userIdMatch ? userIdMatch[1] : ''
      const userName = findUserName()

      presenceData.details = userName
        ? `Driver: ${userName.slice(0, 45)}`
        : `Driver Profile #${userId}`
      presenceData.state = userId ? `User ID: #${userId}` : 'Viewing driver'
      presenceData.smallImageKey = Assets.Viewing
      presenceData.smallImageText = 'Driver'
    }
    // --- COMPANY / VTC PROFILE ---
    else if (pathname.includes('/company/') || pathname.includes('/vtc/')) {
      const vtcName = document.querySelector<HTMLHeadingElement>('h1, h2, .vtc-name, .company-name')?.textContent?.trim()
        || cleanText(document.title)

      presenceData.details = 'Viewing Company (VTC)'
      presenceData.state = vtcName && !vtcName.toLowerCase().includes('trucky')
        ? vtcName.slice(0, 60)
        : 'Virtual Transport Company'
      presenceData.smallImageKey = Assets.Viewing
      presenceData.smallImageText = 'VTC'
    }
    // --- LOGBOOK ---
    else if (pathname.includes('/jobs') || pathname.includes('/logbook') || pathname.includes('/job/')) {
      presenceData.details = 'VTC Hub - Logbook'
      presenceData.state = 'Reviewing deliveries & job history'
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = 'Logbook'
    }
    // --- FLEET ---
    else if (pathname.includes('/fleet')) {
      presenceData.details = 'VTC Hub - Fleet'
      presenceData.state = 'Managing garages & fleet'
      presenceData.smallImageKey = Assets.Reading
    }
    // --- HUB HOME ---
    else {
      presenceData.details = 'Trucky VTC Hub'
      presenceData.state = 'Managing virtual transport company'
      presenceData.smallImageKey = Assets.Viewing
    }

    if (buttons) {
      presenceData.buttons = [
        { label: 'View on VTC Hub', url: href },
        { label: 'Get Trucky', url: 'https://truckyapp.com/' },
      ]
    }

    presence.setActivity(presenceData)
    return
  }

  // =========================================================================
  // 3. TRUCKY LIVE MAP (map.truckyapp.com)
  // =========================================================================
  if (hostname.includes('map.truckyapp.com') || pathname.startsWith('/map')) {
    presenceData.details = 'Trucky Live Map'

    const serverSelected = document.querySelector('.selected-server, .server-name, select option:checked')?.textContent?.trim()
    presenceData.state = serverSelected
      ? `Server: ${serverSelected.slice(0, 45)}`
      : 'Monitoring traffic & servers'

    presenceData.smallImageKey = Assets.Live
    presenceData.smallImageText = 'Live Map'

    if (buttons) {
      presenceData.buttons = [
        { label: 'Open Live Map', url: 'https://map.truckyapp.com/' },
        { label: 'Get Trucky', url: 'https://truckyapp.com/' },
      ]
    }

    presence.setActivity(presenceData)
    return
  }

  // =========================================================================
  // 4. TRUCKY MAIN WEBSITE (truckyapp.com)
  // =========================================================================
  if (pathname === '/' || pathname === '') {
    presenceData.details = 'Home Page'
    presenceData.state = 'The Virtual Trucker Companion'
  }
  else if (pathname.includes('/overlay') || pathname.includes('/in-game-overlay')) {
    presenceData.details = 'In-Game Overlay'
    presenceData.state = 'Overlay for ETS2 & ATS'
    presenceData.smallImageKey = Assets.Viewing
  }
  else if (pathname.includes('/premium') || pathname.includes('/pricing')) {
    presenceData.details = 'Premium Plans'
    presenceData.state = 'Trucky Premium Membership'
    presenceData.smallImageKey = Assets.Viewing
  }
  else if (pathname.includes('/download')) {
    presenceData.details = 'Downloads'
    presenceData.state = 'Downloading Trucky Client'
    presenceData.smallImageKey = Assets.Downloading
  }
  else if (pathname.includes('/dispatcher')) {
    presenceData.details = 'Trucky Dispatcher'
    presenceData.state = 'Route & Cargo Generator'
    presenceData.smallImageKey = Assets.Viewing
  }
  else if (pathname.includes('/blog') || pathname.includes('/news') || pathname.includes('/article')) {
    const articleTitle = document.querySelector<HTMLHeadingElement>('h1')?.textContent
      || cleanText(document.title)
    presenceData.details = 'Reading News'
    presenceData.state = articleTitle ? articleTitle.slice(0, 60) : 'Trucky Blog'
    presenceData.smallImageKey = Assets.Reading
  }
  else {
    const pageHeading = document.querySelector<HTMLHeadingElement>('h1')?.textContent
      || cleanText(document.title)
    presenceData.details = 'Browsing Trucky'
    presenceData.state = pageHeading ? pageHeading.slice(0, 60) : 'The Virtual Trucker Companion'
  }

  if (buttons) {
    presenceData.buttons = [
      { label: 'Visit Page', url: href },
      { label: 'Get Trucky', url: 'https://truckyapp.com/' },
    ]
  }

  presence.setActivity(presenceData)
})
