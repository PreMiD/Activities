import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '1261749481976889397',
})

const DEFAULT_ASSETS = {
  logo: 'https://i.ibb.co/21RstdWc/Soya-1-1.png',
  play: Assets.Play,
  pause: Assets.Pause,
  lyrics: Assets.Reading,
}

let pageStartTime = Math.floor(Date.now() / 1000)
let lastPath = ''

function parseDuration(val: string): number {
  if (!val)
    return 0
  const parts = val.trim().split(':').map(Number)
  const p0 = parts[0] ?? 0
  const p1 = parts[1] ?? 0
  const p2 = parts[2] ?? 0
  if (parts.length === 2)
    return p0 * 60 + p1
  if (parts.length === 3)
    return p0 * 3600 + p1 * 60 + p2
  return 0
}

async function updatePresence(): Promise<void> {
  const { pathname, href } = document.location

  if (pathname !== lastPath) {
    lastPath = pathname
    pageStartTime = Math.floor(Date.now() / 1000)
  }

  const [showServer, showVoiceChannel, showButtons, showTimestamps] = await Promise.all([
    presence.getSetting<boolean>('showServer'),
    presence.getSetting<boolean>('showVoiceChannel'),
    presence.getSetting<boolean>('showButtons'),
    presence.getSetting<boolean>('showTimestamps'),
  ])

  if (pathname === '/' || pathname === '') {
    const homeData: PresenceData = {
      type: ActivityType.Listening,
      largeImageKey: DEFAULT_ASSETS.logo,
      largeImageText: 'Soya Music',
      details: 'Exploring Soya',
      state: 'High Fidelity Discord Music Bot',
      startTimestamp: pageStartTime,
    }

    if (showButtons) {
      homeData.buttons = [
        { label: 'Visit Website', url: 'https://soyamusic.in' },
        { label: 'Invite Soya Bot', url: 'https://soyamusic.in/invite' },
      ]
    }

    presence.setActivity(homeData)
    return
  }

  const bridge = document.getElementById('soya-presence-bridge')
  const bridgeActive = bridge?.getAttribute('data-active') === 'true'

  let active = false
  let playing = false
  let title = ''
  let artist = ''
  let duration = 0
  let position = 0
  let thumbnail = ''
  let serverName = ''
  let serverId = ''
  let voiceChannel = ''
  let queueSize = 0
  let loopMode = 'off'
  let volume = 100
  let lyricsOpen = false

  if (bridgeActive && bridge) {
    title = bridge.getAttribute('data-title') || ''
    if (title && !title.includes('No track')) {
      active = true
      playing = bridge.getAttribute('data-playing') === 'true'
      artist = bridge.getAttribute('data-artist') || ''
      duration = Number(bridge.getAttribute('data-duration') || 0)
      position = Number(bridge.getAttribute('data-position') || 0)
      thumbnail = bridge.getAttribute('data-thumbnail') || ''
      serverName = bridge.getAttribute('data-server-name') || ''
      serverId = bridge.getAttribute('data-server-id') || ''
      voiceChannel = bridge.getAttribute('data-voice-channel') || ''
      queueSize = Number(bridge.getAttribute('data-queue-size') || 0)
      loopMode = bridge.getAttribute('data-loop-mode') || 'off'
      volume = Number(bridge.getAttribute('data-volume') || 100)
      lyricsOpen = bridge.getAttribute('data-lyrics-open') === 'true'
    }
  }
  else {
    const playerBar = document.querySelector('div.fixed.bottom-5')
    if (playerBar) {
      const playBtn = playerBar.querySelector('button[aria-label="Play"]')
      const pauseBtn = playerBar.querySelector('button[aria-label="Pause"]')

      if (playBtn || pauseBtn) {
        playing = Boolean(pauseBtn)

        const marquees = playerBar.querySelectorAll('[class*="Marquee"], span.font-semibold')
        const m0 = marquees[0]?.textContent?.trim()
        const m1 = marquees[1]?.textContent?.trim()

        if (m0 && !m0.includes('No track')) {
          title = m0
          artist = m1 || ''
          active = true
        }

        const img = playerBar.querySelector<HTMLImageElement>('img')
        if (img?.src)
          thumbnail = img.src

        const breadcrumb = document.querySelector('nav[aria-label="breadcrumb"] li:last-child, [class*="BreadcrumbPage"]')
        if (breadcrumb?.textContent)
          serverName = breadcrumb.textContent.trim()

        const times = playerBar.querySelectorAll('span.tabular-nums')
        const t0 = times[0]?.textContent
        const t1 = times[1]?.textContent
        if (t0 && t1) {
          position = parseDuration(t0) * 1000
          duration = parseDuration(t1) * 1000
        }
      }
    }
  }

  if (!lyricsOpen) {
    lyricsOpen = Boolean(
      document.querySelector('button[aria-label="Close lyrics view"], div[class*="lyricsOverlay"], button[title*="Live Lyrics"][class*="bg-primary"]'),
    )
  }

  const displayServer = showServer && serverName && serverName !== 'Server' ? serverName : ''

  const data: PresenceData = {
    type: ActivityType.Listening,
    largeImageKey: thumbnail || DEFAULT_ASSETS.logo,
    largeImageText: displayServer ? `Server: ${displayServer}` : 'Soya Music',
  }

  if (active && title) {
    data.details = title

    const parts: string[] = []
    if (!playing) {
      parts.push('Paused')
      if (artist && artist !== 'Soya Music')
        parts.push(artist)
    }
    else {
      if (artist && artist !== 'Soya Music')
        parts.push(`by ${artist}`)
      if (lyricsOpen)
        parts.push('Live Lyrics')
      else if (showVoiceChannel && voiceChannel)
        parts.push(voiceChannel)
    }

    data.state = parts.length ? parts.join(' • ') : playing ? 'Listening to Soya' : 'Paused'

    if (lyricsOpen) {
      data.smallImageKey = DEFAULT_ASSETS.lyrics
      data.smallImageText = 'Live Lyrics'
    }
    else if (playing) {
      data.smallImageKey = DEFAULT_ASSETS.play
      const tags: string[] = ['Playing']
      if (volume < 100)
        tags.push(`Vol: ${volume}%`)
      if (loopMode === 'track')
        tags.push('Repeat Track')
      if (loopMode === 'queue')
        tags.push('Repeat Queue')
      if (queueSize > 0)
        tags.push(`Queue: ${queueSize}`)
      data.smallImageText = tags.join(' • ')
    }
    else {
      data.smallImageKey = DEFAULT_ASSETS.pause
      data.smallImageText = 'Paused'
    }

    if (playing && showTimestamps && duration > 0) {
      const now = Math.floor(Date.now() / 1000)
      const start = now - Math.floor(position / 1000)
      const end = start + Math.floor(duration / 1000)
      if (end > start) {
        data.startTimestamp = start
        data.endTimestamp = end
      }
    }

    if (showButtons) {
      const playerUrl = serverId ? `https://soyamusic.in/dashboard/${serverId}/webplayer` : href
      data.buttons = [
        { label: 'Listen on Web Player', url: playerUrl },
        { label: 'Invite Soya Bot', url: 'https://soyamusic.in/invite' },
      ]
    }

    presence.setActivity(data)
    return
  }

  if (pathname.includes('/webplayer')) {
    data.details = 'Web Player'
    data.state = displayServer ? `Connected to ${displayServer}` : 'Idle'
    data.startTimestamp = pageStartTime

    if (showButtons) {
      data.buttons = [
        { label: 'Open Web Player', url: href },
        { label: 'Invite Soya Bot', url: 'https://soyamusic.in/invite' },
      ]
    }

    presence.setActivity(data)
    return
  }

  const routes: [RegExp, string, string][] = [
    [/\/dashboard\/[^/]+\/audio/, 'Audio Settings', displayServer || 'Equalizer & Filters'],
    [/\/dashboard\/[^/]+\/settings/, 'Server Settings', displayServer || 'Configuration'],
    [/\/dashboard\/[^/]+\/commands/, 'Commands', displayServer || 'Management'],
    [/\/dashboard\/profile\/playlists/, 'Playlists', 'Personal Library'],
    [/\/dashboard\/profile\/history/, 'Listening History', 'Recent Tracks'],
    [/\/dashboard\/profile/, 'User Profile', 'Dashboard'],
    [/\/dashboard\/[^/]+$/, 'Server Dashboard', displayServer || 'Overview'],
    [/\/dashboard/, 'Server Directory', 'Dashboard'],
    [/\/status/, 'System Status', 'Cluster & Shards'],
    [/\/commands/, 'Command Reference', 'Documentation'],
    [/\/premium/, 'Premium Tiers', 'Perks & Features'],
  ]

  const match = routes.find(([regex]) => regex.test(pathname))
  if (match) {
    data.details = match[1]
    data.state = match[2]
    data.startTimestamp = pageStartTime

    if (showButtons) {
      data.buttons = [
        { label: 'Open Dashboard', url: 'https://soyamusic.in/dashboard' },
        { label: 'Invite Soya Bot', url: 'https://soyamusic.in/invite' },
      ]
    }

    presence.setActivity(data)
    return
  }

  data.details = 'Exploring Soya'
  data.state = 'High Fidelity Discord Music Bot'
  data.startTimestamp = pageStartTime

  if (showButtons) {
    data.buttons = [
      { label: 'Visit Website', url: 'https://soyamusic.in' },
      { label: 'Invite Soya Bot', url: 'https://soyamusic.in/invite' },
    ]
  }

  presence.setActivity(data)
}

let updateTimer: number | null = null
function queueFastUpdate() {
  if (updateTimer)
    return
  updateTimer = window.setTimeout(() => {
    updateTimer = null
    updatePresence()
  }, 100)
}

presence.on('UpdateData', async () => {
  await updatePresence()
})

if (typeof window !== 'undefined') {
  window.addEventListener('soya:presence-update', queueFastUpdate)
  window.addEventListener('popstate', queueFastUpdate)

  const originalPush = history.pushState
  history.pushState = function (...args) {
    originalPush.apply(this, args)
    queueFastUpdate()
  }

  const originalReplace = history.replaceState
  history.replaceState = function (...args) {
    originalReplace.apply(this, args)
    queueFastUpdate()
  }

  const observer = new MutationObserver(() => {
    queueFastUpdate()
  })

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['data-playing', 'data-title', 'data-position', 'data-lyrics-open'],
  })
}
