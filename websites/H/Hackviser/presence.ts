const presence = new Presence({
  clientId: '1476565376513999030',
})

let startTimestamp = Math.floor(Date.now() / 1000)
let lastPage = ''

/**
 * Converts a URL slug into a human-readable title.
 */
function extractPageTitle(pathname: string): string | null {
  const parts = pathname.split('/').filter(p => p.length > 0)
  if (parts.length >= 2) {
    const slug = parts[parts.length - 1] || ''
    return slug
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
  }
  return null
}

/**
 * Determines page info from the current pathname.
 */
function getPageData(pathname: string): {
  page: string
  details: string
  state: string
  sensitive: boolean
} {
  // ── Auth pages (sensitive) ──────────────────────────────────
  if (
    pathname.startsWith('/login')
    || pathname.startsWith('/register')
    || pathname.startsWith('/forgot')
    || pathname.startsWith('/reset')
  ) {
    return {
      page: 'login',
      details: 'Signing into Hackviser',
      state: '',
      sensitive: true,
    }
  }

  // ── Landing Page ────────────────────────────────────────────
  if (pathname === '/') {
    return {
      page: 'landing',
      details: 'Exploring Hackviser',
      state: '',
      sensitive: false,
    }
  }

  // ── Home ────────────────────────────────────────────────────
  if (pathname.startsWith('/home')) {
    return {
      page: 'home',
      details: 'Viewing Home Page',
      state: '',
      sensitive: false,
    }
  }

  // ── Dashboard ───────────────────────────────────────────────
  if (pathname.startsWith('/dashboard')) {
    return {
      page: 'dashboard',
      details: 'Reviewing Progress & Stats',
      state: '',
      sensitive: false,
    }
  }

  // ── Academy ─────────────────────────────────────────────────
  if (pathname.startsWith('/academy')) {
    const subPage = extractPageTitle(pathname)

    if (subPage && subPage !== 'Categories') {
      if (pathname.includes('/trainings')) {
        return {
          page: 'academy',
          details: 'Studying Course',
          state: subPage,
          sensitive: false,
        }
      } else {
        return {
          page: 'academy',
          details: 'Viewing Category',
          state: subPage,
          sensitive: false,
        }
      }
    }

    return {
      page: 'academy',
      details: 'Exploring Academy',
      state: '',
      sensitive: false,
    }
  }

  // ── Warmups ─────────────────────────────────────────────────
  if (
    pathname.startsWith('/warmups')
    || pathname.startsWith('/warmup')
  ) {
    const name = extractPageTitle(pathname)
    return {
      page: 'warmups',
      details: name ? 'Solving Warmup' : 'Exploring Warmups',
      state: name ? name : '',
      sensitive: false,
    }
  }

  // ── Scenarios ───────────────────────────────────────────────
  if (
    pathname.startsWith('/scenarios')
    || pathname.startsWith('/scenario')
  ) {
    const name = extractPageTitle(pathname)
    return {
      page: 'scenarios',
      details: name ? 'Running Attack Scenario' : 'Exploring Scenarios',
      state: name ? name : '',
      sensitive: false,
    }
  }

  // ── Missions ────────────────────────────────────────────────
  if (
    pathname.startsWith('/missions')
    || pathname.startsWith('/mission')
  ) {
    const name = extractPageTitle(pathname)
    return {
      page: 'missions',
      details: 'Viewing Missions',
      state: name ? `Mission: ${name}` : '',
      sensitive: false,
    }
  }

  // ── Certifications ──────────────────────────────────────────
  if (
    pathname.startsWith('/certifications')
    || pathname.startsWith('/certification')
  ) {
    const name = extractPageTitle(pathname)
    return {
      page: 'certifications',
      details: 'Viewing Certifications',
      state: name ? name.toUpperCase() : '',
      sensitive: false,
    }
  }

  // ── Labs / Machines ─────────────────────────────────────────
  if (
    pathname.startsWith('/labs')
    || pathname.startsWith('/lab')
    || pathname.startsWith('/machines')
  ) {
    const labName = extractPageTitle(pathname)
    return {
      page: 'labs',
      details: labName ? 'Solving Lab' : 'Exploring Labs',
      state: labName ? labName : '',
      sensitive: false,
    }
  }

  // ── Support ─────────────────────────────────────────────────
  if (pathname.startsWith('/support')) {
    const isOpening = pathname.includes('/open-ticket')
    return {
      page: 'support',
      details: isOpening ? 'Creating a Support Ticket' : 'Thinking About Opening a Ticket',
      state: '',
      sensitive: false,
    }
  }

  // ── Learning Paths / Courses ────────────────────────────────
  if (
    pathname.startsWith('/learning')
    || pathname.startsWith('/paths')
    || pathname.startsWith('/courses')
  ) {
    return {
      page: 'learning',
      details: 'Mastering Cybersecurity Skills',
      state: '',
      sensitive: false,
    }
  }

  // ── Account Settings ────────────────────────────────────────
  if (pathname.startsWith('/account/settings')) {
    return {
      page: 'settings',
      details: 'Configuring Account Settings',
      state: '',
      sensitive: false,
    }
  }

  // ── Pricing Plans ───────────────────────────────────────────
  if (pathname.startsWith('/pricing-plans')) {
    return {
      page: 'pricing',
      details: 'Exploring Pricing Options',
      state: '',
      sensitive: false,
    }
  }

  // ── FAQ ─────────────────────────────────────────────────────
  if (pathname.startsWith('/frequently-asked-questions')) {
    return {
      page: 'faq',
      details: 'Reading the FAQ',
      state: '',
      sensitive: false,
    }
  }

  // ── Profile / User ──────────────────────────────────────────
  if (
    pathname.startsWith('/profile')
    || pathname.startsWith('/user')
    || pathname.startsWith('/settings')
  ) {
    const parts = pathname.split('/').filter(p => p.length > 0)
    const isSettings = pathname.includes('/settings')
    
    if (isSettings) {
      return {
        page: 'settings',
        details: 'Configuring Account Settings',
        state: '',
        sensitive: false,
      }
    }

    const profileName = parts.length > 1 ? parts[1] : null

    return {
      page: 'profile',
      details: profileName ? `Viewing ${profileName}'s Profile` : 'Viewing Own Profile',
      state: '',
      sensitive: false,
    }
  }

  // ── Leaderboard / Rankings ──────────────────────────────────
  if (
    pathname.startsWith('/leaderboard')
    || pathname.startsWith('/scoreboard')
    || pathname.startsWith('/ranking')
  ) {
    return {
      page: 'leaderboard',
      details: 'Checking the Scoreboard',
      state: '',
      sensitive: false,
    }
  }

  // ── Ticket ──────────────────────────────────────────────────
  if (pathname.startsWith('/ticket')) {
    return {
      page: 'ticket',
      details: 'Viewing a Support Ticket',
      state: '',
      sensitive: false,
    }
  }

  // ── Default: browsing ───────────────────────────────────────
  return {
    page: 'browsing',
    details: 'Browsing Hackviser',
    state: '',
    sensitive: false,
  }
}

// ── Main update loop ────────────────────────────────────────────
presence.on('UpdateData', async () => {
  const pathname = document.location.pathname
  const pageData = getPageData(pathname)

  // Reset timer when the page changes
  if (pageData.page !== lastPage) {
    startTimestamp = Math.floor(Date.now() / 1000)
    lastPage = pageData.page
  }
  
  const presenceData: PresenceData = {
    startTimestamp,
    largeImageKey: 'https://i.ibb.co/ns57qq7g/512x512.jpg',
  }

  // 265. Satır: ESLint Brace Style Düzeltmesi
  if (pageData.sensitive) {
    presenceData.details = pageData.details
  }
  else {
    if (pageData.details) {
      presenceData.details = pageData.details
    }
    if (pageData.state) {
      presenceData.state = pageData.state
    }
  }

  presence.setActivity(presenceData)
})
