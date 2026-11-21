import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1481368310590210119',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/V/Voxani/assets/logo.png',
}

function normalizeWatchSlug(raw: string): string {
  let value = decodeURIComponent(raw || '').trim()

  if (!value)
    return ''

  if (value.startsWith('legacy:')) {
    const params = new URLSearchParams(value.slice('legacy:'.length))
    value = params.get('default') || value
  }

  if (value.startsWith('kenjitsu:')) {
    const params = new URLSearchParams(value.slice('kenjitsu:'.length))
    value = params.get('kaido') || params.get('default') || params.get('anizone') || value
  }

  if (value.includes('?ep='))
    value = value.split('?ep=')[0] || value

  if (value.includes('$episode$'))
    value = value.split('$episode$')[0] || value

  value = value.replace(/-episode-\d+$/i, '')
  value = value.replace(/-\d+$/, '')

  return value
}

// helper: turn a url slug like "one-piece-100" into "One Piece"
function formatSlug(raw: string): string {
  return normalizeWatchSlug(raw)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

// helper: try to pull a clean anime name from document.title
// Title format: "Watch {Name} Online Free — Stream in HD — Voxani"
//            or "Watch {Name} Online Free — English Sub & Dub — Voxani"
function getNameFromTitle(slugName: string): string {
  const title = document.title
  // New format: starts with "Watch " and contains " Online Free"
  if (title.startsWith('Watch ') && title.includes(' Online Free')) {
    const titleName = title.replace(/^Watch\s+/i, '').split(/\s+Online Free/i)[0]?.trim() || ''
    if (!titleName)
      return ''
    const a = titleName.toLowerCase().replace(/[^a-z0-9]/g, '')
    const b = slugName.toLowerCase().replace(/[^a-z0-9]/g, '')
    return (a && b && a.includes(b.slice(0, 8))) ? titleName : ''
  }
  // Legacy format fallback: "Name - Watch Online"
  if (title.includes(' - Watch Online')) {
    const titleName = title.split(' - Watch Online')[0]?.trim() || ''
    const a = titleName.toLowerCase().replace(/[^a-z0-9]/g, '')
    const b = slugName.toLowerCase().replace(/[^a-z0-9]/g, '')
    return (a && b && a.includes(b.slice(0, 8))) ? titleName : ''
  }
  return ''
}

function cleanTabText(raw: string): string {
  if (!raw)
    return ''
  let text = raw.trim()

  // 1. Remove trailing numbers / count badges like "51", "(51)", "[51]"
  text = text.replace(/[\s\d()[\]]+$/g, '').trim()

  // 2. Remove duplicated words caused by sr-only text / icon labels (e.g. "WatchingWatching" -> "Watching")
  const half = Math.floor(text.length / 2)
  if (half >= 3 && text.slice(0, half).toLowerCase() === text.slice(half).toLowerCase()) {
    text = text.slice(0, half)
  }

  // 3. Normalize known tab names
  const lower = text.toLowerCase()
  if (lower.includes('watching'))
    return 'Watching'
  if (lower.includes('completed'))
    return 'Completed'
  if (lower.includes('plan'))
    return 'Plan to Watch'
  if (lower.includes('hold'))
    return 'On Hold'
  if (lower.includes('dropped'))
    return 'Dropped'
  if (lower.includes('for you'))
    return 'For You'
  if (lower.includes('ai rec') || lower.includes('recommendation'))
    return 'AI Recs'
  if (lower === 'all')
    return 'All'

  return text
}

let browsingTimestamp = Math.floor(Date.now() / 1000)
let lastPath = ''

// ── Embed Player (Player4Me) postMessage Tracking ───────────────────────────
let embedCurrentTime = 0
let embedDuration = 0
let embedIsPlaying = false
let lastEmbedTimeUpdate = 0
let embedListenerAttached = false
let lastEmbedSrc = ''

function resetEmbedState() {
  embedCurrentTime = 0
  embedDuration = 0
  embedIsPlaying = false
  lastEmbedTimeUpdate = 0
}

function parseEmbedMessage(data: unknown): any {
  if (!data)
    return null
  if (typeof data === 'string') {
    try {
      return JSON.parse(data)
    }
    catch {
      return { event: data }
    }
  }
  return typeof data === 'object' ? data : null
}

function getEmbedEventName(payload: any): string {
  const nested = typeof payload?.data === 'object' ? payload.data : null
  return String(
    payload?.event
    || payload?.type
    || payload?.name
    || payload?.action
    || payload?.message
    || payload?.playerStatus
    || payload?.status
    || nested?.event
    || nested?.type
    || nested?.playerStatus
    || nested?.status
    || '',
  ).toLowerCase()
}

function getEmbedNumber(payload: any, keys: string[]): number | null {
  const nested = typeof payload?.data === 'object' ? payload.data : null
  for (const key of keys) {
    const value = payload?.[key] ?? nested?.[key]
    const numberValue = Number(value)
    if (Number.isFinite(numberValue) && numberValue >= 0)
      return numberValue
  }
  return null
}

function ensureEmbedListener() {
  if (embedListenerAttached)
    return
  embedListenerAttached = true

  window.addEventListener('message', (event: MessageEvent) => {
    const payload = parseEmbedMessage(event.data)
    if (!payload)
      return

    const eventName = getEmbedEventName(payload)
    const current = getEmbedNumber(payload, ['currentTime', 'current_time', 'current', 'time', 'seconds', 'position'])
    const total = getEmbedNumber(payload, ['duration', 'durationSeconds', 'duration_seconds', 'total'])

    if (current != null) {
      if (current > embedCurrentTime + 0.1 || Math.abs(current - embedCurrentTime) > 2) {
        embedIsPlaying = true
        lastEmbedTimeUpdate = Date.now()
      }
      embedCurrentTime = current
    }

    if (total != null && total > 0) {
      embedDuration = total
    }

    if (['playing', 'play'].includes(eventName)) {
      embedIsPlaying = true
      lastEmbedTimeUpdate = Date.now()
    }
    else if (['paused', 'pause'].includes(eventName)) {
      embedIsPlaying = false
    }
    else if (['ended', 'end', 'complete', 'completed', 'finish', 'finished'].includes(eventName)) {
      embedIsPlaying = false
    }
  })
}

presence.on('UpdateData', async () => {
  const { pathname, href } = document.location
  const showButtons = await presence.getSetting<boolean>('showPresenceButtons')

  // reset timer on SPA navigation
  if (pathname !== lastPath) {
    browsingTimestamp = Math.floor(Date.now() / 1000)
    resetEmbedState()
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
    // Target only the main player video, not the hidden thumbnail video (which has preload="none")
    const video = document.querySelector<HTMLVideoElement>('video:not([preload="none"])')
    delete presenceData.smallImageKey
    delete presenceData.smallImageText

    const slugName = formatSlug(pathname.split('/')[2] || '')
    const animeName = getNameFromTitle(slugName)
      // Fallback: anime title button in the WatchPage header (lines 1168-1175 WatchPage.tsx)
      || document.querySelector<HTMLButtonElement>('button.font-semibold.text-left.text-foreground')?.textContent?.trim()
      || slugName || 'Anime'

    // data-poster is set by React after hydration; guard against empty string from SSR initial render
    const poster = document.querySelector('[data-poster]')?.getAttribute('data-poster')
    if (poster && poster.startsWith('http'))
      presenceData.largeImageKey = poster

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
      if (epTitle)
        presenceData.state = epTitle
      const sMatch = animeName.match(/Season\s+(\d+)/i)
      presenceData.largeImageText = `Season ${sMatch ? sMatch[1] || '1' : '1'}, Episode ${epNum}`
    }

    // playback state
    // Detect embed source: if no native <video> is present, check for <iframe>
    const embedIframe = document.querySelector<HTMLIFrameElement>('iframe')
    const isEmbedSource = !video && Boolean(embedIframe)

    if (video) {
      if (!video.paused && video.readyState > 0) {
        presenceData.smallImageKey = Assets.Play
        presenceData.smallImageText = 'Playing'
        if (Number.isFinite(video.duration) && video.duration > 0) {
          // Full progress bar: start + end timestamps
          ;[presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(
            Math.floor(video.currentTime),
            Math.floor(video.duration),
          )
        }
        else {
          // Duration not yet loaded — show elapsed video time counting up
          presenceData.startTimestamp = Math.floor(Date.now() / 1000) - Math.floor(video.currentTime)
        }
      }
      else {
        presenceData.smallImageKey = Assets.Pause
        presenceData.smallImageText = 'Paused'
        // Show position in episode where user paused
        if (video.currentTime > 0)
          presenceData.startTimestamp = Math.floor(Date.now() / 1000) - Math.floor(video.currentTime)
      }
    }
    else if (isEmbedSource) {
      ensureEmbedListener()

      const currentSrc = embedIframe?.getAttribute('src') || ''
      if (currentSrc && currentSrc !== lastEmbedSrc) {
        resetEmbedState()
        lastEmbedSrc = currentSrc
      }

      // Actively poll iframe for fresh getTime / getStatus
      if (embedIframe?.contentWindow) {
        try {
          embedIframe.contentWindow.postMessage({ command: 'getTime' }, '*')
          embedIframe.contentWindow.postMessage({ command: 'getStatus' }, '*')
        }
        catch { /* ignore cross-origin restrictions */ }
      }

      // If playing status hasn't received a time update in > 4s, treat as paused
      if (embedIsPlaying && lastEmbedTimeUpdate > 0 && Date.now() - lastEmbedTimeUpdate > 4000) {
        embedIsPlaying = false
      }

      if (embedDuration > 0 && embedCurrentTime >= 0) {
        if (embedIsPlaying) {
          presenceData.smallImageKey = Assets.Play
          presenceData.smallImageText = 'Playing'
          ;[presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(
            Math.floor(embedCurrentTime),
            Math.floor(embedDuration),
          )
        }
        else {
          presenceData.smallImageKey = Assets.Pause
          presenceData.smallImageText = 'Paused'
          if (embedCurrentTime > 0) {
            presenceData.startTimestamp = Math.floor(Date.now() / 1000) - Math.floor(embedCurrentTime)
          }
        }
      }
      else {
        presenceData.smallImageKey = Assets.Play
        presenceData.smallImageText = 'Streaming'
        presenceData.startTimestamp = browsingTimestamp
      }
    }
    else {
      // Video not yet loaded
      presenceData.startTimestamp = browsingTimestamp
    }

    if (showButtons)
      presenceData.buttons = [{ label: 'Watch Episode', url: href }]

  // anime detail
  }
  else if (pathname.startsWith('/anime/')) {
    const slugName = formatSlug(pathname.split('/')[2] || '')
    const title = getNameFromTitle(slugName)
      || document.querySelector('h1.font-display')?.textContent?.trim()
      || slugName || 'Anime'

    const poster = document.querySelector('[data-poster]')?.getAttribute('data-poster')
    if (poster)
      presenceData.largeImageKey = poster

    presenceData.details = 'Looking'
    presenceData.state = title
    presenceData.startTimestamp = browsingTimestamp

    if (showButtons)
      presenceData.buttons = [{ label: 'View Anime', url: href }]

  // search
  }
  else if (pathname.startsWith('/search') || pathname.startsWith('/image-search')) {
    presenceData.details = 'Searching Anime'
    presenceData.state = 'Exploring Catalog'
    presenceData.smallImageKey = Assets.Search
    presenceData.startTimestamp = browsingTimestamp

  // trending
  }
  else if (pathname.startsWith('/trending')) {
    // find the active timeframe tab
    const activeBtn = document.querySelector('button[class*="bg-primary"]')
    const txt = cleanTabText(activeBtn?.textContent?.trim() || '')
    presenceData.details = 'Trending Anime'
    presenceData.state = ['Today', 'This Week', 'This Month', 'All Time'].includes(txt) ? txt : 'What\'s Hot Right Now'
    presenceData.startTimestamp = browsingTimestamp

  // profile
  }
  else if (pathname === '/profile' || pathname.startsWith('/user/') || pathname.startsWith('/@')) {
    let userName = ''
    if (pathname.startsWith('/@'))
      userName = decodeURIComponent(pathname.substring(2))
    else if (pathname.startsWith('/user/'))
      userName = decodeURIComponent(pathname.split('/')[2] || '')

    if (!userName) {
      const t = document.querySelector<HTMLElement>('span[class*="text-muted"]')?.textContent?.trim() || ''
      if (t.startsWith('@') && t.length > 2)
        userName = t.substring(1)
    }

    presenceData.details = 'Viewing Profile'
    presenceData.state = userName ? `@${userName}` : 'My Profile'
    presenceData.startTimestamp = browsingTimestamp

  // my lists / favorites
  }
  else if (pathname.startsWith('/favorites') || pathname.startsWith('/my-lists')) {
    // active tab: mobile uses data-state, desktop uses bg-white class
    const activeTab = document.querySelector('[data-state="active"]')
      ?? document.querySelector('button[class*="bg-primary"][class*="text-primary-foreground"]')
      ?? document.querySelector('button[class*="bg-white"][class*="text-black"]')
    const rawTab = activeTab?.textContent?.trim() || ''
    const tab = cleanTabText(rawTab)
    const isFavorites = pathname.startsWith('/favorites')

    presenceData.details = 'Browsing Library'
    presenceData.state = tab
      ? `${isFavorites ? 'Favorites' : 'My Lists'} · ${tab}`
      : (isFavorites ? 'Favorites' : 'My Lists')
    presenceData.startTimestamp = browsingTimestamp

  // collections (uses radix Tabs with data-state + desktop sidebar buttons)
  }
  else if (pathname.startsWith('/collections')) {
    // mobile: TabsTrigger with data-state="active"
    // desktop: sidebar button with bg-primary class
    const mobileActive = document.querySelector('[role="tablist"] [data-state="active"]')
    const desktopActive = document.querySelector('button[class*="bg-primary"][class*="text-primary-foreground"]')
    const rawTab = mobileActive?.textContent?.trim() || desktopActive?.textContent?.trim() || ''
    const tab = cleanTabText(rawTab)

    presenceData.details = 'Browsing Library'
    presenceData.state = tab ? `Collections · ${tab}` : 'Collections'
    presenceData.startTimestamp = browsingTimestamp

  // playlists
  }
  else if (pathname.startsWith('/playlists') || pathname.startsWith('/playlist/') || pathname.startsWith('/p/')) {
    presenceData.details = 'Browsing Library'
    // single playlist view: h1 has the playlist name (font-black or font-bold class)
    // list view (/playlists): h1 says "My Playlists"
    if (pathname.startsWith('/playlist/') || pathname.startsWith('/p/')) {
      const name = document.querySelector('h1')?.textContent?.trim() || ''
      presenceData.state = name || 'Playlist'
    }
    else {
      presenceData.state = 'My Playlists'
    }
    presenceData.startTimestamp = browsingTimestamp

  // continue watching
  }
  else if (pathname.startsWith('/continue-watching')) {
    presenceData.details = 'Browsing Library'
    presenceData.state = 'Continue Watching'
    presenceData.startTimestamp = browsingTimestamp

  // community
  }
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

  // character page
  }
  else if (pathname.startsWith('/char/')) {
    presenceData.details = document.querySelector<HTMLElement>('h1')?.textContent?.trim() || 'Character'
    presenceData.state = 'Viewing Character'
    presenceData.startTimestamp = browsingTimestamp

  // tier lists
  }
  else if (pathname.startsWith('/tierlists') || pathname.startsWith('/tierlist')) {
    presenceData.details = 'Community Rankings'
    presenceData.state = 'Viewing Tier Lists'
    presenceData.startTimestamp = browsingTimestamp

  // ai recs
  }
  else if (pathname.startsWith('/recommendations')) {
    presenceData.details = 'AI Recommendations'
    presenceData.state = 'Discovering Anime'
    presenceData.startTimestamp = browsingTimestamp

  // genre browsing
  }
  else if (pathname.startsWith('/genre/')) {
    presenceData.details = 'Exploring Genre'
    presenceData.state = formatSlug(pathname.split('/')[2] || '') || 'Genre'
    presenceData.startTimestamp = browsingTimestamp

  // scene search (trace.moe)
  }
  else if (pathname.startsWith('/trace')) {
    presenceData.details = 'Trace.moe Search'
    presenceData.state = 'Finding Scene'
    presenceData.startTimestamp = browsingTimestamp

  // stats / wrapped
  }
  else if (pathname.startsWith('/stats') || pathname.startsWith('/wrapped')) {
    presenceData.details = 'Viewing Statistics'
    presenceData.state = 'Voxani Wrapped'
    presenceData.startTimestamp = browsingTimestamp

  // language filter
  }
  else if (pathname.startsWith('/languages')) {
    presenceData.details = 'Language Filter'
    presenceData.state = pathname.split('/')[2]
      ? formatSlug(pathname.split('/')[2]!)
      : 'Browsing Languages'
    presenceData.startTimestamp = browsingTimestamp

  // settings
  }
  else if (pathname.startsWith('/settings')) {
    presenceData.details = 'Adjusting Preferences'
    presenceData.state = 'Settings'
    presenceData.startTimestamp = browsingTimestamp

  // admin panel
  }
  else if (pathname.startsWith('/admin')) {
    presenceData.details = 'Managing Site'
    presenceData.state = 'Admin Panel'
    presenceData.startTimestamp = browsingTimestamp

  // private pages — clear activity
  }
  else if (
    pathname.startsWith('/auth')
    || pathname.startsWith('/onboarding')
    || pathname.startsWith('/reset-password')
    || pathname.startsWith('/update-password')
    || pathname.startsWith('/integration')
  ) {
    return presence.clearActivity()

  // home / landing page (/ is the main app; /home redirects to /)
  }
  else if (pathname === '/' || pathname.startsWith('/home')) {
    presenceData.details = 'Looking for Anime'
    presenceData.state = 'Browsing Voxani'
    presenceData.startTimestamp = browsingTimestamp

  // anything else
  }
  else {
    presenceData.details = 'Browsing Voxani'
    presenceData.state = 'Exploring'
    presenceData.startTimestamp = browsingTimestamp
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else
    presence.clearActivity()
})
