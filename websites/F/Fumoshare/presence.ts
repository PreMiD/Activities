const presence = new Presence({
  clientId: '1550909471180726362',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/F/Fumoshare/assets/logo.png',
}

function cleanTitle(title: string): string {
  return title
    .replace(/\s*\|\s*Fumoshare\s*$/i, '')
    .replace(/\s*-\s*Fumoshare\s*$/i, '')
    .trim()
}

presence.on('UpdateData', async () => {
  const [privacy, elapsedTime, buttonsSetting] = await Promise.all([
    presence.getSetting<boolean>('privacy').catch(() => false),
    presence.getSetting<boolean>('elapsedTime').catch(() => true),
    presence.getSetting<boolean>('buttons').catch(() => true),
  ])

  const showButtons = buttonsSetting !== false
  const { pathname, search, href } = document.location
  const searchParams = new URLSearchParams(search)

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
  }

  if (elapsedTime) {
    presenceData.startTimestamp = browsingTimestamp
  }

  // Route: Homepage
  if (pathname === '/' || pathname === '') {
    presenceData.details = 'Browsing Community Feed'
    presenceData.state = 'Exploring Fumoshare'
    if (showButtons) {
      presenceData.buttons = [
        { label: 'Explore Feed', url: 'https://fumoshare.com/feed' },
      ]
    }
  }
  // Route: Feed
  else if (pathname.startsWith('/feed')) {
    const tab = searchParams.get('tab')
    presenceData.details = 'Browsing Feed'

    if (tab === 'challenge') {
      presenceData.state = 'Viewing Weekly Challenge'
    }
    else if (tab === 'top') {
      presenceData.state = 'Viewing Top Posts'
    }
    else if (tab === 'following') {
      presenceData.state = 'Viewing Following'
    }
    else {
      presenceData.state = 'Viewing Recent Posts'
    }

    if (showButtons) {
      presenceData.buttons = [
        { label: 'Open Feed', url: href },
      ]
    }
  }
  // Route: Single Post
  else if (pathname.startsWith('/post/')) {
    const authorEl = document.querySelector('a[href^="/profile/"] span, a[href^="/profile/"]')
    const authorName = authorEl?.textContent?.trim().replace(/^@/, '')

    if (privacy) {
      presenceData.details = 'Viewing a Post'
      presenceData.state = 'Browsing photo'
    }
    else {
      presenceData.details = authorName ? `Viewing post by @${authorName}` : 'Viewing a Post'
      const title = cleanTitle(document.title)
      presenceData.state = title && title !== 'Fumoshare' ? title.slice(0, 128) : 'Admiring a Fumo'
    }

    if (showButtons) {
      presenceData.buttons = [
        { label: 'View Post', url: href },
      ]
    }
  }
  // Route: FumoDex
  else if (pathname === '/fumodex') {
    const searchParam = searchParams.get('q') || searchParams.get('search')
    const searchInput = document.querySelector<HTMLInputElement>('input[type="search"], input[name="q"]')
    const query = privacy ? undefined : (searchParam || searchInput?.value)

    presenceData.details = 'Browsing FumoDex'
    presenceData.state = query ? `Searching: "${query}"` : 'Plushie Catalog'

    if (showButtons) {
      presenceData.buttons = [
        { label: 'Browse FumoDex', url: 'https://fumoshare.com/fumodex' },
      ]
    }
  }
  else if (pathname.startsWith('/fumodex/')) {
    const heading = document.querySelector('h1')?.textContent?.trim()
    const pageTitle = cleanTitle(document.title)
    const fumoName = heading || pageTitle

    presenceData.details = 'Viewing FumoDex'
    presenceData.state = fumoName && fumoName !== 'FumoDex' ? fumoName.slice(0, 128) : 'Plushie Details'

    if (showButtons) {
      presenceData.buttons = [
        { label: 'View Fumo', url: href },
        { label: 'FumoDex Catalog', url: 'https://fumoshare.com/fumodex' },
      ]
    }
  }
  // Route: Preorders Radar
  else if (pathname.startsWith('/radar')) {
    presenceData.details = 'Checking Preorders Radar'
    presenceData.state = 'Gift Fumo Releases & Batches'

    if (showButtons) {
      presenceData.buttons = [
        { label: 'Check Preorders', url: 'https://fumoshare.com/radar' },
      ]
    }
  }
  // Route: Global Sighting Map
  else if (pathname.startsWith('/map')) {
    presenceData.details = 'Exploring Global Map'
    presenceData.state = 'Fumo sightings worldwide'

    if (showButtons) {
      presenceData.buttons = [
        { label: 'Explore Map', url: 'https://fumoshare.com/map' },
      ]
    }
  }
  // Route: Articles
  else if (pathname === '/articles') {
    presenceData.details = 'Reading Articles'
    presenceData.state = 'News & Community Guides'

    if (showButtons) {
      presenceData.buttons = [
        { label: 'Read Articles', url: 'https://fumoshare.com/articles' },
      ]
    }
  }
  else if (pathname.startsWith('/articles/')) {
    const articleTitle = document.querySelector('h1')?.textContent?.trim() || cleanTitle(document.title)
    presenceData.details = 'Reading an Article'
    presenceData.state = articleTitle ? articleTitle.slice(0, 128) : 'Community Article'

    if (showButtons) {
      presenceData.buttons = [
        { label: 'Read Article', url: href },
        { label: 'All Articles', url: 'https://fumoshare.com/articles' },
      ]
    }
  }
  // Route: User Profile
  else if (pathname.startsWith('/profile/') || pathname.startsWith('/user/')) {
    const userSlug = pathname.split('/')[2]
    const displayName = document.querySelector('h1')?.textContent?.trim()
    const username = displayName || (userSlug ? `@${userSlug}` : undefined)

    presenceData.details = 'Viewing Profile'
    presenceData.state = privacy ? 'Collector Profile' : (username ? `${username}'s Collection` : 'Collector Profile')

    if (showButtons) {
      presenceData.buttons = [
        { label: 'View Profile', url: href },
      ]
    }
  }
  // Route: FumoMaker
  else if (pathname.startsWith('/fumomaker')) {
    presenceData.details = 'Creating a Fumo'
    presenceData.state = 'Designing in FumoMaker'

    if (showButtons) {
      presenceData.buttons = [
        { label: 'Try FumoMaker', url: 'https://fumoshare.com/fumomaker' },
      ]
    }
  }
  // Route: FumoSnap
  else if (pathname.startsWith('/fumosnap')) {
    presenceData.details = 'Photo Studio'
    presenceData.state = 'Editing with FumoSnap'

    if (showButtons) {
      presenceData.buttons = [
        { label: 'Open FumoSnap', url: 'https://fumoshare.com/fumosnap' },
      ]
    }
  }
  // Route: Stories
  else if (pathname.startsWith('/stories')) {
    presenceData.details = 'Watching Fumo Stories'
    presenceData.state = '24h Ephemeral Stories'

    if (showButtons) {
      presenceData.buttons = [
        { label: 'Watch Stories', url: 'https://fumoshare.com/feed' },
      ]
    }
  }
  // Route: Rules
  else if (pathname.startsWith('/rules')) {
    presenceData.details = 'Reading Community Rules'
    presenceData.state = 'Guidelines & Etiquette'

    if (showButtons) {
      presenceData.buttons = [
        { label: 'Read Rules', url: 'https://fumoshare.com/rules' },
      ]
    }
  }
  // Route: Leaderboard
  else if (pathname.includes('/leaderboard')) {
    presenceData.details = 'Viewing Leaderboard'
    presenceData.state = 'Top Fumo Collectors'

    if (showButtons) {
      presenceData.buttons = [
        { label: 'View Leaderboard', url: href },
      ]
    }
  }
  // Fallback
  else {
    const pageTitle = cleanTitle(document.title)
    presenceData.details = 'Browsing Fumoshare'
    presenceData.state = pageTitle && pageTitle !== 'Fumoshare' ? pageTitle.slice(0, 128) : 'Fumo Plushie Community'
  }

  presence.setActivity(presenceData)
})
