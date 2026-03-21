const presence = new Presence({
  clientId: '1476565376513999030'
})

let startTimestamp = Math.floor(Date.now() / 1000)
let lastPage = ''

/**
 * Converts a URL slug into a human-readable title.
 * e.g. "my-cool-lab" → "My Cool Lab"
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
 * Ported from the Chrome extension's parseHackviserUrl() logic.
 */
function getPageData(pathname: string): {
  page: string
  details: string
  state: string
  sensitive: boolean
} {
  // ── Auth pages (sensitive) ──────────────────────────────────
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/forgot') ||
    pathname.startsWith('/reset')
  ) {
    return { page: 'login', details: 'Logging In', state: '', sensitive: true }
  }

  // ── Home ────────────────────────────────────────────────────
  if (pathname.startsWith('/home') || pathname === '/') {
    return {
      page: 'home',
      details: 'Home Page',
      state: 'Viewing Home Page',
      sensitive: false
    }
  }

  // ── Dashboard ───────────────────────────────────────────────
  if (pathname.startsWith('/dashboard')) {
    return {
      page: 'dashboard',
      details: 'Dashboard',
      state: 'Viewing Stats',
      sensitive: false
    }
  }

  // ── Academy ─────────────────────────────────────────────────
  if (pathname.startsWith('/academy')) {
    const subPage = extractPageTitle(pathname)
    return {
      page: 'academy',
      details: 'Academy',
      state: subPage || 'Browsing Categories',
      sensitive: false
    }
  }

  // ── Warmups ─────────────────────────────────────────────────
  if (pathname.startsWith('/warmups') || pathname.startsWith('/warmup')) {
    const name = extractPageTitle(pathname)
    return {
      page: 'warmups',
      details: 'Warmups',
      state: name || 'Warming Up...',
      sensitive: false
    }
  }

  // ── Scenarios ───────────────────────────────────────────────
  if (pathname.startsWith('/scenarios') || pathname.startsWith('/scenario')) {
    const name = extractPageTitle(pathname)
    return {
      page: 'scenarios',
      details: 'Scenarios',
      state: name || 'Running Scenario',
      sensitive: false
    }
  }

  // ── Missions ────────────────────────────────────────────────
  if (pathname.startsWith('/missions') || pathname.startsWith('/mission')) {
    const name = extractPageTitle(pathname)
    return {
      page: 'missions',
      details: 'Missions',
      state: name || 'On a Mission',
      sensitive: false
    }
  }

  // ── Certifications ──────────────────────────────────────────
  if (
    pathname.startsWith('/certifications') ||
    pathname.startsWith('/certification')
  ) {
    const name = extractPageTitle(pathname)
    return {
      page: 'certifications',
      details: 'Certifications',
      state: name || 'Viewing Certifications',
      sensitive: false
    }
  }

  // ── Labs / Machines ─────────────────────────────────────────
  if (
    pathname.startsWith('/labs') ||
    pathname.startsWith('/lab') ||
    pathname.startsWith('/machines')
  ) {
    const labName = extractPageTitle(pathname)
    return {
      page: 'labs',
      details: 'Solving Labs',
      state: labName || 'Hacking in Progress...',
      sensitive: false
    }
  }

  // ── Support ─────────────────────────────────────────────────
  if (pathname.startsWith('/support')) {
    return {
      page: 'support',
      details: 'Support',
      state: 'Getting Support',
      sensitive: false
    }
  }

  // ── Learning Paths / Courses ────────────────────────────────
  if (
    pathname.startsWith('/learning') ||
    pathname.startsWith('/paths') ||
    pathname.startsWith('/courses')
  ) {
    return {
      page: 'learning',
      details: 'Learning Paths',
      state: 'Studying Cyber Security',
      sensitive: false
    }
  }

  // ── CTF / Challenges ────────────────────────────────────────
  if (pathname.startsWith('/ctf') || pathname.startsWith('/challenges')) {
    return {
      page: 'ctf',
      details: 'CTF Challenge',
      state: 'Capturing Flags',
      sensitive: false
    }
  }

  // ── Account Settings ────────────────────────────────────────
  if (pathname.startsWith('/account/settings')) {
    return {
      page: 'settings',
      details: 'Settings',
      state: 'A few changes',
      sensitive: false
    }
  }

  // ── Pricing Plans ───────────────────────────────────────────
  if (pathname.startsWith('/pricing-plans')) {
    return {
      page: 'pricing',
      details: 'Pricing Plans',
      state: 'Looking Pricing Plans',
      sensitive: false
    }
  }

  // ── FAQ ─────────────────────────────────────────────────────
  if (pathname.startsWith('/frequently-asked-questions')) {
    return {
      page: 'faq',
      details: 'Frequently Asked Questions',
      state: 'Is looking for answers to the questions on his mind',
      sensitive: false
    }
  }

  // ── Profile / User ──────────────────────────────────────────
  if (
    pathname.startsWith('/profile') ||
    pathname.startsWith('/user') ||
    pathname.startsWith('/settings')
  ) {
    return {
      page: 'profile',
      details: 'Profile',
      state: 'Viewing Profile',
      sensitive: false
    }
  }

  // ── Leaderboard / Rankings ──────────────────────────────────
  if (
    pathname.startsWith('/leaderboard') ||
    pathname.startsWith('/scoreboard') ||
    pathname.startsWith('/ranking')
  ) {
    return {
      page: 'leaderboard',
      details: 'Leaderboard',
      state: 'Checking Rankings',
      sensitive: false
    }
  }

  // ── Ticket ──────────────────────────────────────────────────
  if (pathname.startsWith('/ticket')) {
    return {
      page: 'ticket',
      details: 'Ticket',
      state: 'Viewing Ticket',
      sensitive: false
    }
  }

  // ── Default: browsing ───────────────────────────────────────
  return {
    page: 'browsing',
    details: 'Browsing Platform',
    state: '',
    sensitive: false
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
    startTimestamp
  }



  // Sensitive pages: only show "Logging In", hide details
  if (pageData.sensitive) {
    presenceData.details = pageData.details
  } else {
    if (pageData.details) {
      presenceData.details = pageData.details
    }
    if (pageData.state) {
      presenceData.state = pageData.state
    }
  }

  // Buttons
  presenceData.buttons = [
    {
      label: 'Learn Cybersecurity',
      url: 'https://hackviser.com/'
    }
  ]

  presence.setActivity(presenceData)
})
