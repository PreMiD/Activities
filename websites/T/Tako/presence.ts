const presence = new Presence({
  clientId: '1444590844404564102',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/T/Tako/assets/logo.jpeg',
}

const browsingTimestamp = Math.floor(Date.now() / 1000)

function formatTagSlug(slug: string): string {
  // Replace underscores with spaces.
  const formatted = slug.replace(/_/g, ' ')

  // Convert to title case.
  return formatted.toLowerCase().split(' ').map((word) => {
    return word.charAt(0).toUpperCase() + word.slice(1)
  }).join(' ')
}

presence.on('UpdateData', () => {
  const url = document.location.href
  const path = document.location.pathname
  const title = document.title
  const host = document.location.hostname

  const ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]')
  const primaryTitle = ogTitle?.content?.trim() || title.split('|')[0]?.trim()

  const presenceData: PresenceData = {
    startTimestamp: browsingTimestamp,
    largeImageKey: ActivityAssets.Logo,
  }

  // Get creator name and profil pic
  const creatorNameElement = document.querySelector('header h1')
  const creatorImageElement = document.querySelector('img.rounded-2xl.ring-grayscale-50')

  const creatorName = creatorNameElement?.textContent?.trim()

  let creatorImageUrl = creatorImageElement?.getAttribute('src')

  if (creatorImageUrl) {
    if (!creatorImageUrl.startsWith('http')) {
      creatorImageUrl = `https://tako.id${creatorImageUrl}`
    }

    if (creatorImageUrl.includes('dicebear.com') && creatorImageUrl.includes('/svg')) {
      creatorImageUrl = creatorImageUrl.replace('/svg', '/png')
    }
  }

  // Help pages
  if (host.includes('help.tako.id')) {
    presenceData.details = 'Reading Article'

    if (path === '/' || path === '/en/' || path === '/id/' || path === '/en' || path === '/id') {
      presenceData.state = 'Tako Help Center'
    }
    else {
      presenceData.state = primaryTitle || 'Unknown Article'
    }
  }

  // Auth pages
  else if (
    path.includes('login')
    || path.includes('register')
    || path.includes('reset-password')
    || path.includes('resend-verification')
  ) {
    presenceData.details = 'In Account Session'

    if (path.includes('register')) {
      presenceData.state = 'Registering'
    }
    else if (path.includes('reset-password')) {
      presenceData.state = 'Resetting Password'
    }
    else if (path.includes('resend-verification')) {
      presenceData.state = 'Awaiting Verification'
    }
    else {
      presenceData.state = 'Logging In'
    }
  }

  // Payment page
  else if (path.includes('/pay')) {
    presenceData.details = 'Processing Payment'
    presenceData.state = 'Awaiting Payment'
  }

  // Top up page
  else if (path.includes('/topup')) {
    presenceData.details = 'Top Up Balance'
    presenceData.state = 'Choosing Amount'
  }

  // Creator tools pages
  else if (path.includes('/c/')) {
    presenceData.details = 'Viewing Creator Tools'

    if (path.includes('/overlay/')) {
      if (path.includes('/overlay/alert')) {
        presenceData.state = 'Configuring Alerts'
      }
      else if (path.includes('/overlay/leaderboard')) {
        presenceData.state = 'Configuring Leaderboard'
      }
      else if (path.includes('/overlay/qr-code')) {
        presenceData.state = 'Configuring QR Code'
      }
      else if (path.includes('/overlay/mediashare')) {
        presenceData.state = 'Configuring Media Share'
      }
      else if (path.includes('/overlay/timer')) {
        presenceData.state = 'Configuring Timer'
      }
      else if (path.includes('/overlay/soundboard')) {
        presenceData.state = 'Configuring Soundboard'
      }
      else if (path.includes('/overlay/songshare')) {
        presenceData.state = 'Configuring Song Share'
      }
      else if (path.includes('/overlay/milestone')) {
        presenceData.state = 'Configuring Milestones'
      }
      else if (path.includes('/overlay/polling')) {
        presenceData.state = 'Creating Polls'
      }
      else if (path.includes('/overlay/running-text')) {
        presenceData.state = 'Configuring Running Text'
      }
      else if (path.includes('/overlay/gacha')) {
        presenceData.state = 'Configuring Gacha'
      }
      else if (path.includes('/overlay/vipqueue')) {
        presenceData.state = 'Configuring VIP Queue'
      }
      else {
        presenceData.state = 'Viewing Overlay Manager'
      }
    }

    else if (path.includes('/filters')) {
      presenceData.state = 'Configuring Filters/Moderation'
    }
    else if (path.includes('/gifts')) {
      presenceData.state = 'Configuring Gift Box'
    }
    else if (path.includes('/overlay-control')) {
      presenceData.state = 'Configuring Live Overlays'
    }
    else if (path.includes('/withdrawal')) {
      presenceData.state = 'Processing Withdrawal'
    }
    else if (path.includes('/bans')) {
      presenceData.state = 'Blocking Users'
    }
    else if (path.includes('/bio-link')) {
      presenceData.state = 'Configuring Bio Link'
    }
    else if (path.includes('/team-members')) {
      presenceData.state = 'Configuring Team Members'
    }
    else if (path.includes('/club')) {
      presenceData.state = 'Configuring Club'
    }
    else if (path.includes('/integrations')) {
      presenceData.state = 'Configuring Integrations'
    }
    else if (path.includes('/statistics')) {
      presenceData.state = 'Checking Statistics'
    }
    else if (path.includes('/stickers')) {
      presenceData.state = 'Configuring Custom Stickers'
    }
    else if (path.includes('/gift-units')) {
      presenceData.state = 'Configuring Reward Units'
    }
    else if (path.includes('/auctions')) {
      presenceData.state = 'Configuring Auctions'
    }
    else {
      presenceData.details = 'Viewing Creator Dashboard'
      presenceData.state = 'Editing Profile'
    }
  }

  // Settings pages
  else if (
    path.includes('/settings')
    || path === '/me'
    || path.startsWith('/me/')
  ) {
    presenceData.details = 'Managing Account'

    if (path.includes('/transactions')) {
      presenceData.state = 'Viewing Transactions'
    }
    else if (path.includes('/sessions')) {
      presenceData.state = 'Checking Security Sessions'
    }
    else if (path === '/me' || path.startsWith('/me/')) {
      presenceData.state = 'Viewing Profile Settings'
    }
    else {
      presenceData.state = 'Checking Settings'
    }
  }

  // Club pages
  else if (path.startsWith('/club')) {
    if (path === '/club') {
      presenceData.details = 'Exploring Clubs'

      const searchParams = new URLSearchParams(location.search)
      const tab = searchParams.get('tab')
      const searchQuery = searchParams.get('search')
      const page = searchParams.get('page')

      presenceData.largeImageKey = ActivityAssets.Logo

      if (searchQuery) {
        presenceData.state = `Searching: ${searchQuery}`
      }
      else if (tab === 'owned') {
        presenceData.state = 'Club I Own'
      }
      else if (tab === 'joined') {
        presenceData.state = 'Club I Join'
      }
      else if (tab === 'create') {
        presenceData.state = 'Creating a Club'
      }

      if (page) {
        if (presenceData.state) {
          presenceData.state += ` (Page ${page})`
        }
        else {
          presenceData.state = `(Page ${page})`
        }
      }
    }
    // Club details
    else {
      const searchParams = new URLSearchParams(location.search)
      const searchQuery = searchParams.get('search')
      const page = searchParams.get('page')

      if (path.includes('/members')) {
        presenceData.details = 'Viewing Club Members'
      }
      else {
        presenceData.details = 'Viewing Club'
      }

      presenceData.state = creatorName || primaryTitle || 'Unknown Club'

      if (searchQuery) {
        presenceData.state += ` | Searching: ${searchQuery}`
      }

      if (page) {
        presenceData.state += ` (Page ${page})`
      }

      if (creatorImageUrl) {
        presenceData.largeImageKey = creatorImageUrl
        presenceData.smallImageKey = ActivityAssets.Logo
      }

      // Clean URL parameters for the button.
      let clubBaseUrl = url.split('?')[0] || url
      clubBaseUrl = clubBaseUrl.split('/members')[0] || clubBaseUrl

      presenceData.buttons = [
        {
          label: 'View Club',
          url: clubBaseUrl,
        },
      ]
    }
  }

  // Creator profile pages
  else if (path.length > 2 && !path.includes('/login') && !path.includes('/explore') && (primaryTitle || creatorName)) {
    presenceData.details = 'Viewing Creator'
    presenceData.state = creatorName || primaryTitle || 'Unknown Creator'

    if (creatorImageUrl) {
      presenceData.largeImageKey = creatorImageUrl
    }

    presenceData.smallImageKey = ActivityAssets.Logo

    // Clean URL parameters for the button
    let creatorBaseUrl = url.split('?')[0] || url
    creatorBaseUrl = creatorBaseUrl.split('/auctions')[0] || creatorBaseUrl
    creatorBaseUrl = creatorBaseUrl.split('/soundboard')[0] || creatorBaseUrl

    presenceData.buttons = [
      {
        label: 'View Creator',
        url: creatorBaseUrl,
      },
    ]
  }

  // Explore pages
  else if (path.startsWith('/explore')) {
    const searchParams = new URLSearchParams(location.search)
    const tab = searchParams.get('tab')
    const tags = searchParams.get('tags')
    const searchQuery = searchParams.get('search')
    const page = searchParams.get('page')

    presenceData.details = 'Exploring Creators'

    if (searchQuery) {
      presenceData.state = `Searching: ${searchQuery}`
    }
    else if (tags && tab) {
      const cleanTag = formatTagSlug(tags)
      presenceData.details = `Viewing Tag: ${cleanTag}`

      if (tab === 'followed') {
        presenceData.state = 'Followed Creators'
      }
      else if (tab === 'trending') {
        presenceData.state = 'Trending Creators'
      }
      else if (tab === 'featured') {
        presenceData.state = 'Featured Creators'
      }
    }
    else if (tab === 'followed') {
      presenceData.state = 'Followed'
    }
    else if (tab === 'trending') {
      presenceData.state = 'Trending'
    }
    else if (tab === 'featured') {
      presenceData.state = 'Featured'
    }
    else if (tags) {
      const cleanTag = formatTagSlug(tags)
      presenceData.state = `Viewing Tag: ${cleanTag}`
    }
    else {
      presenceData.state = 'All Categories'
    }

    if (page) {
      presenceData.state += ` (Page ${page})`
    }
  }

  // Homepage
  else if (path === '/' || path.length <= 2) {
    presenceData.details = 'Viewing Homepage'
    presenceData.state = 'Tako Platform'
  }

  // Default fallback
  else {
    presenceData.details = 'Exploring Tako'
    presenceData.state = 'Unknown Page'
  }

  if (presenceData.details) {
    presence.setActivity(presenceData)
  }
  else {
    presence.clearActivity()
  }
})
