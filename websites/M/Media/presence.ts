import { ActivityType } from 'premid'

// NOTE: Since Discord proxies all status images, it cannot fetch local files (like localhost or media.siqnole.dev if it's local).
// Replace the URL below with a publicly hosted URL of your logo (e.g. uploaded to Imgur or Discord CDN) to resolve "No Image".
const APP_LOGO_URL = 'https://media.siqnole.dev/mydia.png'

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

  // Identify active Now Live items and scrape their cover art URL if available
  let activeMedia: { label: string, title: string, sub: string, coverUrl: string | null } | null = null

  if (pathname.startsWith('/@')) {
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
  }

  if (activeMedia) {
    const { label, title, sub, coverUrl } = activeMedia
    const profileUser = pathname.substring(2)
    const stateText = sub ? `${title} (${sub})` : title

    // Use the scraped cover art as the large image, and pin the app logo in the corner as the small image!
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
      // playing / reading - Non-media (ActivityType.Playing). No largeImageText is allowed in PreMiD.
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
    // Non-media state (browsing) - No largeImageText allowed!
    let details = 'Browsing'
    let state = 'Home'

    if (pathname === '/') {
      details = 'Browsing Landing Page'
      state = 'Welcome to Media'
    }
    else if (pathname === '/home') {
      details = 'Checking Feed'
      state = 'Browsing recent activity'
    }
    else if (pathname === '/login') {
      details = 'Logging In'
      state = 'Authenticating'
    }
    else if (pathname === '/register') {
      details = 'Creating Account'
      state = 'Joining the platform'
    }
    else if (pathname === '/shop') {
      details = 'Browsing the Shop'
      state = 'Checking out cosmetics'
    }
    else if (pathname === '/admin') {
      details = 'Managing Platform'
      state = 'Admin Dashboard'
    }
    else if (pathname.startsWith('/@')) {
      const profileUser = pathname.substring(2)
      details = `Viewing @${profileUser}'s profile`
      state = 'Viewing profile'
    }

    presenceData = {
      largeImageKey: APP_LOGO_URL,
      startTimestamp: browsingTimestamp,
      type: ActivityType.Playing,
      details,
      state,
    }
  }

  if (presenceData.details) {
    presence.setActivity(presenceData)
  }
  else {
    presence.clearActivity()
  }
})
