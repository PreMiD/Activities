const presence = new Presence({
  clientId: '1418502826057011251',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

async function getStrings() {
  return presence.getStrings({
    browse: 'general.browsing',
    buttonReadMore: 'general.buttonReadMore',
    buttonViewPage: 'general.buttonViewPage',
    search: 'general.searchSomething',
    searchFor: 'general.searchFor',
    viewHome: 'general.viewHome',
    viewPage: 'general.viewPage',
  })
}

let strings: Awaited<ReturnType<typeof getStrings>>

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/F/FL%20Studio/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  const { pathname, search } = document.location
  const [
    privacyMode,
    showSearchQuery,
    showTimestamp,
  ] = await Promise.all([
    presence.getSetting<boolean>('privacyMode'),
    presence.getSetting<boolean>('searchQuery'),
    presence.getSetting<boolean>('timestamp'),
  ])

  if (!strings)
    strings = await getStrings()

  // Determine page content using more precise logic
  let matched = false

  // Home page
  if (pathname === '/') {
    presenceData.details = 'Viewing home page'
    presenceData.state = 'FL Studio - Music Production Software'
    matched = true
  }
  // Search functionality (check early to avoid conflicts)
  else if (search.includes('q=')) {
    const searchQuery = new URLSearchParams(search).get('q')
    presenceData.details = privacyMode ? strings.search : strings.searchFor
    presenceData.state = showSearchQuery && !privacyMode ? searchQuery : '(Hidden)'
    matched = true
  }
  // Plugins page - exact match or starting with /plugins/
  else if (pathname === '/plugins' || pathname.startsWith('/plugins/')) {
    presenceData.details = 'Browsing Plugins'
    presenceData.state = 'FL Studio Instruments & Effects'
    matched = true
  }
  // Presets page - exact match or starting with /presets/
  else if (pathname === '/presets' || pathname.startsWith('/presets/')) {
    presenceData.details = 'Browsing Presets'
    presenceData.state = 'FL Studio Sound Presets'
    matched = true
  }
  // FL Studio specific pages (most specific first)
  else if (pathname.includes('/fl-studio-mobile')) {
    presenceData.details = 'Viewing FL Studio Mobile'
    presenceData.state = 'Mobile Music Production'
    matched = true
  }
  else if (pathname.includes('/fl-studio-learning')) {
    presenceData.details = 'Learning FL Studio'
    presenceData.state = 'Tutorials & Guides'
    matched = true
  }
  else if (pathname.includes('/fl-studio-support')) {
    presenceData.details = 'FL Studio Support'
    presenceData.state = 'Getting Help'
    matched = true
  }
  else if (pathname.includes('/fl-studio-news')) {
    presenceData.details = 'Reading FL Studio News'
    presenceData.state = 'Latest Updates'
    matched = true
  }
  else if (pathname.includes('/fl-studio-download')) {
    presenceData.details = 'Downloading FL Studio'
    presenceData.state = 'Free Trial Available'
    matched = true
  }
  // FL Studio main page (after specific pages)
  else if (pathname.includes('/fl-studio') && !pathname.includes('/fl-studio-')) {
    presenceData.details = 'Viewing FL Studio'
    presenceData.state = 'Music Production Software'
    if (pathname === '/fl-studio/plugins' || pathname.startsWith('/fl-studio/plugins/')) {
      presenceData.details = 'Browsing Plugins'
      presenceData.state = 'FL Studio Instruments & Effects'
    }
    if (pathname === '/fl-studio/presets' || pathname.startsWith('/fl-studio/presets/')) {
      presenceData.details = 'Browsing Presets'
      presenceData.state = 'FL Studio Sound Presets'
    }
    matched = true
  }
  // FL Cloud
  else if (pathname.includes('/fl-cloud')) {
    presenceData.details = 'Viewing FL Cloud'
    presenceData.state = 'Sample Library Service'
    matched = true
  }
  // FLEX plugin
  else if (pathname.includes('/flex')) {
    presenceData.details = 'Viewing FLEX'
    presenceData.state = 'Free FL Studio Plugin'
    matched = true
  }
  // MIDI Controllers
  else if (pathname.includes('/midi-controllers')) {
    presenceData.details = 'Viewing MIDI Controllers'
    presenceData.state = 'Hardware for FL Studio'
    matched = true
  }
  // Artists/Power Users
  else if (pathname.includes('/artists')) {
    presenceData.details = 'Viewing FL Studio Artists'
    presenceData.state = 'Famous Producers Using FL Studio'
    matched = true
  }
  // Buy/Purchase pages
  else if (pathname.includes('/buy') || pathname.includes('/purchase')) {
    presenceData.details = 'Purchasing FL Studio'
    presenceData.state = 'Choose Your Edition'
    matched = true
  }
  // Release notes
  else if (pathname.includes('/release')) {
    presenceData.details = 'Reading Release Notes'
    presenceData.state = 'What\'s New in FL Studio'
    matched = true
  }
  // Specials/Offers
  else if (pathname.includes('/specials')) {
    presenceData.details = 'Viewing Special Offers'
    presenceData.state = 'Limited Time Deals'
    matched = true
  }
  // Forum
  else if (pathname.includes('forum')) {
    presenceData.details = 'Browsing FL Studio Forum'
    presenceData.state = 'Community Discussions'
    matched = true
  }
  // Support pages
  else if (pathname.includes('/support')) {
    presenceData.details = 'Getting Support'
    presenceData.state = 'Help & FAQ'
    matched = true
  }
  // Contact
  else if (pathname.includes('/contact')) {
    presenceData.details = 'Contact Information'
    presenceData.state = 'Get in Touch with Image-Line'
    matched = true
  }
  // Jobs
  else if (pathname.includes('/jobs')) {
    presenceData.details = 'Viewing Job Opportunities'
    presenceData.state = 'Careers at Image-Line'
    matched = true
  }
  // Press
  else if (pathname.includes('/press')) {
    presenceData.details = 'Press Information'
    presenceData.state = 'Media Resources'
    matched = true
  }
  // Legal pages
  else if (pathname.includes('/legal')) {
    presenceData.details = 'Legal Information'
    presenceData.state = 'Terms & Privacy'
    matched = true
  }

  else if (pathname === '/learn' || pathname.startsWith('/learn/')) {
    presenceData.details = 'Learning FL Studio'
    presenceData.state = 'FL Studio Academy'
    matched = true
  }

  // Default fallback if no specific page matched
  if (!matched) {
    presenceData.details = strings.browse
    presenceData.state = 'FL Studio Website'
  }

  // Apply privacy mode
  if (privacyMode) {
    delete presenceData.state
    presenceData.details = strings.browse
  }

  // Apply timestamp setting
  if (!showTimestamp || privacyMode) {
    delete presenceData.startTimestamp
  }

  // Set the activity
  if (presenceData.details) {
    presence.setActivity(presenceData)
  }
  else {
    presence.clearActivity()
  }
})
