const presence = new Presence({
  clientId: '1444590844404564102',
})

enum ActivityAssets {
  Logo = 'https://i.imgur.com/eva2pp3.jpeg',
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
  const creatorNameElement = document.querySelector('body > main > main > main > header > form > section > div.flex.w-full.items-center.gap-2.overflow-hidden > h1')
  const creatorImageElement = document.querySelector('body > main > main > main > header > form > section > div.flex.w-full.items-center.gap-2.overflow-hidden > img.size-9.rounded-full.object-cover.object-center')

  const creatorName = creatorNameElement?.textContent?.trim()
  const creatorImageUrl = creatorImageElement?.getAttribute('src')

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
    else if (path.includes('/integrations')) {
      presenceData.state = 'Configuring Integrations'
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
    || path.includes('/me')
  ) {
    presenceData.details = 'Managing Account'

    if (path.includes('/transactions')) {
      presenceData.state = 'Viewing Transactions'
    }
    else if (path.includes('/sessions')) {
      presenceData.state = 'Checking Security Sessions'
    }
    else if (path.includes('/me')) {
      presenceData.state = 'Viewing Profile Settings'
    }
    else {
      presenceData.state = 'Checking Settings'
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
    presenceData.buttons = [
      {
        label: 'View Creator',
        url,
      },
    ]
  }

  // Explore pages
  else if (path.startsWith('/explore')) {
    const searchParams = new URLSearchParams(location.search)
    const tab = searchParams.get('tab')
    const tags = searchParams.get('tags')
    const searchQuery = searchParams.get('search')

    presenceData.details = 'Exploring Creators'

    if (searchQuery) {
      presenceData.state = `Searching: ${searchQuery}`
    }
    else if (tab === 'followed') {
      presenceData.state = 'Viewing Followed Creators'
    }
    else if (tab === 'trending') {
      presenceData.state = 'Viewing Trending Creators'
    }
    else if (tab === 'featured') {
      presenceData.state = 'Viewing Featured Creators'
    }
    else if (tags) {
      const cleanTag = formatTagSlug(tags)
      presenceData.state = `Viewing Tag: ${cleanTag}`
    }
    else {
      presenceData.state = 'Viewing All Categories'
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
