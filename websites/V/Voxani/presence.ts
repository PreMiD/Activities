import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1481368310590210119',
})

enum ActivityAssets {
  Logo = 'https://cdn.imgchest.com/files/768ba0ac0c7a.png',
}

// helper: turn a url slug like "one-piece-100" into "One Piece"
function formatSlug(raw: string): string {
  return decodeURIComponent(raw)
    .split('?')[0]!
    .replace(/-\d+$/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

// helper: try to pull a clean anime name from document.title
function getNameFromTitle(slugName: string): string {
  if (!document.title.includes(' - Watch Online')) {
    return ''
  }
  const titleName = document.title.split(' - Watch Online')[0]?.trim() || ''
  const a = titleName.toLowerCase().replace(/[^a-z0-9]/g, '')
  const b = slugName.toLowerCase().replace(/[^a-z0-9]/g, '')
  return (a && b && a.includes(b.slice(0, 8))) ? titleName : ''
}

let browsingTimestamp = Math.floor(Date.now() / 1000)
let lastPath = ''

presence.on('UpdateData', async () => {
  const { pathname, href } = document.location
  const showButtons = await presence.getSetting<boolean>('showPresenceButtons')

  // reset timer on SPA navigation & clear old data to stop flickering
  if (pathname !== lastPath) {
    browsingTimestamp = Math.floor(Date.now() / 1000)
    lastPath = pathname
  }

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    type: ActivityType.Watching,
    smallImageKey: Assets.Reading,
    smallImageText: 'Voxani',
  }

  // watch page
  if (pathname.startsWith('/watch/')) {
    const video = document.querySelector('video') as HTMLVideoElement | null
    delete presenceData.smallImageKey
    delete presenceData.smallImageText

    const slugName = formatSlug(pathname.split('/')[2] || '')
    const animeName
      = getNameFromTitle(slugName)
        || document.querySelector('div.flex-1.min-w-0.text-right > span.font-medium')?.textContent?.trim()
        || slugName
        || 'Anime'

    const poster = document.querySelector('[data-poster]')?.getAttribute('data-poster')
    if (poster) {
      presenceData.largeImageKey = poster
    }

    presenceData.name = animeName

    // episode info
    const epText = document.querySelector('h1.font-display')?.textContent?.trim() || ''
    const epMatch = epText.match(/Episode\s+(\d+)/i)
    const epNum = epMatch ? epMatch[1] || '1' : '1'
    const epTitle = document.querySelector('.text-muted-foreground.text-sm.mt-1.line-clamp-1')?.textContent?.trim()

    // single episode = movie
    const epBtns = document.getElementById('episode-list-container')?.querySelectorAll('button')
    if (epBtns && epBtns.length === 1) {
      presenceData.details = animeName
      presenceData.state = 'Watching Movie'
    }
    else {
      presenceData.details = animeName
      if (epTitle) {
        presenceData.state = epTitle
      }
      const sMatch = animeName.match(/Season\s+(\d+)/i)
      presenceData.largeImageText = `Season ${sMatch ? sMatch[1] || '1' : '1'}, Episode ${epNum}`
    }

    // playback state
    if (video && video.readyState > 0) {
      if (!video.paused) {
        presenceData.smallImageKey = Assets.Play
        presenceData.smallImageText = 'Playing'
        ;[presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(
          Math.floor(video.currentTime),
          Math.floor(video.duration),
        )
      }
      else {
        presenceData.smallImageKey = Assets.Pause
        presenceData.smallImageText = 'Paused'
      }
    }
    else {
      presenceData.startTimestamp = browsingTimestamp
    }

    if (showButtons) {
      presenceData.buttons = [{ label: 'Watch Episode', url: href }]
    }
  }
  else if (pathname.startsWith('/anime/')) {
    const slugName = formatSlug(pathname.split('/')[2] || '')
    const title
      = getNameFromTitle(slugName)
        || document.querySelector('h1.font-display')?.textContent?.trim()
        || slugName
        || 'Anime'

    const poster = document.querySelector('[data-poster]')?.getAttribute('data-poster')
    if (poster) {
      presenceData.largeImageKey = poster
    }

    presenceData.details = 'Looking'
    presenceData.state = title
    presenceData.startTimestamp = browsingTimestamp

    if (showButtons) {
      presenceData.buttons = [{ label: 'View Anime', url: href }]
    }
  }
  // search
  else if (pathname.startsWith('/search') || pathname.startsWith('/image-search')) {
    presenceData.details = 'Searching Anime'
    presenceData.state = 'Exploring Catalog'
    presenceData.smallImageKey = Assets.Search
    presenceData.startTimestamp = browsingTimestamp
  }
  // trending
  else if (pathname.startsWith('/trending')) {
    const activeBtn = document.querySelector('button[class*="bg-primary"]')
    const txt = activeBtn?.textContent?.trim() || ''
    presenceData.details = 'Trending Anime'
    presenceData.state = ['Today', 'This Week', 'This Month', 'All Time'].includes(txt) ? txt : 'What\'s Hot Right Now'
    presenceData.startTimestamp = browsingTimestamp
  }
  // profile
  else if (pathname === '/profile' || pathname.startsWith('/user/') || pathname.startsWith('/@')) {
    let userName = ''
    if (pathname.startsWith('/@')) {
      userName = decodeURIComponent(pathname.substring(2))
    }
    else if (pathname.startsWith('/user/')) {
      userName = decodeURIComponent(pathname.split('/')[2] || '')
    }

    if (!userName) {
      const t = document.querySelector<HTMLElement>('span[class*="text-muted"]')?.textContent?.trim() || ''
      if (t.startsWith('@') && t.length > 2) {
        userName = t.substring(1)
      }
    }

    presenceData.details = 'Viewing Profile'
    presenceData.state = userName ? `@${userName}` : 'My Profile'
    presenceData.startTimestamp = browsingTimestamp
  }
  // my lists (favorites)
  else if (pathname.startsWith('/favorites')) {
    const activeTab = document.querySelector('button[aria-selected="true"], [data-state="active"]')
      ?? document.querySelector('button[class*="bg-primary"][class*="text-primary-foreground"]')
      ?? document.querySelector('button[class*="bg-white"][class*="text-black"]')
    const tab = activeTab?.textContent?.trim() || ''

    presenceData.details = 'Browsing Library'
    presenceData.state = tab ? `My Lists · ${tab}` : 'My Lists'
    presenceData.startTimestamp = browsingTimestamp
  }
  // collections
  else if (pathname.startsWith('/collections')) {
    const mobileActive = document.querySelector('[role="tablist"] [data-state="active"]')
    const desktopActive = document.querySelector('button[class*="bg-primary"][class*="text-primary-foreground"]')
    const tab = mobileActive?.textContent?.trim() || desktopActive?.textContent?.trim() || ''

    presenceData.details = 'Browsing Library'
    presenceData.state = tab ? `Collections · ${tab}` : 'Collections'
    presenceData.startTimestamp = browsingTimestamp
  }
  // playlists
  else if (pathname.startsWith('/playlists') || pathname.startsWith('/playlist/') || pathname.startsWith('/p/')) {
    presenceData.details = 'Browsing Library'
    if (pathname.includes('/playlist/') || pathname.includes('/p/')) {
      const name = document.querySelector('h1')?.textContent?.trim() || ''
      presenceData.state = name || 'Playlist'
    }
    else {
      presenceData.state = 'My Playlists'
    }
    presenceData.startTimestamp = browsingTimestamp
  }
  // continue watching
  else if (pathname.startsWith('/continue-watching')) {
    presenceData.details = 'Browsing Library'
    presenceData.state = 'Continue Watching'
    presenceData.startTimestamp = browsingTimestamp
  }
  // community
  else if (pathname.startsWith('/community')) {
    if (pathname.includes('/forum/new')) {
      presenceData.details = 'Community'
      presenceData.state = 'Creating Post'
    }
    else if (pathname.includes('/forum/')) {
      const t = document.querySelector<HTMLElement>('h1')?.textContent?.trim()
      presenceData.details = t ? `Reading: ${t}` : 'Reading Post'
      presenceData.state = 'Community Forum'
    }
    else {
      const activeNav = document.querySelector('[data-state="active"]')
      presenceData.details = 'Browsing Community'
      presenceData.state = activeNav?.textContent?.trim() || 'Exploring Discussions'
    }
    presenceData.startTimestamp = browsingTimestamp
  }
  // watch together
  else if (pathname.startsWith('/isshoni')) {
    presenceData.details = 'IsshoNi'
    presenceData.state = 'Watch Together'
    presenceData.startTimestamp = browsingTimestamp
  }
  // character page
  else if (pathname.startsWith('/char/')) {
    presenceData.details = document.querySelector<HTMLElement>('h1')?.textContent?.trim() || 'Character'
    presenceData.state = 'Viewing Character'
    presenceData.startTimestamp = browsingTimestamp
  }
  // tier lists
  else if (pathname.startsWith('/tierlists') || pathname.startsWith('/tierlist')) {
    presenceData.details = 'Community Rankings'
    presenceData.state = 'Viewing Tier Lists'
    presenceData.startTimestamp = browsingTimestamp
  }
  // ai recs
  else if (pathname.startsWith('/recommendations')) {
    presenceData.details = 'AI Recommendations'
    presenceData.state = 'Discovering Anime'
    presenceData.startTimestamp = browsingTimestamp
  }
  // genre browsing
  else if (pathname.startsWith('/genre/')) {
    presenceData.details = 'Exploring Genre'
    presenceData.state = formatSlug(pathname.split('/')[2] || '') || 'Genre'
    presenceData.startTimestamp = browsingTimestamp
  }
  // scene search (trace.moe)
  else if (pathname.startsWith('/trace')) {
    presenceData.details = 'Trace.moe Search'
    presenceData.state = 'Finding Scene'
    presenceData.startTimestamp = browsingTimestamp
  }
  // stats / wrapped
  else if (pathname.startsWith('/stats') || pathname.startsWith('/wrapped')) {
    presenceData.details = 'Viewing Statistics'
    presenceData.state = 'Voxani Wrapped'
    presenceData.startTimestamp = browsingTimestamp
  }
  // language filter
  else if (pathname.startsWith('/languages')) {
    presenceData.details = 'Language Filter'
    presenceData.state = pathname.split('/')[2]
      ? formatSlug(pathname.split('/')[2]!)
      : 'Browsing Languages'
    presenceData.startTimestamp = browsingTimestamp
  }
  // settings
  else if (pathname.startsWith('/settings')) {
    presenceData.details = 'Adjusting Preferences'
    presenceData.state = 'Settings'
    presenceData.startTimestamp = browsingTimestamp
  }
  // admin panel
  else if (pathname.startsWith('/admin')) {
    presenceData.details = 'Managing Site'
    presenceData.state = 'Admin Panel'
    presenceData.startTimestamp = browsingTimestamp
  }
  // private pages — clear activity
  else if (
    pathname.startsWith('/auth')
    || pathname.startsWith('/onboarding')
    || pathname.startsWith('/reset-password')
    || pathname.startsWith('/update-password')
    || pathname.startsWith('/integration')
  ) {
    return presence.clearActivity()
  }
  // home feed
  else if (pathname.startsWith('/home')) {
    presenceData.details = 'Looking for Anime'
    presenceData.state = 'Browsing Home'
    presenceData.startTimestamp = browsingTimestamp
  }
  // landing page
  else if (pathname === '/') {
    presenceData.details = 'Looking for Anime'
    presenceData.state = 'Browsing Voxani'
    presenceData.startTimestamp = browsingTimestamp
  }
  // anything else
  else {
    presenceData.details = 'Browsing Voxani'
    presenceData.state = 'Exploring'
    presenceData.startTimestamp = browsingTimestamp
  }

  if (presenceData.details) {
    presence.setActivity(presenceData)
  }
  else {
    presence.clearActivity()
  }
})
