import { ActivityType } from 'premid'

// Initialize PreMiD presence
const presence = new Presence({
  clientId: '1422257981168291940',
})

// Browsing timestamp for showing elapsed time
const browsingTimestamp = Math.floor(Date.now() / 1000)

// Asset constants for images
enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/F/FMHY/assets/0.png',
}

// Map known paths to friendly activity text
const pathStates: Record<string, string> = {
  '/': 'Homepage',
  '/ai': 'Exploring AI Section',
  '/audio': 'Browsing Audio Tools',
  '/beginners-guide': 'Reading Beginner’s Guide',
  '/developer-tools': 'Checking Developer Tools',
  '/downloading': 'Browsing Downloading Guides',
  '/educational': 'Browsing Educational Section',
  '/feedback': 'Giving Feedback',
  '/file-tools': 'Exploring File Tools',
  '/gaming-tools': 'Browsing Gaming Tools',
  '/gaming': 'Browsing Gaming Section',
  '/image-tools': 'Exploring Image Tools',
  '/internet-tools': 'Browsing Internet Tools',
  '/linux-macos': 'Browsing Linux & macOS Guides',
  '/misc': 'Exploring Miscellaneous',
  '/mobile': 'Browsing Mobile Tools',
  '/non-english': 'Browsing Non-English Guides',
  '/posts': 'Reading Posts',
  '/privacy': 'Reading Privacy Section',
  '/reading': 'Browsing Reading Section',
  '/sandbox': 'Exploring Sandbox Section',
  '/social-media-tools': 'Browsing Social Media Tools',
  '/startpage': 'Reading Start Page',
  '/storage': 'Browsing Storage Tools',
  '/system-tools': 'Exploring System Tools',
  '/text-tools': 'Browsing Text Tools',
  '/torrenting': 'Browsing Torrenting Section',
  '/unsafe': 'Browsing Unsafe Section',
  '/video-tools': 'Browsing Video Tools',
  '/video': 'Watching Videos Section',
}

// Update presence on page changes
presence.on('UpdateData', async () => {
  // Normalize pathname: remove query, extra slashes, lowercase
  let { pathname } = document.location
  pathname = pathname?.split('?')[0]?.replace(/\/+/g, '/').replace(/\/$/, '').toLowerCase() ?? ''
  if (pathname === '')
    pathname = '/'

  // Determine state from known paths
  let state = pathStates[pathname]

  // Handle dynamic /other/* pages with friendly wording
  if (!state && pathname.startsWith('/other/')) {
    const pagePart = pathname.split('/other/')[1] ?? ''
    if (pagePart.length > 0) {
      const words = pagePart.split('-').filter(Boolean)
      const capitalized = words.map(w => w.charAt(0).toUpperCase() + w.slice(1))
      const pageName = capitalized.join(' ')
      if (pageName.length > 0)
        state = `Looking for ${pageName}`
    }
  }

  // Build presence data
  const presenceData = {
    largeImageKey: ActivityAssets.Logo,
    details: 'Free Media Heck Yeah',
    startTimestamp: browsingTimestamp,
    state: state ?? 'Browsing fmhy.net',
    type: ActivityType.Watching,
  }

  // Set the activity
  presence.setActivity(presenceData)
})
