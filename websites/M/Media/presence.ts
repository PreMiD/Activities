import { ActivityType } from 'premid'

// NOTE: Since Discord proxies all status images, it cannot fetch local files (like localhost or media.siqnole.dev if it's local).
// Replace the URL below with a publicly hosted URL of your logo (e.g. uploaded to Imgur or Discord CDN) to resolve "No Image".
const APP_LOGO_URL = 'https://i.imgur.com/BGqdEko.png'

const presence = new Presence({
  clientId: '1511807266913910855',
})

let browsingTimestamp = Math.floor(Date.now() / 1000)
let lastPath = ''

presence.on('UpdateData', async () => {
  const { pathname } = document.location

  // Reset timestamp when switching major pages
  if (pathname !== lastPath) {
    browsingTimestamp = Math.floor(Date.now() / 1000)
    lastPath = pathname
  }

  let presenceData: PresenceData

  // Check if any modal is open
  const modalOverlay = document.querySelector('.modal-overlay.open')
  if (modalOverlay) {
    const modalTitle = modalOverlay.querySelector('.modal-title')?.textContent?.trim() || ''
    const quickRateTitle = modalOverlay.querySelector('h3')?.textContent?.trim() || ''

    if (modalTitle.includes('Customize Profile')) {
      // 1. Customize Profile Modal
      const activeTab = modalOverlay.querySelector('.tabs .tab-btn.active')?.textContent?.trim() || 'Settings'
      presenceData = {
        largeImageKey: APP_LOGO_URL,
        startTimestamp: browsingTimestamp,
        type: ActivityType.Playing,
        details: 'Customizing Profile',
        state: `Editing: ${activeTab}`,
      }
    }
    else if (quickRateTitle.includes('Quick Rate')) {
      // 2. Quick Rate Modal
      const itemTitle = modalOverlay.querySelector('.quick-rate-card h4')?.textContent?.trim() || ''
      const itemMeta = modalOverlay.querySelector('.quick-rate-card h4 + span')?.textContent?.trim() || ''

      let state = 'No unrated items left'
      if (itemTitle) {
        state = `Rating: ${itemTitle}`
        if (itemMeta) {
          state += ` (${itemMeta})`
        }
      }

      presenceData = {
        largeImageKey: APP_LOGO_URL,
        startTimestamp: browsingTimestamp,
        type: ActivityType.Playing,
        details: 'Quick Rating Items',
        state,
      }
    }
    else if (modalTitle.includes('Media Overview')) {
      // 3. Media Overview / Item Details Modal
      const title = modalOverlay.querySelector('.modal-grid-two-cols h3')?.textContent?.trim() || ''
      const meta = modalOverlay.querySelector('.modal-grid-two-cols h3 + div')?.textContent?.trim() || ''
      const category = modalOverlay.querySelector('.modal-grid-two-cols strong')?.textContent?.trim() || ''
      const imgEl = modalOverlay.querySelector('.modal-grid-two-cols .cover img') as HTMLImageElement | null
      const coverUrl = (imgEl && imgEl.src) ? imgEl.src : null

      const stateText = meta ? `${title} (${meta})` : title
      const largeImage = coverUrl || APP_LOGO_URL
      const smallImage = coverUrl ? APP_LOGO_URL : undefined

      // Map category to the correct Discord Activity Type
      const lowerCategory = category.toLowerCase()
      if (lowerCategory.includes('music') || lowerCategory.includes('album')) {
        presenceData = {
          largeImageKey: largeImage,
          largeImageText: `Category: ${category}`,
          smallImageKey: smallImage,
          smallImageText: 'media.siqnole.dev',
          startTimestamp: browsingTimestamp,
          type: ActivityType.Listening,
          details: `Browsing Album:`,
          state: stateText,
        }
      }
      else if (lowerCategory.includes('watching') || lowerCategory.includes('film') || lowerCategory.includes('movie') || lowerCategory.includes('show')) {
        presenceData = {
          largeImageKey: largeImage,
          largeImageText: `Category: ${category}`,
          smallImageKey: smallImage,
          smallImageText: 'media.siqnole.dev',
          startTimestamp: browsingTimestamp,
          type: ActivityType.Watching,
          details: `Viewing Movie Info:`,
          state: stateText,
        }
      }
      else {
        // playing / reading - Non-media (ActivityType.Playing). No largeImageText is allowed in PreMiD.
        presenceData = {
          largeImageKey: largeImage,
          smallImageKey: smallImage,
          smallImageText: 'media.siqnole.dev',
          startTimestamp: browsingTimestamp,
          type: ActivityType.Playing,
          details: lowerCategory.includes('playing') || lowerCategory.includes('game') || lowerCategory.includes('steam') ? 'Viewing Game Info:' : 'Viewing Book Info:',
          state: stateText,
        }
      }
    }
    else {
      // Default fallback for other modals (e.g. Bug Report Modal)
      presenceData = {
        largeImageKey: APP_LOGO_URL,
        startTimestamp: browsingTimestamp,
        type: ActivityType.Playing,
        details: 'Browsing Details',
        state: modalTitle || 'Viewing details',
      }
    }
  }
  else {
    // No modal is open - standard route views
    if (pathname === '/') {
      presenceData = {
        largeImageKey: APP_LOGO_URL,
        startTimestamp: browsingTimestamp,
        type: ActivityType.Playing,
        details: 'Browsing Landing Page',
        state: 'Welcome to Media',
      }
    }
    else if (pathname === '/home') {
      presenceData = {
        largeImageKey: APP_LOGO_URL,
        startTimestamp: browsingTimestamp,
        type: ActivityType.Playing,
        details: 'Checking Feed',
        state: 'Browsing recent activity',
      }
    }
    else if (pathname === '/shop') {
      presenceData = {
        largeImageKey: APP_LOGO_URL,
        startTimestamp: browsingTimestamp,
        type: ActivityType.Playing,
        details: 'Browsing the Shop',
        state: 'Checking out cosmetics',
      }
    }
    else if (pathname === '/admin') {
      presenceData = {
        largeImageKey: APP_LOGO_URL,
        startTimestamp: browsingTimestamp,
        type: ActivityType.Playing,
        details: 'Managing Platform',
        state: 'Admin Dashboard',
      }
    }
    else if (pathname.startsWith('/@')) {
      const profileUser = pathname.substring(2)

      // Identify active Now Live items
      let activeMedia: { label: string, title: string, sub: string, coverUrl: string | null } | null = null
      const firstNowItem = document.querySelector('.now-grid .now-item')
      if (firstNowItem) {
        const label = firstNowItem.querySelector('.now-label')?.textContent?.trim().toLowerCase() || ''
        const title = firstNowItem.querySelector('.now-title')?.textContent?.trim() || ''
        const sub = firstNowItem.querySelector('.now-sub')?.textContent?.trim() || ''

        // Scrape cover image if it exists (e.g., Spotify, Steam, or custom reading cover)
        const imgEl = firstNowItem.querySelector('.now-art img') as HTMLImageElement | null
        const coverUrl = (imgEl && imgEl.src) ? imgEl.src : null

        if (title) {
          activeMedia = { label, title, sub, coverUrl }
        }
      }

      if (activeMedia) {
        // Dynamic live activity
        const { label, title, sub, coverUrl } = activeMedia
        const stateText = sub ? `${title} (${sub})` : title
        const largeImage = coverUrl || APP_LOGO_URL
        const smallImage = coverUrl ? APP_LOGO_URL : undefined

        if (label.includes('listening')) {
          presenceData = {
            largeImageKey: largeImage,
            largeImageText: `Viewing @${profileUser}'s profile`,
            smallImageKey: smallImage,
            smallImageText: 'media.siqnole.dev',
            startTimestamp: browsingTimestamp,
            type: ActivityType.Listening,
            details: `Listening to:`,
            state: stateText,
          }
        }
        else if (label.includes('watching') || label.includes('film') || label.includes('movie')) {
          presenceData = {
            largeImageKey: largeImage,
            largeImageText: `Viewing @${profileUser}'s profile`,
            smallImageKey: smallImage,
            smallImageText: 'media.siqnole.dev',
            startTimestamp: browsingTimestamp,
            type: ActivityType.Watching,
            details: `Watching:`,
            state: stateText,
          }
        }
        else {
          // playing / reading
          presenceData = {
            largeImageKey: largeImage,
            smallImageKey: smallImage,
            smallImageText: 'media.siqnole.dev',
            startTimestamp: browsingTimestamp,
            type: ActivityType.Playing,
            details: label.includes('playing') || label.includes('steam') ? 'Playing:' : 'Reading:',
            state: stateText,
          }
        }
      }
      else {
        // No live activity - show current shelf tab details
        const activeTabLabel = document.querySelector('.tabs .tab-btn.active')?.textContent?.trim() || ''
        const activeSubtabLabel = document.querySelector('.shelf-controls-bar .tab-btn.active')?.textContent?.trim() || ''

        let state = 'Viewing profile'
        if (activeTabLabel) {
          state = `Browsing: ${activeTabLabel}`
          if (activeSubtabLabel) {
            state += ` (${activeSubtabLabel})`
          }
        }

        presenceData = {
          largeImageKey: APP_LOGO_URL,
          startTimestamp: browsingTimestamp,
          type: ActivityType.Playing,
          details: `Viewing @${profileUser}'s profile`,
          state,
        }
      }
    }
    else {
      presenceData = {
        largeImageKey: APP_LOGO_URL,
        startTimestamp: browsingTimestamp,
        type: ActivityType.Playing,
        details: 'Browsing media.siqnole.dev',
        state: 'Home',
      }
    }
  }

  if (presenceData.details) {
    presence.setActivity(presenceData)
  }
  else {
    presence.clearActivity()
  }
})
